import { RequestAPI } from "TypeScriptBenriKakuchou/Web/RequestApi";
import { キャンバスメタデータ, 描画キャンバスデータ, 描画キャンバスJSON } from "../描画キャンバス/データクラス";
import { CanvasDeleteResponse, CanvasListResponse, CanvasLoadResponse, キャンバス保存レスポンス } from "../描画キャンバス/CanvasResponse";
import { I描画キャンバスAPIリポジトリ } from "./I描画キャンバスAPIリポジトリ";

export class 描画キャンバスAPIリポジトリ implements I描画キャンバスAPIリポジトリ {
    private readonly _endpoint = "BoomYack/SaveLoad";
    public constructor(public readonly isAvailable: boolean) {}

    public async 保存(data: 描画キャンバスデータ): Promise<キャンバス保存レスポンス> {
        return RequestAPI.postRequest2<キャンバス保存レスポンス>(`${this._endpoint}/save`, {
            canvasId: typeof data.metadata.id === "string" ? data.metadata.id : data.metadata.id.id,
            data: data.toJSON(),
        }).catch(error => {
            console.error("キャンバス保存エラー:", error);
            return { success: false, message: `保存に失敗しました: ${error.message}` };
        });
    }

    public async 読み込み(canvasId: string | { id: string }): Promise<描画キャンバスJSON | null> {
        return RequestAPI.postRequest2<CanvasLoadResponse>(`${this._endpoint}/load`, {
            canvasId: typeof canvasId === "string" ? canvasId : canvasId.id,
        }).then(response => response.success ? response.data : null).catch(error => {
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
        return RequestAPI.postRequest2<CanvasDeleteResponse>(`${this._endpoint}/delete`, {
            canvasId: typeof canvasId === "string" ? canvasId : canvasId.id,
        }).catch(error => {
            console.error("キャンバス削除エラー:", error);
            return { success: false, message: `削除に失敗しました: ${error.message}` };
        });
    }
}
