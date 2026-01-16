import { Px2DVector, 図形内座標点, 描画座標点, 画面座標点 } from "SengenUI/index";

import { I配置物集約, 接触判定可能な点 } from "./I配置物";
import { 折れ線矢印VM } from "./配置物/折れ線矢印/折れ線矢印VM";
import { 折れ線矢印集約 } from "./配置物/折れ線矢印/折れ線矢印集約";
import { 矢印VM } from "./配置物/折れ線矢印/矢印集約";
import { 矢印接続可能付箋Old } from "./配置物/付箋2/矢印接続可能付箋Old";
import { 接続点 } from "./配置物/矢印接続可能なもの/接続点";
export interface I配置物リポジトリ<座標点T extends 図形内座標点 | 描画座標点> {
    配置物リスト: I配置物集約[];
    add付箋(pos: Px2DVector): 矢印接続可能付箋Old<座標点T>;
    add折れ線矢印(折れ線矢印vm:折れ線矢印VM<座標点T>): 折れ線矢印集約<座標点T>;
    接触点を取得(pos: 描画座標点): 接触判定可能な点|null;
    未接続の点ハンドルを接続点と接続をtryする(接続点:接続点<座標点T>):void;
}
