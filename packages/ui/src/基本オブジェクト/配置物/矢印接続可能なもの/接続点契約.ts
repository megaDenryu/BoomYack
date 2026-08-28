import { Canvas座標Base, 配置物座標点 } from "SengenUI/index";

import type { 付箋ID } from "../../ID";
import type { 矢印接続可能なもの } from "./矢印接続可能なもの";

export interface I接続点親情報<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> {
    get 配置物ID(): 付箋ID;
    get 矢印接続可能なもの(): 矢印接続可能なもの<座標点T>;
}

export interface I矢印接続可能なもの中央PositionState<
    座標点T extends Canvas座標Base<座標点T> & 配置物座標点
> {
    中央pos: 座標点T;
}
