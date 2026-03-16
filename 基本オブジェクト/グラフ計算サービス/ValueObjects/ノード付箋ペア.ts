import { 描画座標点 } from "SengenUI/index";
// ========================================
// Value Object: node付箋のペア
// ========================================

import { テキスト用グラフノード, 付箋text } from "BoomYack/基本オブジェクト/描画キャンバス/配置物グラフ/テキスト化情報";
import { 付箋集約 } from "BoomYack/基本オブジェクト/配置物/付箋2/付箋集約";


export class ノード付箋ペア {
    public constructor(
        public readonly node: テキスト用グラフノード<付箋text>,
        public readonly 付箋: 付箋集約<描画座標点>
    ) {}
}