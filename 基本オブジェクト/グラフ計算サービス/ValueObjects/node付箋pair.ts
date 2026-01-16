import { 描画座標点 } from "SengenUI/index";
// ========================================
// Value Object: node付箋のペア
// ========================================

import { テキスト用グラフノード, 付箋text } from "BoomYack/基本オブジェクト/描画キャンバス/配置物グラフ/テキスト化情報";
import { 矢印接続可能付箋Old } from "BoomYack/基本オブジェクト/配置物/付箋2/矢印接続可能付箋Old";


export class node付箋pair {
    public constructor(
        public readonly node: テキスト用グラフノード<付箋text>,
        public readonly 付箋: 矢印接続可能付箋Old<描画座標点>
    ) {}
}