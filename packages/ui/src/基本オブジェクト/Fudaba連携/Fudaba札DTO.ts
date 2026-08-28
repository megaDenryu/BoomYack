import { レコードとして扱えるか } from "../オブジェクト型ガード";

/**
 * Fudaba(札場)APIが返す札のDTO。BoomYackはFudabaのUI/MCPパッケージに依存せず、
 * `GET /api/fudaba/items` のレスポンス形状をここで独自に定義する
 * (設計2026-07-14_付箋コンテンツ設計.md 7.1節)。
 * 種別・状態はFudaba側で拡張されうるためリテラル型に絞らずstringで受ける。
 */
export interface Fudaba札DTO {
    readonly id: number;
    readonly 種別: string;
    readonly タイトル: string;
    readonly 本文: string;
    readonly 状態: string;
    readonly 担当者: string | null;
    readonly 作成者: string;
    readonly ルーム名: string | null;
    readonly ラベル一覧: readonly string[];
    readonly 作成時刻: string;
    readonly 更新時刻: string;
}

/**
 * JSON由来の未検証値がFudaba札DTOとして扱える形かを判定する型ガード。
 * 外部境界(fetchのレスポンス)で受け取ったunknownを、ここで初めて型として絞り込む。
 */
export function Fudaba札DTOかどうか判定する(値: unknown): 値 is Fudaba札DTO {
    if (!レコードとして扱えるか(値)) return false;
    if (typeof 値.id !== "number") return false;
    if (typeof 値.種別 !== "string") return false;
    if (typeof 値.タイトル !== "string") return false;
    if (typeof 値.本文 !== "string") return false;
    if (typeof 値.状態 !== "string") return false;
    if (typeof 値.担当者 !== "string" && 値.担当者 !== null) return false;
    if (typeof 値.作成者 !== "string") return false;
    if (typeof 値.ルーム名 !== "string" && 値.ルーム名 !== null) return false;
    if (!Array.isArray(値.ラベル一覧)) return false;
    if (typeof 値.作成時刻 !== "string") return false;
    if (typeof 値.更新時刻 !== "string") return false;
    return true;
}
