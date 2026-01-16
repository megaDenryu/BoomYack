import { Px2DVector, Px長さ, 描画座標点 } from "SengenUI/index";
// ========================================
// Strategy実装: グリッドレイアウト（後処理型）
// ========================================

import { IDMap } from "Extend/DDDBase/IDBase";
import { 付箋ID } from "BoomYack/基本オブジェクト/ID";
import { CanvasGraphModel } from "BoomYack/基本オブジェクト/描画キャンバス/描画キャンバスView分解/CanvasGraphModel";
import { node付箋pair } from "../ValueObjects/node付箋pair";
import { I後処理位置調整Strategy } from "./IStrategy";


export class グリッドレイアウトStrategy implements I後処理位置調整Strategy {
    private constructor(
        private readonly 列数: number = 4,
        private readonly セル幅: Px長さ = new Px長さ(300),
        private readonly セル高さ: Px長さ = new Px長さ(250),
        private readonly 開始位置: Px2DVector = Px2DVector.fromNumbers(100, 100)
    ) {}

    public static create(列数: number = 4): グリッドレイアウトStrategy {
        return new グリッドレイアウトStrategy(列数);
    }

    public 実行(pairMap: IDMap<付箋ID, node付箋pair>, model: CanvasGraphModel): void {
        const pairs = Array.from(pairMap.values());

        pairs.forEach((pair, index) => {
            const 行 = Math.floor(index / this.列数);
            const 列 = index % this.列数;

            const 位置 = new 描画座標点(
                new Px2DVector(
                    this.開始位置.x.plus(new Px長さ(this.セル幅.値 * 列)),
                    this.開始位置.y.plus(new Px長さ(this.セル高さ.値 * 行))
                ),
                model.描画基準座標
            );

            pair.付箋.view.位置を設定(位置);
            pair.付箋.再描画();
        });
    }
}
