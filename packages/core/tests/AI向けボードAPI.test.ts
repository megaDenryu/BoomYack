// semantic projection / atomic mutation カテゴリ (issue #6・#9)。
// 要約が保存形式へ依存しないこと、一時キーによる原子的なグラフ追加、途中失敗の非保存を検証する。

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { ボード操作サービス } from '../src/ボード操作/ボード操作サービス';
import { AI向けボードサービス } from '../src/AI向けボードAPI/AI向けボードサービス';
import type { ボード保存リポジトリ, ボード一覧項目JSON } from '../src/ボード操作/ボード保存リポジトリ';
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

function サービス一式を作る() {
    const リポジトリ = new メモリリポジトリ();
    let 連番 = 0;
    const IDを生成する = () => `gen-${++連番}`;
    const 操作サービス = new ボード操作サービス({ リポジトリ, IDを生成する, 現在時刻をISO文字列で得る: () => '2026-08-29T00:00:00.000Z' });
    const AIサービス = new AI向けボードサービス({ 操作サービス, IDを生成する });
    return { リポジトリ, 操作サービス, AIサービス };
}

function fixtureを読む(ファイル名: string): unknown {
    return JSON.parse(readFileSync(fileURLToPath(new URL(`./fixtures/${ファイル名}`, import.meta.url)), 'utf-8'));
}

describe('semantic projection', () => {
    it('要約は3種のコンテンツ・背景色・矢印ID付きの接続・未接続数を返し、保存形式のキーを含まない', async () => {
        const { リポジトリ, AIサービス } = サービス一式を作る();
        リポジトリ.保存庫.set('b1', fixtureを読む('旧版_コンテンツ付箋と現行矢印.json'));
        const 結果 = await AIサービス.ボード要約を取得する('b1');
        expect(結果.kind).toBe('成功');
        if (結果.kind !== '成功') return;
        expect(結果.要約.付箋一覧.map(x => x.content.kind).sort()).toEqual(['fudaba_ref', 'text', 'titled']);
        expect(結果.要約.付箋一覧.find(x => x.id === 'note-titled')?.背景色).toBe('#d0e8ff');
        expect(結果.要約.接続一覧).toContainEqual({ 矢印ID: 'arrow-poly-1', from: 'note-free', to: 'note-titled' });
        expect(結果.要約.未接続矢印数).toBe(2);
        expect(JSON.stringify(結果.要約)).not.toContain('配置物リスト');
        expect(JSON.stringify(結果.要約)).not.toContain('種別');
    });

    it('配置付き要約は座標とサイズを持つ', async () => {
        const { リポジトリ, AIサービス } = サービス一式を作る();
        リポジトリ.保存庫.set('b1', fixtureを読む('旧版_コンテンツ付箋と現行矢印.json'));
        const 結果 = await AIサービス.配置付きボード要約を取得する('b1');
        if (結果.kind !== '成功') return;
        expect(結果.要約.付箋一覧.find(x => x.id === 'note-titled')).toMatchObject({ position: { x: 300, y: 0 }, size: { width: 240, height: 140 } });
    });
});

describe('atomic graph mutation', () => {
    it('一時キーで新規付箋同士を接続でき、revision更新は1回だけになる', async () => {
        const { 操作サービス, AIサービス } = サービス一式を作る();
        const 作成 = await 操作サービス.ボードを新規作成する('グラフ');
        if (作成.kind !== '成功') throw new Error('作成失敗');
        const 結果 = await AIサービス.グラフを一括追加する(作成.ボード.id, {
            expectedRevision: 0,
            notes: [
                { key: 'A', content: { kind: 'text', text: '始点' } },
                { key: 'B', content: { kind: 'titled', title: '題', body: '文' }, 背景色: '#ff0000' },
            ],
            edges: [{ from: 'A', to: 'B' }],
        });
        expect(結果.kind).toBe('成功');
        if (結果.kind !== '成功') return;
        expect(結果.revision).toBe(1);
        const 要約 = await AIサービス.ボード要約を取得する(作成.ボード.id);
        if (要約.kind !== '成功') return;
        expect(要約.要約.接続一覧).toEqual([{ 矢印ID: expect.any(String), from: 結果.createdIds.A, to: 結果.createdIds.B }]);
        expect(要約.要約.付箋一覧.find(x => x.id === 結果.createdIds.B)?.背景色).toBe('#ff0000');
    });

    it('不明な端点を含むグラフは全体が失敗し、部分保存されない', async () => {
        const { 操作サービス, AIサービス } = サービス一式を作る();
        const 作成 = await 操作サービス.ボードを新規作成する('グラフ');
        if (作成.kind !== '成功') throw new Error('作成失敗');
        const 結果 = await AIサービス.グラフを一括追加する(作成.ボード.id, {
            expectedRevision: 0,
            notes: [{ key: 'A', content: { kind: 'text', text: 'A' } }],
            edges: [{ from: 'A', to: '存在しない端点' }],
        });
        expect(結果.kind).toBe('対象不在');
        const 読み直し = await 操作サービス.ボードを読み込む(作成.ボード.id);
        if (読み直し.kind !== '成功') return;
        expect(読み直し.ボード.配置物リスト).toEqual([]);
        expect(読み直し.ボード.revision).toBe(0);
    });

    it('一時キーの重複と古いrevisionは型付きの失敗になる', async () => {
        const { 操作サービス, AIサービス } = サービス一式を作る();
        const 作成 = await 操作サービス.ボードを新規作成する('グラフ');
        if (作成.kind !== '成功') throw new Error('作成失敗');
        const 重複 = await AIサービス.グラフを一括追加する(作成.ボード.id, {
            expectedRevision: 0,
            notes: [{ key: 'A', content: { kind: 'text', text: '1' } }, { key: 'A', content: { kind: 'text', text: '2' } }],
            edges: [],
        });
        expect(重複.kind).toBe('一時キー不正');
        const 競合 = await AIサービス.グラフを一括追加する(作成.ボード.id, {
            expectedRevision: 99,
            notes: [{ key: 'A', content: { kind: 'text', text: '1' } }],
            edges: [],
        });
        expect(競合.kind).toBe('revision競合');
    });
});
