// round-trip / forward write / 不正データの各カテゴリ (issue #9)。
// - round-trip: 最新版を書き出して読み戻しても情報が失われない
// - forward write: 旧版を読み込んで保存すると最新版へ正規化される
// - 不正データ: 型付きの失敗が返り、何が不正かが理由に含まれる

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { 保存JSONから最新版ボードを読み込む } from '../src/保存形式/保存JSONから読み込む';
import { is最新版ボードJSON } from '../src/保存形式/最新版型ガード';

function fixtureを読む(ファイル名: string): unknown {
    return JSON.parse(readFileSync(fileURLToPath(new URL(`./fixtures/${ファイル名}`, import.meta.url)), 'utf-8'));
}

function 移行済みボードを得る(ファイル名: string) {
    const 結果 = 保存JSONから最新版ボードを読み込む(fixtureを読む(ファイル名));
    if (結果.kind !== '成功') throw new Error(`読み込み失敗: ${結果.理由}`);
    return 結果.ボード;
}

describe('round-trip', () => {
    it.each(['旧版_text付箋とまっすぐ矢印.json', '旧版_コンテンツ付箋と現行矢印.json'])(
        '%s: 最新版を書き出して読み戻すと移行なしで同一の値になる',
        ファイル名 => {
            const 最新版 = 移行済みボードを得る(ファイル名);
            const 読み戻し = 保存JSONから最新版ボードを読み込む(JSON.parse(JSON.stringify(最新版)));
            expect(読み戻し.kind).toBe('成功');
            if (読み戻し.kind !== '成功') return;
            expect(読み戻し.移行した).toBe(false);
            expect(読み戻し.ボード).toEqual(最新版);
        },
    );
});

describe('forward write', () => {
    it('旧版を読み込んだ結果は最新版の型ガードを通過する (書き出しは常に最新形式)', () => {
        const 最新版 = 移行済みボードを得る('旧版_text付箋とまっすぐ矢印.json');
        expect(is最新版ボードJSON(JSON.parse(JSON.stringify(最新版)))).toBe(true);
    });
});

describe('不正データ', () => {
    it('未知の配置物typeは型付きの失敗になり、理由に位置とtypeが含まれる', () => {
        const 結果 = 保存JSONから最新版ボードを読み込む(fixtureを読む('不正_未知の配置物type.json'));
        expect(結果.kind).toBe('保存データ不正');
        if (結果.kind !== '保存データ不正') return;
        expect(結果.理由).toContain('配置物リスト[1]');
        expect(結果.理由).toContain('謎の図形');
    });

    it('オブジェクトでない入力は型付きの失敗になる', () => {
        const 結果 = 保存JSONから最新版ボードを読み込む(null);
        expect(結果.kind).toBe('保存データ不正');
    });

    it('メタ情報が欠落した入力は型付きの失敗になる', () => {
        const 結果 = 保存JSONから最新版ボードを読み込む({ version: '1.0.0' });
        expect(結果.kind).toBe('保存データ不正');
        if (結果.kind !== '保存データ不正') return;
        expect(結果.理由).toContain('メタ情報');
    });
});
