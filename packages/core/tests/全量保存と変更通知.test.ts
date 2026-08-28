// UIの全量保存経路 (issue #5 のUI対応) と、保存・削除の変更通知 (issue #8) の検証。

import { describe, it, expect } from 'vitest';
import { ボード操作サービス } from '../src/ボード操作/ボード操作サービス';
import type { ボード保存リポジトリ, ボード一覧項目JSON } from '../src/ボード操作/ボード保存リポジトリ';
import type { ボード変更通知 } from '../src/ボード操作/ボード変更通知';
import type { 最新版ボードJSON } from '../src/保存形式/最新版保存形式';

class メモリリポジトリ implements ボード保存リポジトリ {
    public readonly 保存庫 = new Map<string, unknown>();
    public async 一覧を取得する(): Promise<readonly ボード一覧項目JSON[]> { return []; }
    public async 生データを読み込む(ボードID: string): Promise<unknown | null> { return this.保存庫.get(ボードID) ?? null; }
    public async 最新版ボードを書き込む(ボードID: string, ボード: 最新版ボードJSON): Promise<void> {
        this.保存庫.set(ボードID, JSON.parse(JSON.stringify(ボード)));
    }
    public async 削除する(ボードID: string): Promise<void> { this.保存庫.delete(ボードID); }
}

function サービスを作る() {
    const リポジトリ = new メモリリポジトリ();
    const 受信済み通知: ボード変更通知[] = [];
    let 連番 = 0;
    const サービス = new ボード操作サービス({
        リポジトリ,
        変更通知先: { 変更を受け取る: 通知 => { 受信済み通知.push(通知); } },
        IDを生成する: () => `id-${++連番}`,
        現在時刻をISO文字列で得る: () => '2026-08-29T00:00:00.000Z',
    });
    return { サービス, リポジトリ, 受信済み通知 };
}

const UI形式のボード = (name: string) => ({
    version: '1.0.0',
    id: 'ui-side-id',
    name,
    createdAt: '2026-08-29T00:00:00.000Z',
    updatedAt: '2026-08-29T00:00:00.000Z',
    描画原点: { x: 0, y: 0 },
    配置物リスト: [
        { type: '付箋', id: 'note-1', position: { x: 0, y: 0 }, size: { width: 200, height: 100 }, text: 'UI保存の付箋' },
    ],
});

describe('全量保存', () => {
    it('新規保存は旧形式を受理して最新版 revision 0 で保存し、既存idにはボード既存を返す', async () => {
        const { サービス } = サービスを作る();
        const 新規 = await サービス.新規ボードとして全量保存する('board-1', UI形式のボード('新規'));
        expect(新規.kind).toBe('成功');
        if (新規.kind !== '成功') return;
        expect(新規.ボード.revision).toBe(0);
        expect(新規.ボード.id).toBe('board-1');
        expect(新規.ボード.version).toBe('2.0.0');
        expect((await サービス.新規ボードとして全量保存する('board-1', UI形式のボード('二重'))).kind).toBe('ボード既存');
    });

    it('置き換えはrevision照合を通り、idを正典側で強制する', async () => {
        const { サービス } = サービスを作る();
        await サービス.新規ボードとして全量保存する('board-1', UI形式のボード('初版'));
        const 置き換え = await サービス.ボード全体を置き換える('board-1', 0, UI形式のボード('改版'));
        expect(置き換え.kind).toBe('成功');
        if (置き換え.kind !== '成功') return;
        expect(置き換え.ボード.revision).toBe(1);
        expect(置き換え.ボード.name).toBe('改版');
        expect(置き換え.ボード.id).toBe('board-1');
        expect((await サービス.ボード全体を置き換える('board-1', 0, UI形式のボード('古い'))).kind).toBe('revision競合');
    });

    it('不正な生データは型付きの失敗になり保存されない', async () => {
        const { サービス, リポジトリ } = サービスを作る();
        const 結果 = await サービス.新規ボードとして全量保存する('board-x', { version: '1.0.0' });
        expect(結果.kind).toBe('保存データ不正');
        expect(リポジトリ.保存庫.has('board-x')).toBe(false);
    });
});

describe('変更通知', () => {
    it('保存と削除の成功時に通知が届き、読み込みでは届かない', async () => {
        const { サービス, 受信済み通知 } = サービスを作る();
        const 作成 = await サービス.ボードを新規作成する('通知テスト');
        if (作成.kind !== '成功') throw new Error('作成失敗');
        await サービス.ボードを読み込む(作成.ボード.id);
        await サービス.編集コマンドを適用する(作成.ボード.id, 0, {
            kind: '付箋を追加する', 付箋ID: 'n1', コンテンツ: { 種別: '自由テキスト', text: 'x' },
        });
        await サービス.ボードを削除する(作成.ボード.id, 1);
        expect(受信済み通知).toEqual([
            { boardId: 作成.ボード.id, revision: 0, 種別: '保存' },
            { boardId: 作成.ボード.id, revision: 1, 種別: '保存' },
            { boardId: 作成.ボード.id, revision: 1, 種別: '削除' },
        ]);
    });
});
