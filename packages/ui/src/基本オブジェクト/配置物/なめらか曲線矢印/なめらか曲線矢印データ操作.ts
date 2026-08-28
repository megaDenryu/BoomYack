import { Canvas座標Base, 描画基準座標, 配置物座標点, 描画座標点 } from "SengenUI/index";
import { なめらか曲線矢印データ, 座標データ } from "../../描画キャンバス/データクラス";
import { なめらか曲線矢印ID } from "../../ID";
import { 始点ハンドル } from "./なめらか曲線矢印始点ハンドル";
import { 終点ハンドル } from "./なめらか曲線矢印終点ハンドル";

export function 曲線矢印をシリアライズする<T extends Canvas座標Base<T> & 配置物座標点>(
    id: なめらか曲線矢印ID, start: 始点ハンドル<T>, end: 終点ハンドル<T>, middle: readonly T[],
): なめらか曲線矢印データ {
    return なめらか曲線矢印データ.create(id,
        座標データ.fromPx2DVector(start.state.pos.px2DVector),
        座標データ.fromPx2DVector(end.state.pos.px2DVector),
        start.get接続参照データ(), end.get接続参照データ(),
        middle.map(point => 座標データ.fromPx2DVector(point.px2DVector)));
}

export function 曲線矢印データを反映する<T extends Canvas座標Base<T> & 配置物座標点>(
    data: なめらか曲線矢印データ, base: 描画基準座標,
    start: 始点ハンドル<T>, end: 終点ハンドル<T>,
): T[] {
    start.setPosition(描画座標点.fromPx2DVector(data.start.toPx2DVector(), base) as T);
    end.setPosition(描画座標点.fromPx2DVector(data.end.toPx2DVector(), base) as T);
    return data.middlePoints.map(point => 描画座標点.fromPx2DVector(point.toPx2DVector(), base) as T);
}
