import { FudabaAPIクライアント } from "../../Fudaba連携/FudabaAPIクライアント";
import { Fudaba札DTO } from "../../Fudaba連携/Fudaba札DTO";
import { 付箋コンテンツView構築データ } from "./I付箋コンテンツView";

export interface 札参照コンテンツView依存関係 extends 付箋コンテンツView構築データ {
    初期札ID: string;
    fudabaAPIクライアント: FudabaAPIクライアント;
}

export type 札参照表示状態 =
    | { 種別: "読込中" }
    | { 種別: "解決済み"; 札: Fudaba札DTO }
    | { 種別: "参照解決不可"; 理由: string };
