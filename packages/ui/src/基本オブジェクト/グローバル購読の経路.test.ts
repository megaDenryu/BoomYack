import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * ボードの外(window/document・サーバーの更新通知・繰り返しのタイマー)への購読が、必ずボード購読台帳を通ることを
 * ソースの文字列で検査する。台帳を通らない購読は、ボードを閉じても解除されずに残るためである。
 * 検査するのは packages/ui/src 配下のテスト以外の .ts だけであり、実行時に文字列を組み立てて呼ぶ形は検出しない。
 */
const 検査の根 = join(dirname(fileURLToPath(import.meta.url)), "..");

function ソースの一覧(ディレクトリ: string): string[] {
    return readdirSync(ディレクトリ, { withFileTypes: true }).flatMap(項目 => {
        const パス = join(ディレクトリ, 項目.name);
        if (項目.isDirectory()) return ソースの一覧(パス);
        return 項目.name.endsWith(".ts") && !項目.name.endsWith(".test.ts") ? [パス] : [];
    });
}

// 台帳を通さずにドラッグ中だけ document へ張る例外。ポインタを離したときに外すため、ボードを閉じた後には残らない。
const ドラッグ中だけ張ってよいファイル = ["曲線のドラッグ.ts"];

function 違反を集める(): { 違反: string[]; 検査したファイル数: number } {
    const ファイル一覧 = ソースの一覧(検査の根);
    const 違反 = ファイル一覧.flatMap(パス => {
        const 名前 = basename(パス);
        return readFileSync(パス, "utf-8").split("\n").flatMap((行, 番号) => {
            const 場所 = `${名前}:${番号 + 1}`;
            const 見つけたもの: string[] = [];
            if (/\b(window|document)\.addEventListener\(/.test(行) && 名前 !== "グローバルイベント購読.ts")
                見つけたもの.push(`${場所} window/documentへ直接addEventListenerしている`);
            if (/new EventSource\(/.test(行) && 名前 !== "ボード外部更新の受信.ts")
                見つけたもの.push(`${場所} EventSourceをボード外部更新の受信の外で開いている`);
            if (/\bsetInterval\(/.test(行))
                見つけたもの.push(`${場所} setIntervalはボードを閉じても止まらない。台帳へ登録できる型にする`);
            if (/グローバルイベント購読\.作成する\(/.test(行) && !/として登録する\(/.test(行) && !ドラッグ中だけ張ってよいファイル.includes(名前))
                見つけたもの.push(`${場所} 作ったグローバルイベント購読をボード購読台帳へ渡していない`);
            return 見つけたもの;
        });
    });
    return { 違反, 検査したファイル数: ファイル一覧.length };
}

describe("グローバル購読の経路", () => {
    it("window/document・EventSource・setIntervalへの購読がボード購読台帳を通っている", () => {
        const { 違反, 検査したファイル数 } = 違反を集める();
        expect(検査したファイル数).toBeGreaterThan(100);
        expect(違反).toEqual([]);
    });
});
