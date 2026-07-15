import { Px長さ } from "SengenUI/index";
import { 付箋コンテンツView共通依存関係 } from "./I付箋コンテンツView";

export const タイトルのプレースホルダー = "タイトルを入力...";
export const 本文のプレースホルダー = "本文を入力...";
export const タイトル欄の最小高さ = new Px長さ(30);

export interface タイトル付きコンテンツView依存関係 extends 付箋コンテンツView共通依存関係 {
    初期タイトル: string;
    初期本文: string;
}
