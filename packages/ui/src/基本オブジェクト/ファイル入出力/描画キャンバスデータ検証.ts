import { FileOperationResult } from "TypeScriptBenriKakuchou/FileSystem/ファイル/拡張子付きファイル/JSONファイル";
import { I描画キャンバスJSON, 描画キャンバスデータ } from "../描画キャンバス/データクラス";
import { レコードとして扱えるか } from "../オブジェクト型ガード";

export const キャンバスJSONか = (obj: unknown): obj is I描画キャンバスJSON => {
    if (!レコードとして扱えるか(obj)) return false;
    return typeof obj.version === "string"
        && typeof obj.id === "string"
        && typeof obj.name === "string"
        && typeof obj.createdAt === "string"
        && typeof obj.updatedAt === "string"
        && obj.描画原点 !== undefined
        && Array.isArray(obj.配置物リスト);
};

export const キャンバスデータへ変換する = (
    json: I描画キャンバスJSON
): FileOperationResult<描画キャンバスデータ> => {
    const invalid = キャンバスドメインエラー(json);
    if (invalid) return { success: false, error: invalid };
    try {
        return { success: true, data: 描画キャンバスデータ.fromJSON(json) };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error
                ? `ドメインオブジェクト変換エラー: ${error.message}`
                : "キャンバスデータの変換に失敗しました"
        };
    }
};

const キャンバスドメインエラー = (json: I描画キャンバスJSON): string | undefined => {
    if (!json.version.trim()) return "キャンバスのバージョン情報が不正です";
    if (!json.id.trim()) return "キャンバスIDが不正です";
    if (!json.name.trim()) return "キャンバス名が不正です";
    if (!Array.isArray(json.配置物リスト)) return "配置物リストの形式が不正です";
    if (json.配置物リスト.length > 1000) return "配置物が多すぎます（最大1000個まで）";
    return undefined;
};
