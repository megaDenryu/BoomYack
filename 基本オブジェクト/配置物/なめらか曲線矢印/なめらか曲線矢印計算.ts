import { Canvas座標Base, Px2DVector, 配置物座標点, 描画座標点 } from "SengenUI/index";
import { I接続点親情報 } from "../矢印接続可能なもの/接続点";
import { 曲線制御点 } from "./曲線制御点";
import { 始点ハンドル } from "./なめらか曲線矢印始点ハンドル";
import { 終点ハンドル } from "./なめらか曲線矢印終点ハンドル";

export function 曲線の衝突判定用矩形(start: 描画座標点, end: 描画座標点):
    { 位置: 描画座標点; サイズ: Px2DVector } {
    const minX = Math.min(start.px2DVector.x.値, end.px2DVector.x.値);
    const minY = Math.min(start.px2DVector.y.値, end.px2DVector.y.値);
    const maxX = Math.max(start.px2DVector.x.値, end.px2DVector.x.値);
    const maxY = Math.max(start.px2DVector.y.値, end.px2DVector.y.値);
    return {
        位置: 描画座標点.fromNumbers(minX, minY, start.描画基準座標),
        サイズ: Px2DVector.fromNumbers(maxX - minX, maxY - minY),
    };
}

export function 曲線上の中点<T extends Canvas座標Base<T> & 配置物座標点>(start: T, end: T): T {
    const control = 曲線制御点.計算する(start, end, null);
    const vector = start.px2DVector.times(0.125)
        .plus(control.始点側.px2DVector.times(0.375))
        .plus(control.終点側.px2DVector.times(0.375))
        .plus(end.px2DVector.times(0.125));
    return start.newFromPx2DVector(vector);
}

export function 最短の接続点へ切り替える<T extends Canvas座標Base<T> & 配置物座標点>(
    start: 始点ハンドル<T>, end: 終点ハンドル<T>,
): void {
    const startNote: I接続点親情報<T> | undefined = start.接続点?.親interface;
    const endNote: I接続点親情報<T> | undefined = end.接続点?.親interface;
    if (startNote === undefined || endNote === undefined || startNote === endNote) return;
    const pair = startNote.矢印接続可能なもの.ほかの矢印接続可能な物と最も近い接続点のペアを取得する(
        endNote.矢印接続可能なもの,
        { 自分の現在の接続点: start.接続点 ?? undefined, 相手の現在の接続点: end.接続点 ?? undefined });
    if (pair.自分の接続点 !== start.接続点) start.接続(pair.自分の接続点);
    if (pair.相手の接続点 !== end.接続点) end.接続(pair.相手の接続点);
}
