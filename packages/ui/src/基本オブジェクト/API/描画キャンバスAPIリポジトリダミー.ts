import { キャンバス保存レスポンス } from "../描画キャンバス/CanvasResponse";
import { 描画キャンバスデータ, 描画キャンバスJSON, キャンバスメタデータ } from "../描画キャンバス/データクラス";
import { I描画キャンバスAPIリポジトリ } from "./I描画キャンバスAPIリポジトリ";

/**
 * サーバー保存機能が利用できない場合に使用するダミーAPIリポジトリ
 * すべての操作は何もせず、失敗を示す値を返す
 */
export class 描画キャンバスAPIリポジトリダミー implements I描画キャンバスAPIリポジトリ {
    public readonly isAvailable: boolean = false;

    public async 保存(data: 描画キャンバスデータ): Promise<キャンバス保存レスポンス> {
        return { success: false, message: "サーバーが利用できないため保存できません" };
    }

    public async 読み込み(canvasId: string | { id: string }): Promise<描画キャンバスJSON | null> {
        return null;
    }

    public async 一覧取得(): Promise<キャンバスメタデータ[]> {
        return [];
    }

    public async 削除(canvasId: string | { id: string }): Promise<{ success: boolean; message: string }> {
        return { success: false, message: "サーバーが利用できないため削除できません" };
    }
}
