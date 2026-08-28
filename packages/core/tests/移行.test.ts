// migrationカテゴリ (issue #9): 旧版fixtureをdecodeすると最新版になることを検証する。

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { 保存JSONから最新版ボードを読み込む } from '../src/保存形式/保存JSONから読み込む';
import { 最新版のversion } from '../src/保存形式/最新版保存形式';
import type { 最新版付箋JSON, 最新版折れ線矢印JSON } from '../src/保存形式/最新版保存形式';

function fixtureを読む(ファイル名: string): unknown {
    return JSON.parse(readFileSync(fileURLToPath(new URL(`./fixtures/${ファイル名}`, import.meta.url)), 'utf-8'));
}

function 成功を要求する(結果: ReturnType<typeof 保存JSONから最新版ボードを読み込む>) {
    if (結果.kind !== '成功') throw new Error(`読み込み失敗: ${結果.理由}`);
    return 結果;
}

describe('旧版text付箋とまっすぐ矢印の移行', () => {
    const 結果 = 成功を要求する(保存JSONから最新版ボードを読み込む(fixtureを読む('旧版_text付箋とまっすぐ矢印.json')));

    it('移行が行われ、versionとrevisionが最新版になる', () => {
        expect(結果.移行した).toBe(true);
        expect(結果.ボード.version).toBe(最新版のversion);
        expect(結果.ボード.revision).toBe(0);
    });

    it('text付箋が自由テキストコンテンツになる', () => {
        const 付箋 = 結果.ボード.配置物リスト.find(x => x.id === 'note-a') as 最新版付箋JSON;
        expect(付箋.コンテンツ).toEqual({ 種別: '自由テキスト', text: '旧形式の付箋A' });
        expect(付箋.設定状態).toEqual({ 背景色: '#ffffd0', 文字サイズ: 14, 文字色: '#000000' });
    });

    it('部分的な設定状態は指定値を保ち、欠落だけ既定値で補完される', () => {
        const 付箋 = 結果.ボード.配置物リスト.find(x => x.id === 'note-b') as 最新版付箋JSON;
        expect(付箋.設定状態).toEqual({ 背景色: '#ffd0d0', 文字サイズ: 14, 文字色: '#000000' });
    });

    it('まっすぐ矢印が中点なしの折れ線矢印になり、接続参照とidを保つ', () => {
        const 矢印 = 結果.ボード.配置物リスト.find(x => x.id === 'arrow-straight-1') as 最新版折れ線矢印JSON;
        expect(矢印.type).toBe('折れ線矢印');
        expect(矢印.中点リスト).toEqual([]);
        expect(矢印.startRef).toEqual({ 配置物ID: 'note-a', 接続位置: '右' });
        expect(矢印.endRef).toEqual({ 配置物ID: 'note-b', 接続位置: '左' });
    });

    it('未接続のまっすぐ矢印も折れ線矢印として残る', () => {
        const 矢印 = 結果.ボード.配置物リスト.find(x => x.id === 'arrow-straight-2') as 最新版折れ線矢印JSON;
        expect(矢印.type).toBe('折れ線矢印');
        expect(矢印.startRef).toBeNull();
    });
});

describe('現行UI形式 (コンテンツ付箋・折れ線・なめらか曲線) の移行', () => {
    const 結果 = 成功を要求する(保存JSONから最新版ボードを読み込む(fixtureを読む('旧版_コンテンツ付箋と現行矢印.json')));

    it('3種のコンテンツと設定状態の色がそのまま保たれる', () => {
        const 付箋一覧 = 結果.ボード.配置物リスト.filter((x): x is 最新版付箋JSON => x.type === '付箋');
        expect(付箋一覧.map(x => x.コンテンツ.種別).sort()).toEqual(['タイトル付き', '札参照', '自由テキスト']);
        const タイトル付き = 付箋一覧.find(x => x.id === 'note-titled');
        expect(タイトル付き?.設定状態.背景色).toBe('#d0e8ff');
    });

    it('middlePoints省略のなめらか曲線矢印は空配列へ正規化される', () => {
        const 矢印 = 結果.ボード.配置物リスト.find(x => x.id === 'arrow-smooth-old');
        expect(矢印).toMatchObject({ type: 'なめらか曲線矢印', middlePoints: [] });
    });

    it('配置物の件数と順序が保たれる', () => {
        expect(結果.ボード.配置物リスト.map(x => x.id)).toEqual([
            'note-free', 'note-titled', 'note-fudaref',
            'arrow-poly-1', 'arrow-smooth-1', 'arrow-smooth-old', 'arrow-poly-unconnected',
        ]);
    });
});
