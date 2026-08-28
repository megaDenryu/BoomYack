import { Toast } from "OneONetUIComponents/Toast/Toast";
import { 描画キャンバスローカルリポジトリ } from "BoomYack/基本オブジェクト/API/描画キャンバスAPIリポジトリ";
import { I描画キャンバスAPIリポジトリ } from "BoomYack/基本オブジェクト/API/I描画キャンバスAPIリポジトリ";
import { ISavePanelEvents, SaveMode } from "BoomYack/基本オブジェクト/キャンバス操作/セーブパネル";
import { 描画キャンバスデータ } from "BoomYack/基本オブジェクト/描画キャンバス/データクラス";
import { CanvasView } from "BoomYack/基本オブジェクト/描画キャンバス/描画キャンバスView分解/CanvasView";

export function セーブパネルイベントを作る(
    view: () => CanvasView,
    api: I描画キャンバスAPIリポジトリ,
    local: 描画キャンバスローカルリポジトリ
): ISavePanelEvents {
    return {
        onSave: async (name: string, mode: SaveMode) => {
            view().setCanvasIdAndName(安全なID(name), name);
            if (mode === "server") {
                // サーバー側がrevisionを照合する。競合 (外部で更新済み) やボード既存は
                // ここで失敗として表示し、無言で上書きしない
                const 結果 = await view().persistence.save(view().canvasId);
                if (結果.success) Toast.success("保存しました");
                else Toast.error(結果.message);
            } else view().persistence.localSave(view().canvasId);
        },
        onLoad: async (id: string, mode: SaveMode) => {
            view().setCanvasId(id);
            if (mode === "server") await view().persistence.load(view().canvasId);
            else view().persistence.localLoad(view().canvasId);
        },
        onDelete: async (id: string, mode: SaveMode) => {
            if (mode === "server") await api.削除(id);
            else local.削除(id);
        },
        onRefreshList: async (mode: SaveMode) => mode === "server" ? await api.一覧取得() : local.一覧取得(),
        onGetCurrentCanvasData: () => view().persistence.serialize(),
        onGetCanvasDataById: async (id: string, mode: SaveMode) => {
            const json = mode === "server" ? await api.読み込み(id) : local.読み込み(id);
            return json ? 描画キャンバスデータ.fromJSON(json) : null;
        },
        onSaveCanvasData: async (data: 描画キャンバスデータ) => { local.保存(data); },
        onIsServerModeAvailable: () => api.isAvailable
    };
}

function 安全なID(name: string): string {
    return name.replace(/[<>:"/\\|?*]/g, "_").trim() || "untitled";
}
