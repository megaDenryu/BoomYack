import { Canvas座標Base, LV2HtmlComponentBase, 配置物座標点 } from "SengenUI/index";
import { I配置物集約 } from "./I配置物集約";
import { I点と線のリポジトリ } from "./I矢印共通";

export interface Iまっすぐ矢印集約 extends I配置物集約 {
    type: "まっすぐ矢印";
    readonly view: Iまっすぐ矢印View;
    readonly vm: Iまっすぐ矢印VM;
}

export interface Iまっすぐ矢印VM {
}

export interface Iまっすぐ矢印View extends LV2HtmlComponentBase {
}

export interface I矢印集約<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> extends I配置物集約, I点と線のリポジトリ<座標点T> {
    type: "まっすぐ矢印";
}
