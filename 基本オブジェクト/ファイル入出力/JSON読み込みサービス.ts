import { 描画キャンバスデータ, I描画キャンバスJSON } from "../描画キャンバス/データクラス";
import { FileOperationResult } from "TypeScriptBenriKakuchou/FileSystem/ファイル/拡張子付きファイル/JSONファイル";
import { DropFileLoader } from "TypeScriptBenriKakuchou/FileSystem/ローダー/DropFileLoader";
import { 描画キャンバスデータバリデーター } from "./描画キャンバスデータバリデーター";

// 今後ほかのデータ型も扱う
export type バリデーション結果 =
    | { typeName: "描画キャンバスデータ"; data: 描画キャンバスデータ }
    | { typeName: "エラー"; error: string };

export class JSON読み込みサービス {
    private readonly dropFileLoader: DropFileLoader;
    private readonly 描画キャンバスデータバリデーター: 描画キャンバスデータバリデーター;
    public constructor(
        dropFileLoader: DropFileLoader,
        描画キャンバスデータバリデーター: 描画キャンバスデータバリデーター
    ) {
        this.dropFileLoader = dropFileLoader;
        this.描画キャンバスデータバリデーター = 描画キャンバスデータバリデーター;
    }

    /**
     * ドラッグ&ドロップからの読み込み
     * UI層とのインターフェース
     */
    public async ドロップイベントから読み込み(
        event: DragEvent
    ): Promise<バリデーション結果> {
        const jsonFileResult = await this.dropFileLoader.ドロップイベントからJsonファイル読み込み(event);
        try {
            if (!jsonFileResult.success) {return { typeName: "エラー", error: `ファイル読み込みエラー: ${jsonFileResult.error}` };}
            const result = await this.描画キャンバスデータバリデーター.execute(jsonFileResult.data);
            if (result.success) {return { typeName: "描画キャンバスデータ", data: result.data }; }
            return { typeName: "エラー", error: "バリデーションに失敗しました" };

        } catch (error) {
            return { 
                typeName: "エラー", 
                error: error instanceof Error 
                    ? `予期しないエラー: ${error.message}` 
                    : "システムエラーが発生しました" 
            };
        }
    }
}

