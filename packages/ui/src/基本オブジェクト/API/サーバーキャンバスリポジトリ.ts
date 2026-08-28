import { RequestAPI } from "TypeScriptBenriKakuchou/Web/RequestApi";
import { キャンバスメタデータ, 描画キャンバスデータ, 描画キャンバスJSON } from "../描画キャンバス/データクラス";
import { CanvasDeleteResponse, CanvasListResponse, CanvasLoadResponse, キャンバス保存レスポンス } from "../描画キャンバス/CanvasResponse";
import { I描画キャンバスAPIリポジトリ } from "./I描画キャンバスAPIリポジトリ";

// サーバー保存は /BoomYack/board/* を経由し、サーバー側 (@boomyack/core) がrevision照合付きで
// 保存する。読み込みで受けたrevisionをこのクラスが記録し、保存時にexpectedRevisionとして
// 送り返す。未読み込みのidへの保存はexpectedRevision: null (新規保存) になり、既存idなら
// サーバーがボード既存で拒否する (他所の変更を無言で上書きしないため)。
export class 描画キャンバスAPIリポジトリ implements I描画キャンバスAPIリポジトリ {
    private readonly _endpoint = "BoomYack/board";
    private readonly revision記録 = new Map<string, number>();
    public constructor(public readonly isAvailable: boolean) {}

    public 記録済みrevision(canvasId: string): number | null {
        return this.revision記録.get(canvasId) ?? null;
    }

    public async 保存(data: 描画キャンバスデータ): Promise<キャンバス保存レスポンス> {
        const canvasId = typeof data.metadata.id === "string" ? data.metadata.id : data.metadata.id.id;
        return RequestAPI.postRequest2<キャンバス保存レスポンス>(`${this._endpoint}/save`, {
            canvasId,
            expectedRevision: this.revision記録.get(canvasId) ?? null,
            data: data.toJSON(),
        }).then(response => {
            if (response.success) this.revision記録.set(canvasId, response.revision);
            return response;
        }).catch(error => {
            console.error("キャンバス保存エラー:", error);
            return { success: false, message: `保存に失敗しました: ${error.message}` };
        });
    }

    public async 読み込み(canvasId: string | { id: string }): Promise<描画キャンバスJSON | null> {
        const id = typeof canvasId === "string" ? canvasId : canvasId.id;
        return RequestAPI.postRequest2<CanvasLoadResponse>(`${this._endpoint}/load`, { canvasId: id })
            .then(response => {
                if (!response.success) return null;
                this.revision記録.set(id, response.revision);
                return response.data;
            }).catch(error => {
                console.error("キャンバス読み込みエラー:", error); return null;
            });
    }

    public async 一覧取得(): Promise<キャンバスメタデータ[]> {
        return RequestAPI.postRequest2<CanvasListResponse>(`${this._endpoint}/list`, {})
            .then(response => response.success
                ? response.items.map(item => キャンバスメタデータ.fromJSON(item)) : [])
            .catch(error => { console.error("キャンバス一覧取得エラー:", error); return []; });
    }

    public async 削除(canvasId: string | { id: string }): Promise<{ success: boolean; message: string }> {
        const id = typeof canvasId === "string" ? canvasId : canvasId.id;
        return RequestAPI.postRequest2<CanvasDeleteResponse>(`${this._endpoint}/delete`, { canvasId: id })
            .then(response => {
                if (response.success) this.revision記録.delete(id);
                return response;
            }).catch(error => {
                console.error("キャンバス削除エラー:", error);
                return { success: false, message: `削除に失敗しました: ${error.message}` };
            });
    }
}
