import { Px2DVector, 描画座標点 } from "SengenUI/index";
// ========================================
// Strategy実装: 何もしない前処理（後処理型アルゴリズム用）
// ========================================

import { CanvasGraphModel } from "BoomYack/基本オブジェクト/描画キャンバス/描画キャンバスView分解/CanvasGraphModel";
import { テキスト用グラフノード, 付箋text } from "BoomYack/基本オブジェクト/描画キャンバス/配置物グラフ/テキスト化情報";

import { I前処理位置調整Strategy } from "./IStrategy";

export class 何もしない前処理Strategy implements I前処理位置調整Strategy {
    private readonly model: CanvasGraphModel;

    public constructor(model: CanvasGraphModel) {
        this.model = model;
    }

    public ノード位置を計算(node: テキスト用グラフノード<付箋text>): 描画座標点 {
        // 一時的に原点に配置（後処理で移動させる）
        const pos = Px2DVector.fromNumbers(0, 0);
        return new 描画座標点(pos, this.model.描画基準座標);
    }
}
