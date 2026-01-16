import { Px2DVector, Px長さ, 描画座標点 } from "SengenUI/index";
// ========================================
// Strategy実装: 階層的レイアウト（前処理型）
// ========================================

import { CanvasGraphModel } from "BoomYack/基本オブジェクト/描画キャンバス/描画キャンバスView分解/CanvasGraphModel";
import { テキスト用グラフ, 付箋text, テキスト用グラフノード } from "BoomYack/基本オブジェクト/描画キャンバス/配置物グラフ/テキスト化情報";

import { グラフ階層情報 } from "../ValueObjects/グラフ階層情報";
import { レイアウト設定 } from "../ValueObjects/レイアウト設定";
import { I前処理位置調整Strategy } from "./IStrategy";

export class 階層的レイアウトStrategy implements I前処理位置調整Strategy {
    private readonly 階層情報: グラフ階層情報;
    private readonly 設定: レイアウト設定;
    private readonly model: CanvasGraphModel;

    public constructor(
        グラフ: テキスト用グラフ<付箋text>,
        model: CanvasGraphModel,
        設定: レイアウト設定
    ) {
        this.階層情報 = グラフ階層情報.fromグラフ(グラフ);
        this.設定 = 設定;
        this.model = model;
    }

    public ノード位置を計算(node: テキスト用グラフノード<付箋text>): 描画座標点 {
        const 階層 = this.階層情報.ノード階層を取得(node.id);
        const インデックス = this.階層情報.階層内インデックスを取得(node.id);
        const 同階層ノード数 = this.階層情報.階層内ノード数を取得(階層);

        // 中央揃えのためのオフセット計算
        const 全体幅 = this.設定.横間隔.値 * (同階層ノード数 - 1);
        const 中央揃えオフセット = -全体幅 / 2;

        const x座標 = this.設定.開始位置.x.plus(
            new Px長さ(中央揃えオフセット + this.設定.横間隔.値 * インデックス)
        );
        const y座標 = this.設定.開始位置.y.plus(
            new Px長さ(this.設定.縦間隔.値 * 階層)
        );

        return new 描画座標点(
            new Px2DVector(x座標, y座標),
            this.model.描画基準座標
        );
    }
}
