import { Canvas座標Base, I描画空間, 配置物座標点 } from "SengenUI/index";
import { I折れ線矢印集約, I点ハンドル } from "../../I配置物";
import { 線分ハンドル } from "./矢印集約";
import { 始点ハンドル, 終点ハンドル } from "./矢印集約";
import { 折れ線矢印View } from "./折れ線矢印View";

export interface 折れ線矢印構造<T extends Canvas座標Base<T> & 配置物座標点> extends I折れ線矢印集約<T> {
    readonly view: 折れ線矢印View;
    readonly 始点ハンドル: 始点ハンドル<T>;
    readonly 終点ハンドル: 終点ハンドル<T>;
    readonly 点ハンドルリスト: I点ハンドル<T>[];
    readonly 線分ハンドルリスト: 線分ハンドル<T>[];
}

export function 線分を生成する<T extends Canvas座標Base<T> & 配置物座標点>(
    親: I折れ線矢印集約<T>, 描画空間: I描画空間,
    始点: I点ハンドル<T>, 終点: I点ハンドル<T>, index: number,
): 線分ハンドル<T> {
    const 線分 = new 線分ハンドル(始点, 終点, 描画空間);
    線分.set親の集約(親);
    線分.set線分の位置(index);
    return 線分;
}

export function 全要素を再描画する<T extends Canvas座標Base<T> & 配置物座標点>(構造: 折れ線矢印構造<T>): void {
    構造.点ハンドルリスト.forEach(x => x.render());
    構造.線分ハンドルリスト.forEach(x => x.render());
}
