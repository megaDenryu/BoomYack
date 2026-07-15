import { Canvas座標Base, LV2HtmlComponentBase, 描画基準座標, 配置物座標点 } from "SengenUI/index";
import { 折れ線矢印データ } from "./描画キャンバス/データクラス";
import { I配置物集約, Iシリアライズ可能配置物 } from "./I配置物集約";
import { I始終点矢印集約 } from "./I矢印共通";
import { I点と線のリポジトリ } from "./I矢印共通";

/** 折れ線矢印データに特化したシリアライズインターフェース */
export interface I折れ線矢印シリアライズ可能 extends Iシリアライズ可能配置物<折れ線矢印データ> {}

export interface I折れ線矢印VM {
}

export interface I折れ線矢印View extends LV2HtmlComponentBase {
}

export interface I折れ線矢印集約<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> extends I始終点矢印集約<座標点T>, I点と線のリポジトリ<座標点T> {
    type: "折れ線矢印";
    updateStateFromData(data: 折れ線矢印データ, モデルの描画基準座標: 描画基準座標): void;
}

/** I配置物集約をtype判別子でI折れ線矢印集約へ絞り込む型ガード */
export function is折れ線矢印集約<座標点T extends Canvas座標Base<座標点T> & 配置物座標点>(item: I配置物集約): item is I折れ線矢印集約<座標点T> {
    return item.type === "折れ線矢印";
}
