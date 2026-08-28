// ボード操作サービス (issue #4) の検証。メモリ上のリポジトリ偽物を注入し、
// 編集コマンドの適用・整合性ルール・一括適用の原子性・revisionの単調増加を確かめる。

import { describe, it, expect } from 'vitest';
import { ボード操作サービス } from '../src/ボード操作/ボード操作サービス';
import type { ボード保存リポジトリ, ボード一覧項目JSON } from '../src/ボード操作/ボード保存リポジトリ';
import type { 最新版ボードJSON, 最新版付箋JSON } from '../src/保存形式/最新版保存形式';

class メモリリポジトリ implements ボード保存リポジトリ {
    public readonly 保存庫 = new Map<string, unknown>();
    public 書き込み回数 = 0;

    public async 一覧を取得する(): Promise<readonly ボード一覧項目JSON[]> {
        return [...this.保存庫.values()].map(x => x as ボード一覧項目JSON);
    }
    public async 生データを読み込む(ボードID: string): Promise<unknown | null> {
        return this.保存庫.get(ボードID) ?? null;
    }
    public async 最新版ボードを書き込む(ボードID: string, ボード: 最新版ボードJSON): Promise<void> {
        this.書き込み回数 += 1;
        this.保存庫.set(ボードID, JSON.parse(JSON.stringify(ボード)));
    }
    public async 削除する(ボードID: string): Promise<void> {
        this.保存庫.delete(ボードID);
    }
}

function サービスを作る() {
    const リポジトリ = new メモリリポジトリ();
    let 連番 = 0;
    const サービス = new ボード操作サービス({
        リポジトリ,
        IDを生成する: () => `id-${++連番}`,
        現在時刻をISO文字列で得る: () => '2026-08-29T00:00:00.000Z',
    });
    return { サービス, リポジトリ };
}

async function 付箋2枚のボードを作る(サービス: ボード操作サービス) {
    const 作成 = await サービス.ボードを新規作成する('テストボード');
    if (作成.kind !== '成功') throw new Error('作成失敗');
    const 追加 = await サービス.編集コマンドを一括適用する(作成.ボード.id, 0, [
        { kind: '付箋を追加する', 付箋ID: 'note-a', コンテンツ: { 種別: '自由テキスト', text: 'A' } },
        { kind: '付箋を追加する', 付箋ID: 'note-b', コンテンツ: { 種別: '自由テキスト', text: 'B' } },
        { kind: '接続を追加する', 矢印ID: 'edge-1', from付箋ID: 'note-a', to付箋ID: 'note-b' },
    ]);
    if (追加.kind !== '成功') throw new Error(`追加失敗: ${追加.kind}`);
    return 追加.ボード;
}

describe('ボード操作サービス', () => {
    it('新規作成したボードは revision 0 で保存され、一覧と読込に現れる', async () => {
        const { サービス } = サービスを作る();
        const 作成 = await サービス.ボードを新規作成する('新しいボード');
        expect(作成.kind).toBe('成功');
        if (作成.kind !== '成功') return;
        expect(作成.ボード.revision).toBe(0);
        expect((await サービス.ボード一覧を取得する()).map(x => x.name)).toEqual(['新しいボード']);
        const 読込 = await サービス.ボードを読み込む(作成.ボード.id);
        expect(読込.kind).toBe('成功');
    });

    it('付箋追加は自動配置と既定値で埋まり、接続追加は接続参照付きの折れ線矢印になる', async () => {
        const { サービス } = サービスを作る();
        const ボード = await 付箋2枚のボードを作る(サービス);
        const 付箋 = ボード.配置物リスト.find(x => x.id === 'note-b') as 最新版付箋JSON;
        expect(付箋.設定状態.背景色).toBe('#ffffd0');
        expect(付箋.position.x).toBeGreaterThan(0);
        const 矢印 = ボード.配置物リスト.find(x => x.id === 'edge-1');
        expect(矢印).toMatchObject({
            type: '折れ線矢印',
            startRef: { 配置物ID: 'note-a', 接続位置: '右' },
            endRef: { 配置物ID: 'note-b', 接続位置: '左' },
        });
    });

    it('付箋を削除すると、その付箋を参照する矢印も一緒に消える', async () => {
        const { サービス } = サービスを作る();
        const ボード = await 付箋2枚のボードを作る(サービス);
        const 削除 = await サービス.編集コマンドを適用する(ボード.id, 1, { kind: '付箋を削除する', 付箋ID: 'note-a' });
        expect(削除.kind).toBe('成功');
        if (削除.kind !== '成功') return;
        expect(削除.ボード.配置物リスト.map(x => x.id)).toEqual(['note-b']);
    });

    it('一括適用は途中で失敗したら何も保存しない (原子性)', async () => {
        const { サービス, リポジトリ } = サービスを作る();
        const ボード = await 付箋2枚のボードを作る(サービス);
        const 書き込み回数前 = リポジトリ.書き込み回数;
        const 結果 = await サービス.編集コマンドを一括適用する(ボード.id, 1, [
            { kind: '付箋を追加する', 付箋ID: 'note-c', コンテンツ: { 種別: '自由テキスト', text: 'C' } },
            { kind: '接続を追加する', 矢印ID: 'edge-x', from付箋ID: 'note-c', to付箋ID: '存在しない付箋' },
        ]);
        expect(結果).toEqual({ kind: '対象不在', 対象の種類: '付箋', 対象ID: '存在しない付箋' });
        expect(リポジトリ.書き込み回数).toBe(書き込み回数前);
        const 読み直し = await サービス.ボードを読み込む(ボード.id);
        if (読み直し.kind !== '成功') return;
        expect(読み直し.ボード.配置物リスト.find(x => x.id === 'note-c')).toBeUndefined();
    });

    it('保存のたびに revision が 1 ずつ増える', async () => {
        const { サービス } = サービスを作る();
        const ボード = await 付箋2枚のボードを作る(サービス);
        expect(ボード.revision).toBe(1);
        const 更新 = await サービス.編集コマンドを適用する(ボード.id, 1, {
            kind: '付箋を更新する', 付箋ID: 'note-a', コンテンツ: { 種別: 'タイトル付き', タイトル: '題', 本文: '文' },
        });
        if (更新.kind !== '成功') return;
        expect(更新.ボード.revision).toBe(2);
    });

    it('不在のボードへの操作はボード不在になる', async () => {
        const { サービス } = サービスを作る();
        expect((await サービス.ボードを読み込む('ghost')).kind).toBe('ボード不在');
        expect((await サービス.ボードを削除する('ghost', 0)).kind).toBe('ボード不在');
    });
});
