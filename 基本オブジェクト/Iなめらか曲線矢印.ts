import { Canvas座標Base, LV2HtmlComponentBase, 描画基準座標, 配置物座標点 } from "SengenUI/index";
import { なめらか曲線矢印データ } from "./描画キャンバス/データクラス";
import { Iシリアライズ可能配置物 } from "./I配置物集約";
import { I始終点矢印集約, I点ハンドル } from "./I矢印共通";

export interface Iなめらか曲線矢印集約<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> extends I始終点矢印集約<座標点T> {
    type: "なめらか曲線矢印";
    readonly view: Iなめらか曲線矢印View;
    readonly 始点ハンドル: I点ハンドル<座標点T>;
    readonly 終点ハンドル: I点ハンドル<座標点T>;
    updateStateFromData(data: なめらか曲線矢印データ, モデルの描画基準座標: 描画基準座標): void;
}

export interface Iなめらか曲線矢印VM {
}

export interface Iなめらか曲線矢印View extends LV2HtmlComponentBase {
}

/** なめらか曲線矢印データに特化したシリアライズインターフェース */
export interface Iなめらか曲線矢印シリアライズ可能 extends Iシリアライズ可能配置物<なめらか曲線矢印データ> {}
