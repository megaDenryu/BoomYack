import { I描画キャンバスJSON } from "../描画キャンバス/データクラス";
import { レコードとして扱えるか } from "../オブジェクト型ガード";

export function ローカルキャンバスデータを検証する(data: unknown): data is I描画キャンバスJSON {
    if (!レコードとして扱えるか(data)) return false;
    if (typeof data.id !== "string" || data.id.trim() === "") return false;
    if (typeof data.name !== "string" || typeof data.version !== "string") return false;
    if (typeof data.createdAt !== "string" || typeof data.updatedAt !== "string") return false;
    if (!レコードとして扱えるか(data.描画原点)) return false;
    if (typeof data.描画原点.x !== "number" || typeof data.描画原点.y !== "number") return false;
    return Array.isArray(data.配置物リスト);
}
