import { Canvas座標Base, 配置物座標点, 描画基準座標, 描画座標点 } from "SengenUI/index";
import { I折れ線矢印集約, I点ハンドル } from "../../I配置物";
import { 折れ線矢印データ, 座標データ } from "../../描画キャンバス/データクラス";
import { 折れ線矢印ID } from "../../ID";
import { 始点ハンドル, 終点ハンドル } from "./矢印集約";

export function シリアライズする<T extends Canvas座標Base<T> & 配置物座標点>(
    id: 折れ線矢印ID, 始点: 始点ハンドル<T>, 終点: 終点ハンドル<T>, 点: I点ハンドル<T>[],
): 折れ線矢印データ {
    const 中点 = 点.slice(1, -1).map(x => 座標データ.fromPx2DVector(x.state.pos.px2DVector));
    return 折れ線矢印データ.create(
        id, 座標データ.fromPx2DVector(始点.state.pos.px2DVector), 中点,
        座標データ.fromPx2DVector(終点.state.pos.px2DVector), 始点.get接続参照データ(), 終点.get接続参照データ(),
    );
}

export function 状態を復元する<T extends Canvas座標Base<T> & 配置物座標点>(
    集約: I折れ線矢印集約<T>, data: 折れ線矢印データ, 基準: 描画基準座標,
): void {
    while (集約.get点ハンドルByIndex(2)) 集約.delete中点(1);
    data.中点リスト.forEach((中点, index) => 集約.insert中点(index, 描画座標点.fromPx2DVector(中点.toPx2DVector(), 基準) as T));
    const 始点 = 集約.get点ハンドルByIndex(0)!;
    const 終点 = 集約.get点ハンドルByIndex(data.中点リスト.length + 1)!;
    始点.setPosition(描画座標点.fromPx2DVector(data.start.toPx2DVector(), 基準) as T);
    終点.setPosition(描画座標点.fromPx2DVector(data.end.toPx2DVector(), 基準) as T);
}
