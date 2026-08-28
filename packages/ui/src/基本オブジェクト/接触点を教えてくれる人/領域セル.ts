import { Canvas座標Base, Px2DVector, 配置物座標点, 描画座標点 } from "SengenUI/index";

import { I接触点を教えてくれる人, 接触判定可能な点 } from "../I配置物";
import { 接続点 } from "../配置物/矢印接続可能なもの/接続点";

export class 領域セル<座標点T extends Canvas座標Base<座標点T> & 配置物座標点>
    implements I接触点を教えてくれる人<座標点T> {
    private readonly 配置物リスト: 接触判定可能な点[] = [];
    private readonly 接続点リスト: 接続点<座標点T>[] = [];

    public constructor(
        public readonly 領域長方形対角の始点: Px2DVector,
        public readonly 領域長方形対角の終点: Px2DVector
    ) {}

    public add配置物(node: 接触判定可能な点): void { this.配置物リスト.push(node); }
    public add接続点(point: 接続点<座標点T>): void { this.接続点リスト.push(point); }

    public 接触点を取得(pos: 描画座標点): 接触判定可能な点 | null {
        for (const node of this.配置物リスト) if (node.判定(pos.px2DVector)) return node;
        return null;
    }

    public 接続点を取得(pos: 描画座標点): 接続点<座標点T> | null {
        for (const point of this.接続点リスト) if (point.判定(pos.px2DVector)) return point;
        return null;
    }

    public 未接続の点ハンドルを接続点と接続をtryする(_接続点: 接続点<座標点T>): void {
        // TODO: 実装
    }
}
