import { Canvas座標Base, Px2DVector, 配置物座標点 } from "SengenUI/index";
import { 曲線制御点, 曲線区間 } from "./曲線制御点";

export interface 曲線追加点<T extends Canvas座標Base<T> & 配置物座標点> {
    readonly 挿入位置: number; readonly 座標: T;
}

export function 曲線上の追加点を探す<T extends Canvas座標Base<T> & 配置物座標点>(始点: T, 終点: T,
    中間点リスト: readonly T[], クリック位置: Px2DVector): 曲線追加点<T> {
    const 区間リスト = 曲線制御点.区間リストを計算する(始点, 終点, 中間点リスト);
    let 最短距離二乗 = Number.POSITIVE_INFINITY;
    let 結果 = { 挿入位置: 0, 座標: 始点 };
    区間リスト.forEach((区間, index) => {
        for (let step = 1; step < 32; step += 1) {
            const t = step / 32;
            const 座標 = 始点.newFromPx2DVector(_ベジェ点(区間, t));
            const viewport = 座標.toビューポート座標値().px2DVector;
            const diff = viewport.minus(クリック位置);
            const distance = diff.dot(diff);
            if (distance < 最短距離二乗) { 最短距離二乗 = distance; 結果 = { 挿入位置: index, 座標 }; }
        }
    });
    return 結果;
}

function _ベジェ点(区間: 曲線区間, t: number): Px2DVector {
    const u = 1 - t;
    return 区間.始点.px2DVector.times(u ** 3)
        .plus(区間.始点側制御点.px2DVector.times(3 * u ** 2 * t))
        .plus(区間.終点側制御点.px2DVector.times(3 * u * t ** 2))
        .plus(区間.終点.px2DVector.times(t ** 3));
}
