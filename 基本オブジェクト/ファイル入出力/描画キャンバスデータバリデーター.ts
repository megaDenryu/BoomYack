import { FileOperationResult, JSONファイル } from "TypeScriptBenriKakuchou/FileSystem/ファイル/拡張子付きファイル/JSONファイル";
import { 描画キャンバスデータ } from "../描画キャンバス/データクラス";
import { キャンバスJSONか, キャンバスデータへ変換する } from "./描画キャンバスデータ検証";

export class 描画キャンバスデータバリデーター {
    public async execute(data: JSONファイル): Promise<FileOperationResult<描画キャンバスデータ>> {
        const parsed = await data.loadAndParse(キャンバスJSONか);
        if (!parsed.success) {
            return {
                success: false,
                error: `キャンバスデータ読み込みエラー: ${parsed.error}`
            };
        }
        return キャンバスデータへ変換する(parsed.data);
    }
}
