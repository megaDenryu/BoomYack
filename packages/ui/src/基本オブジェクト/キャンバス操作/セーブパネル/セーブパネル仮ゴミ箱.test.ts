/**
 * @vitest-environment jsdom
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { Toast } from "OneONetUIComponents/index";
import { キャンバスID } from "../../ID";
import { キャンバスメタデータ } from "../../描画キャンバス/キャンバスメタデータ";
import { ボード購読台帳 } from "../../ボード購読台帳";
import { セーブパネル仮ゴミ箱 } from "./セーブパネル仮ゴミ箱";

describe("セーブパネル仮ゴミ箱 とボードを閉じたとき", () => {
    afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

    it("ボードを閉じた(台帳を解除した)後は、ページが隠れても閉じてもゴミ箱の中身を削除しない", () => {
        vi.spyOn(Toast, "withUndo").mockImplementation(() => "");
        localStorage.setItem("canvas_data_案A", "{}");
        const 台帳 = new ボード購読台帳();
        const 削除 = vi.fn(async () => {});
        const ゴミ箱 = new セーブパネル仮ゴミ箱({ onDelete: 削除, onUpdate: () => {} }, 台帳);
        ゴミ箱.moveToTrash(キャンバスメタデータ.create(new キャンバスID("案A"), "案A"), "local");

        台帳.すべて解除する();
        Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
        document.dispatchEvent(new Event("visibilitychange"));
        window.dispatchEvent(new Event("beforeunload"));

        expect(削除).not.toHaveBeenCalled();
        expect(localStorage.getItem("canvas_data_案A")).toBe("{}");
    });

    it("ウインドウが隠れても(最小化を含む)ゴミ箱の中身を削除せず、ページを閉じたときだけ削除する", () => {
        vi.spyOn(Toast, "withUndo").mockImplementation(() => "");
        localStorage.setItem("canvas_data_案C", "{}");
        const ゴミ箱 = new セーブパネル仮ゴミ箱({ onDelete: async () => {}, onUpdate: () => {} }, new ボード購読台帳());
        ゴミ箱.moveToTrash(キャンバスメタデータ.create(new キャンバスID("案C"), "案C"), "local");

        Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
        document.dispatchEvent(new Event("visibilitychange"));
        expect(localStorage.getItem("canvas_data_案C")).toBe("{}");
        window.dispatchEvent(new Event("beforeunload"));
        expect(localStorage.getItem("canvas_data_案C")).toBeNull();
    });

    it("ボードを閉じた後に、お知らせの「元に戻す」を押しても例外にならず、ゴミ箱から出す", () => {
        let 元に戻す: () => void = () => {};
        vi.spyOn(Toast, "withUndo").mockImplementation((_文, 戻す) => { 元に戻す = 戻す; return ""; });
        const 復元の知らせ = vi.spyOn(Toast, "success").mockImplementation(() => "");
        const 台帳 = new ボード購読台帳();
        const ゴミ箱 = new セーブパネル仮ゴミ箱({ onDelete: async () => {}, onUpdate: () => {} }, 台帳);
        ゴミ箱.moveToTrash(キャンバスメタデータ.create(new キャンバスID("案B"), "案B"), "local");

        台帳.すべて解除する();
        expect(() => 元に戻す()).not.toThrow();
        expect(ゴミ箱.has("案B")).toBe(false);
        expect(復元の知らせ).toHaveBeenCalledTimes(1);
    });
});
