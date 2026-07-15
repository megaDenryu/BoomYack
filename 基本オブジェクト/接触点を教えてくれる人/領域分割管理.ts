import { Canvas座標Base, 配置物座標点, 描画座標点 } from "SengenUI/index";

import { I接触点を教えてくれる人, リスト配置可能, 接触判定可能な点 } from "../I配置物";
import { 接続点 } from "../配置物/矢印接続可能なもの/接続点";
import { 領域セル } from "./領域セル";
import { 領域格子 } from "./領域格子";

export { 領域セル } from "./領域セル";
export type { 格子情報 } from "./領域格子";

export class 領域分割管理<座標点T extends Canvas座標Base<座標点T> & 配置物座標点>
    implements I接触点を教えてくれる人<座標点T>, リスト配置可能<座標点T> {
    private readonly 格子 = new 領域格子<座標点T>();
    private readonly 領域セルリスト: 領域セル<座標点T>[] = this.格子.セル配列を作る();

    public add配置物(node: 接触判定可能な点): void {
        const { 格子情報, 格子点番号 } = this.格子.セル番号を取得(node.描画座標点);
        const 対象セル = this.領域セルリスト[格子点番号];
        if (対象セル) {
            対象セル.add配置物(node);
        } else {
            console.warn(
                "配置物の追加に失敗しました。対象セルが存在しません。格子点番号:",
                格子点番号, "格子情報:", 格子情報
            );
            debugger;
        }
    }

    public add配置物リスト(nodes: Iterable<接触判定可能な点>): void {
        for (const node of nodes) this.add配置物(node);
    }

    public add接続点(point: 接続点<座標点T>): void {
        const { 格子情報, 格子点番号 } = this.格子.セル番号を取得(point.描画座標点);
        const 対象セル = this.領域セルリスト[格子点番号];
        if (対象セル) {
            対象セル.add接続点(point);
        } else {
            console.warn(
                "接続点の追加に失敗しました。対象セルが存在しません。格子点番号:",
                格子点番号, "格子情報:", 格子情報
            );
        }
    }

    public add接続点リスト(points: Iterable<接続点<座標点T>>): void {
        for (const point of points) this.add接続点(point);
    }

    public 接触点を取得(pos: 描画座標点): 接触判定可能な点 | null {
        return this.対象セルを取得(pos).接触点を取得(pos);
    }

    public 接続点を取得(pos: 描画座標点): 接続点<座標点T> | null {
        return this.対象セルを取得(pos).接続点を取得(pos);
    }

    public 未接続の点ハンドルを接続点と接続をtryする(_接続点: 接続点<座標点T>): void {
        // TODO: 実装
    }

    private 対象セルを取得(pos: 描画座標点): 領域セル<座標点T> {
        return this.領域セルリスト[this.格子.セル番号を取得(pos).格子点番号];
    }
}
