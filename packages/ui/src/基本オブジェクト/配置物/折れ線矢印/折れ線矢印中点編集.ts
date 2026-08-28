import { Canvas座標Base, I描画空間, 配置物座標点 } from "SengenUI/index";
import { 中点State } from "./折れ線矢印state";
import { 中点ハンドル } from "./中点ハンドル";
import { 全要素を再描画する, 折れ線矢印構造, 線分を生成する } from "./折れ線矢印構造";

export function 中点を挿入する<T extends Canvas座標Base<T> & 配置物座標点>(
    構造: 折れ線矢印構造<T>, 描画空間: I描画空間, index: number, pos: T,
): void {
    const 中点 = new 中点ハンドル(new 中点State(pos), index + 1, 構造, 描画空間);
    構造.点ハンドルリスト.splice(index + 1, 0, 中点);
    構造.点ハンドルリスト.forEach((点, i) => { 点.index = i; });
    const 旧線分 = 構造.線分ハンドルリスト.splice(index, 1)[0];
    const 前半 = 線分を生成する(構造, 描画空間, 構造.点ハンドルリスト[index], 中点, index);
    const 後半 = 線分を生成する(構造, 描画空間, 中点, 構造.点ハンドルリスト[index + 2], index + 1);
    構造.線分ハンドルリスト.splice(index, 0, 前半, 後半);
    for (let i = index + 2; i < 構造.線分ハンドルリスト.length; i++) 構造.線分ハンドルリスト[i].set線分の位置(i);
    構造.view.add中点ハンドル(中点.view);
    構造.view.add線分ハンドル(前半.view);
    構造.view.add線分ハンドル(後半.view);
    旧線分.view.delete();
    全要素を再描画する(構造);
}

export function 中点を削除する<T extends Canvas座標Base<T> & 配置物座標点>(
    構造: 折れ線矢印構造<T>, 描画空間: I描画空間, index: number,
): void {
    const 中点 = 構造.点ハンドルリスト[index];
    const 前線分 = 構造.線分ハンドルリスト[index - 1];
    const 後線分 = 構造.線分ハンドルリスト[index];
    構造.点ハンドルリスト.splice(index, 1);
    構造.点ハンドルリスト.forEach((点, i) => { 点.index = i; });
    構造.線分ハンドルリスト.splice(index - 1, 2);
    const 統合線分 = 線分を生成する(構造, 描画空間, 構造.点ハンドルリスト[index - 1], 構造.点ハンドルリスト[index], index - 1);
    構造.線分ハンドルリスト.splice(index - 1, 0, 統合線分);
    for (let i = index; i < 構造.線分ハンドルリスト.length; i++) 構造.線分ハンドルリスト[i].set線分の位置(i);
    if (中点 instanceof 中点ハンドル) 中点.view.delete();
    前線分.view.delete();
    後線分.view.delete();
    構造.view.add線分ハンドル(統合線分.view);
    全要素を再描画する(構造);
}
