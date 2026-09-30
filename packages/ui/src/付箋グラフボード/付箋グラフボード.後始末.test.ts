/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I描画キャンバスAPIリポジトリ } from "BoomYack/基本オブジェクト/API/I描画キャンバスAPIリポジトリ";
import { StickyGraphBoard } from "./付箋グラフボード";

// window/document へ張られている購読を数える。後始末の漏れを、張った数と外した数の差で見る。
class 張られている購読の記録 {
    private readonly 一覧: { 対象: EventTarget; 種類: string; 受けたときの処理: unknown; キャプチャか: boolean }[] = [];

    public 見張る(対象: Window | Document): void {
        const 元のadd = 対象.addEventListener.bind(対象);
        const 元のremove = 対象.removeEventListener.bind(対象);
        vi.spyOn(対象, "addEventListener").mockImplementation((種類, 受けたときの処理, オプション?) => {
            this.一覧.push({ 対象, 種類, 受けたときの処理, キャプチャか: キャプチャか(オプション) });
            元のadd(種類, 受けたときの処理, オプション);
        });
        vi.spyOn(対象, "removeEventListener").mockImplementation((種類, 受けたときの処理, オプション?) => {
            const 位置 = this.一覧.findIndex(項目 => 項目.対象 === 対象 && 項目.種類 === 種類
                && 項目.受けたときの処理 === 受けたときの処理 && 項目.キャプチャか === キャプチャか(オプション));
            if (位置 >= 0) this.一覧.splice(位置, 1);
            元のremove(種類, 受けたときの処理, オプション);
        });
    }

    public get 件数(): number { return this.一覧.length; }
    public 種類の一覧(): string[] { return this.一覧.map(項目 => 項目.種類).sort(); }
}

function キャプチャか(オプション: boolean | EventListenerOptions | undefined): boolean {
    return typeof オプション === "boolean" ? オプション : オプション?.capture === true;
}

class 数えるEventSource {
    public static 開いている一覧: 数えるEventSource[] = [];
    public onmessage: ((event: { data: string }) => void) | null = null;
    public onerror: (() => void) | null = null;
    public constructor(public readonly url: string) { 数えるEventSource.開いている一覧.push(this); }
    public close(): void { 数えるEventSource.開いている一覧 = 数えるEventSource.開いている一覧.filter(接続 => 接続 !== this); }
}

const サーバーのリポジトリ: I描画キャンバスAPIリポジトリ = {
    isAvailable: true, 保存: async () => ({ success: true, message: "", revision: 1 }), 読み込み: async () => null,
    一覧取得: async () => [], 削除: async () => ({ success: true, message: "" }), 記録済みrevision: () => null,
};

function ボードを作る(操作開始の通知先 = { ボードが操作され始めた: vi.fn() }): StickyGraphBoard {
    const ボード = new StickyGraphBoard({ apiリポジトリ: サーバーのリポジトリ, 操作開始の通知先 });
    document.body.appendChild(ボード.dom.element);
    return ボード;
}

// ピンチの追跡(SengenUI の文書のポインタ追跡)が、ピンチを受けるキャンバスのために張る document の購読。
const ピンチの追跡の購読 = ["pointercancel", "pointerdown", "pointermove", "pointerup"];

describe("StickyGraphBoard の後始末と操作対象", () => {
    let 記録: 張られている購読の記録;

    beforeEach(() => {
        数えるEventSource.開いている一覧 = [];
        vi.stubGlobal("EventSource", 数えるEventSource);
        記録 = new 張られている購読の記録();
        記録.見張る(window);
        記録.見張る(document);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        document.body.innerHTML = "";
    });

    it("delete() で、window/document への購読と更新通知の受信がすべて解除され、保存データの削除は呼ばれない", () => {
        const 削除 = vi.spyOn(サーバーのリポジトリ, "削除");
        const ボード = ボードを作る();
        expect(記録.件数).toBeGreaterThan(0);
        expect(数えるEventSource.開いている一覧.length).toBe(1);

        ボード.delete();

        expect(記録.種類の一覧()).toEqual([]);
        expect(数えるEventSource.開いている一覧.length).toBe(0);
        expect(削除).not.toHaveBeenCalled();
    });

    it("操作対象から外すと、キー操作・ホイール・ポインタの購読が外れ、常に動く購読とピンチの追跡だけが残る", () => {
        const ボード = ボードを作る();
        ボード.操作対象から外す();
        expect(記録.種類の一覧()).toEqual(["beforeunload", ...ピンチの追跡の購読, "resize"].sort());
        expect(数えるEventSource.開いている一覧.length).toBe(1);

        ボード.操作対象にする();
        expect(記録.種類の一覧()).toEqual(expect.arrayContaining(["keydown", "keydown", "pointermove"]));
        ボード.delete();
    });

    it("2枚のボードがあるとき、キー操作の購読は操作対象のボードのぶんだけ張られる", () => {
        const keydownの件数 = (): number => 記録.種類の一覧().filter(種類 => 種類 === "keydown").length;
        const 一枚目 = ボードを作る();
        const 二枚目 = ボードを作る();
        expect(keydownの件数()).toBe(4);

        一枚目.操作対象から外す();
        expect(keydownの件数()).toBe(2);
        二枚目.delete();
        expect(keydownの件数()).toBe(0);
        一枚目.操作対象にする();
        expect(keydownの件数()).toBe(2);
        一枚目.delete();
        expect(記録.件数).toBe(0);
    });

    it("操作対象でないボードの中を押したときだけ、通知先へ操作が始まったことを知らせる", () => {
        const 通知先 = { ボードが操作され始めた: vi.fn() };
        const ボード = ボードを作る(通知先);
        ボード.dom.element.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
        expect(通知先.ボードが操作され始めた).not.toHaveBeenCalled();
        ボード.操作対象から外す();
        ボード.dom.element.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
        expect(通知先.ボードが操作され始めた).toHaveBeenCalledTimes(1);
        ボード.delete();
    });
});
