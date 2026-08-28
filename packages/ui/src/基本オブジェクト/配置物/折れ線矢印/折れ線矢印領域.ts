import { Canvas座標Base, Px2DVector, 配置物座標点, 描画座標点 } from "SengenUI/index";
import { I点ハンドル } from "../../I配置物";

export function 衝突判定用矩形を取得する<T extends Canvas座標Base<T> & 配置物座標点>(点リスト: I点ハンドル<T>[]): { 位置: 描画座標点; サイズ: Px2DVector } {
    const 描画点 = 点リスト.map(x => x.描画座標点);
    const x = 描画点.map(p => p.px2DVector.x.値);
    const y = 描画点.map(p => p.px2DVector.y.値);
    const minX = Math.min(...x);
    const minY = Math.min(...y);
    const maxX = Math.max(...x);
    const maxY = Math.max(...y);
    return {
        位置: 描画座標点.fromNumbers(minX, minY, 描画点[0].描画基準座標),
        サイズ: Px2DVector.fromNumbers(maxX - minX, maxY - minY),
    };
}
