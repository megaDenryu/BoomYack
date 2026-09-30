/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toast } from "OneONetUIComponents/Toast/Toast";
import { I描画キャンバスAPIリポジトリ } from "BoomYack/基本オブジェクト/API/I描画キャンバスAPIリポジトリ";
import { ボード外部更新の受信 } from "BoomYack/基本オブジェクト/API/ボード外部更新の受信";
import { StickyGraphBoard } from "./付箋グラフボード";

class 数えるEventSource {
    public static 開いている一覧: 数えるEventSource[] = [];
    public onmessage: ((event: { data: string }) => void) | null = null;
    public onerror: (() => void) | null = null;
    public constructor(public readonly url: string) { 数えるEventSource.開いている一覧.push(this); }
    public close(): void { 数えるEventSource.開いている一覧 = 数えるEventSource.開いている一覧.filter(接続 => 接続 !== this); }
    public 通知を送る(通知: object): void { this.onmessage?.({ data: JSON.stringify(通知) }); }
}

const サーバーのリポジトリ: I描画キャンバスAPIリポジトリ = {
    isAvailable: true, 保存: async () => ({ success: true, message: "", revision: 1 }), 読み込み: async () => null,
    一覧取得: async () => [], 削除: async () => ({ success: true, message: "" }), 記録済みrevision: () => null,
};

function ボードを作る(外部更新の受信: ボード外部更新の受信): StickyGraphBoard {
    const ボード = new StickyGraphBoard({ apiリポジトリ: サーバーのリポジトリ, 外部更新の受信 });
    document.body.appendChild(ボード.dom.element);
    return ボード;
}

describe("StickyGraphBoard の外部更新の受信の共有", () => {
    beforeEach(() => {
        数えるEventSource.開いている一覧 = [];
        vi.stubGlobal("EventSource", 数えるEventSource);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        document.body.innerHTML = "";
    });

    it("受信を共有する2枚のボードは接続を1本だけ開き、裏のボードは受けた知らせを操作対象に戻ったときに出す", () => {
        const 受信 = new ボード外部更新の受信();
        const 知らせ = vi.spyOn(Toast, "success").mockImplementation(() => "");
        const 一枚目 = ボードを作る(受信);
        const 二枚目 = ボードを作る(受信);
        expect(数えるEventSource.開いている一覧.length).toBe(1);

        一枚目.操作対象から外す();
        数えるEventSource.開いている一覧[0].通知を送る({ boardId: "sticky-graph-board", revision: 5, 種別: "保存", source: "mcp" });
        expect(知らせ).toHaveBeenCalledTimes(1);
        一枚目.操作対象にする();
        expect(知らせ).toHaveBeenCalledTimes(2);

        一枚目.delete();
        expect(数えるEventSource.開いている一覧.length).toBe(1);
        二枚目.delete();
        expect(数えるEventSource.開いている一覧.length).toBe(0);
    });
});
