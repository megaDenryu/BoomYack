import { LV2HtmlComponentBase } from "SengenUI/index";
import { 付箋データ } from "./描画キャンバス/データクラス";
import { I配置物集約, Iシリアライズ可能配置物, Iドラッグ移動可能 } from "./I配置物集約";

/** 付箋データに特化したシリアライズインターフェース */
export interface I付箋シリアライズ可能 extends Iシリアライズ可能配置物<付箋データ> {}

export interface I付箋集約 extends I配置物集約 {
    type: "付箋";
    readonly view: I付箋View;
    readonly vm: I付箋VM;
}

export interface I付箋VM {
}

export interface I付箋View extends Iドラッグ移動可能, LV2HtmlComponentBase {
}

export interface I自動リサイズ付箋集約 extends I配置物集約 {
    type: "自動リサイズ付箋";
    readonly view: I自動リサイズ付箋View;
    readonly vm: I自動リサイズ付箋VM;
}

export interface I自動リサイズ付箋VM {
}

export interface I自動リサイズ付箋View extends LV2HtmlComponentBase {
}
