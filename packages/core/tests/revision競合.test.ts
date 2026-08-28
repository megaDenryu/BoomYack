// concurrencyカテゴリ (issue #5・#9): 同じrevisionから2つの書き手が書いた場合、
// 片方だけ成功しもう片方はrevision競合になることを検証する。

import { describe, it, expect } from 'vitest';
import { ボード操作サービス } from '../src/ボード操作/ボード操作サービス';
import type { ボード保存リポジトリ, ボード一覧項目JSON } from '../src/ボード操作/ボード保存リポジトリ';
import type { 最新版ボードJSON } from '../src/保存形式/最新版保存形式';

class メモリリポジトリ implements ボード保存リポジトリ {
    private readonly 保存庫 = new Map<string, unknown>();
    public async 一覧を取得する(): Promise<readonly ボード一覧項目JSON[]> { return []; }
    public async 生データを読み込む(ボードID: string): Promise<unknown | null> { return this.保存庫.get(ボードID) ?? null; }
    public async 最新版ボードを書き込む(ボードID: string, ボード: 最新版ボードJSON): Promise<void> {
        this.保存庫.set(ボードID, JSON.parse(JSON.stringify(ボード)));
    }
    public async 削除する(ボードID: string): Promise<void> { this.保存庫.delete(ボードID); }
}

function サービスを作る(): ボード操作サービス {
    let 連番 = 0;
    return new ボード操作サービス({
        リポジトリ: new メモリリポジトリ(),
        IDを生成する: () => `id-${++連番}`,
        現在時刻をISO文字列で得る: () => '2026-08-29T00:00:00.000Z',
    });
}

async function ボードを用意する(サービス: ボード操作サービス): Promise<最新版ボードJSON> {
    const 作成 = await サービス.ボードを新規作成する('競合テスト');
    if (作成.kind !== '成功') throw new Error('作成失敗');
    return 作成.ボード;
}

describe('revisionによる楽観ロック', () => {
    it('同じrevisionからの2回目の書き込みはrevision競合になる', async () => {
        const サービス = サービスを作る();
        const ボード = await ボードを用意する(サービス);
        const 書き手1 = await サービス.編集コマンドを適用する(ボード.id, ボード.revision,
            { kind: '付箋を追加する', 付箋ID: 'note-1', コンテンツ: { 種別: '自由テキスト', text: '先勝ち' } });
        expect(書き手1.kind).toBe('成功');
        const 書き手2 = await サービス.編集コマンドを適用する(ボード.id, ボード.revision,
            { kind: '付箋を追加する', 付箋ID: 'note-2', コンテンツ: { 種別: '自由テキスト', text: '後負け' } });
        expect(書き手2).toEqual({ kind: 'revision競合', ボードID: ボード.id, expectedRevision: 0, 現在のrevision: 1 });
    });

    it('競合した側は読み直したrevisionでやり直せば成功する', async () => {
        const サービス = サービスを作る();
        const ボード = await ボードを用意する(サービス);
        await サービス.編集コマンドを適用する(ボード.id, 0,
            { kind: '付箋を追加する', 付箋ID: 'note-1', コンテンツ: { 種別: '自由テキスト', text: 'A' } });
        const 読み直し = await サービス.ボードを読み込む(ボード.id);
        if (読み直し.kind !== '成功') throw new Error('読み直し失敗');
        const やり直し = await サービス.編集コマンドを適用する(ボード.id, 読み直し.ボード.revision,
            { kind: '付箋を追加する', 付箋ID: 'note-2', コンテンツ: { 種別: '自由テキスト', text: 'B' } });
        expect(やり直し.kind).toBe('成功');
    });

    it('名前変更と削除もrevision照合を通る', async () => {
        const サービス = サービスを作る();
        const ボード = await ボードを用意する(サービス);
        expect((await サービス.ボード名を変更する(ボード.id, 99, '新名')).kind).toBe('revision競合');
        expect((await サービス.ボードを削除する(ボード.id, 99)).kind).toBe('revision競合');
        expect((await サービス.ボード名を変更する(ボード.id, 0, '新名')).kind).toBe('成功');
        expect((await サービス.ボードを削除する(ボード.id, 1)).kind).toBe('成功');
    });
});
