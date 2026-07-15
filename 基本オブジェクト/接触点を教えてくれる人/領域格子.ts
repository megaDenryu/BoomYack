import {
    Canvas座標Base, Px2DVector, Px長さ, ビューポート座標値,
    配置物座標点, 描画座標点
} from "SengenUI/index";

import { 領域セル } from "./領域セル";

export interface 格子情報 { i: number; j: number; }

export class 領域格子<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> {
    private readonly セルの縦横 = new Px2DVector(new Px長さ(1000), new Px長さ(1000));
    private readonly 原点 = new ビューポート座標値(
        new Px2DVector(new Px長さ(0), new Px長さ(0))
    );
    private readonly 格子列数 = 4;
    private readonly 格子行数 = 4;

    public セル配列を作る(): 領域セル<座標点T>[] {
        const list: 領域セル<座標点T>[] = [];
        for (let i = 0; i < this.格子列数; i++) {
            for (let j = 0; j < this.格子行数; j++) {
                const 始点 = this.原点.plus(new ビューポート座標値(new Px2DVector(
                    new Px長さ(this.セルの縦横.x.value * i),
                    new Px長さ(this.セルの縦横.y.value * j)
                ))).px2DVector;
                const 終点 = new Px2DVector(
                    始点.x.plus(this.セルの縦横.x),
                    始点.y.plus(this.セルの縦横.y)
                );
                list[this.平坦化({ i, j })] = new 領域セル(始点, 終点);
            }
        }
        return list;
    }

    public セル番号を取得(pos: 描画座標点): { 格子情報: 格子情報; 格子点番号: number } {
        const 格子情報 = {
            i: Math.floor(pos.px2DVector.x.value / this.セルの縦横.x.value),
            j: Math.floor(pos.px2DVector.y.value / this.セルの縦横.y.value)
        };
        return { 格子情報, 格子点番号: this.平坦化(格子情報) };
    }

    private 平坦化(info: 格子情報): number { return info.i * this.格子列数 + info.j; }
}
