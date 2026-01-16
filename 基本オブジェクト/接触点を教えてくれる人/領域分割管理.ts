import { Px2DVector, Px長さ, ビューポート座標値, 描画座標点, 配置物座標点 } from "SengenUI/index";
/**
 * 点が生成されるたびにここに登録される必要がある。
 * そして点は範囲を持っていて、接続判定をする。なので判定用のインターフェースを実装させるようにする
 */


import { I接触点を教えてくれる人, 接触判定可能な点, リスト配置可能 } from "../I配置物";

import { 接続点 } from "../配置物/矢印接続可能なもの/接続点";


export class 領域セル<座標点T extends 配置物座標点> implements I接触点を教えてくれる人<座標点T> {
    public readonly 領域長方形対角の始点: Px2DVector;
    public readonly 領域長方形対角の終点: Px2DVector;
    private 配置物リスト: 接触判定可能な点[] = [];
    private 接続点リスト: 接続点<座標点T>[] = [];

    public constructor(領域長方形対角の始点: Px2DVector, 領域長方形対角の終点: Px2DVector){
        this.領域長方形対角の始点 = 領域長方形対角の始点;
        this.領域長方形対角の終点 = 領域長方形対角の終点;
    }

    public add配置物(node:接触判定可能な点):void {
        this.配置物リスト.push(node);
    }

    public add接続点(接続点: 接続点<座標点T>):void {
        this.接続点リスト.push(接続点);
    }
    
    public 接触点を取得(pos: 描画座標点):接触判定可能な点|null {
        for (const node of this.配置物リスト) {
            if (node.判定(pos.px2DVector)) {
                return node;
            }
        }
        return null;
    }

    public 接続点を取得(pos: 描画座標点): 接続点<座標点T>|null {
        for (const 接続点 of this.接続点リスト) {
            if (接続点.判定(pos.px2DVector)) {
                return 接続点;
            }
        }
        return null;
    }

    public 未接続の点ハンドルを接続点と接続をtryする(接続点:接続点<座標点T>):void {
        // TODO: 実装
    }
}

export class 領域分割管理<座標点T extends 配置物座標点> implements I接触点を教えてくれる人<座標点T>, リスト配置可能<座標点T> {
    private readonly 領域セルリスト: 領域セル<座標点T>[];
    private _セルの縦横: Px2DVector;
    private _原点: ビューポート座標値;
    private _格子列数:number;
    private _格子行数:number;
    public constructor(){
        this._セルの縦横 = new Px2DVector(new Px長さ(1000), new Px長さ(1000));
        this._原点 = new ビューポート座標値(new Px2DVector(new Px長さ(0), new Px長さ(0)));
        this._格子列数 = 4;
        this._格子行数 = 4;
        this.領域セルリスト = this.create領域セル配列(this._セルの縦横, this._原点);
    }

    private create領域セル配列(セルの横縦: Px2DVector, 原点: ビューポート座標値): 領域セル<座標点T>[] {
        const list: 領域セル<座標点T>[] = [];
        for (let i = 0; i < this._格子列数; i++) {
            for (let j = 0; j < this._格子行数; j++) {
                const 領域長方形対角の始点 = 原点.plus(new ビューポート座標値(new Px2DVector(
                    new Px長さ(セルの横縦.x.value * i),
                    new Px長さ(セルの横縦.y.value * j)
                ))).px2DVector;
                const 領域長方形対角の終点 = new Px2DVector(
                    領域長方形対角の始点.x.plus(セルの横縦.x),
                    領域長方形対角の始点.y.plus(セルの横縦.y)
                );
                list[this.行列番号を格子点番号に平坦化({i,j})] = new 領域セル(領域長方形対角の始点, 領域長方形対角の終点);
            }
        }
        return list;
    }

    public add配置物(node:接触判定可能な点):void {
        const 格子情報 = this.座標が所属するセルの格子点情報を取得(node.描画座標点)
        const 格子点番号 = this.行列番号を格子点番号に平坦化(格子情報);

        const 対象セル = this.領域セルリスト[格子点番号];
        if (対象セル) {
            対象セル.add配置物(node);
        } else {
            console.warn("配置物の追加に失敗しました。対象セルが存在しません。格子点番号:", 格子点番号, "格子情報:", 格子情報);
            debugger;
        }
    }

    public add配置物リスト(nodes: Iterable<接触判定可能な点>):void {
        for (const node of nodes) {
            this.add配置物(node);
        }
    }

    public add接続点(接続点: 接続点<座標点T>):void {
        const 格子情報 = this.座標が所属するセルの格子点情報を取得(接続点.描画座標点)
        const 格子点番号 = this.行列番号を格子点番号に平坦化(格子情報);
        const 対象セル = this.領域セルリスト[格子点番号];
        if (対象セル) {
            対象セル.add接続点(接続点);
        } else {
            console.warn("接続点の追加に失敗しました。対象セルが存在しません。格子点番号:", 格子点番号, "格子情報:", 格子情報);
            // debugger;
        }
    }

    public add接続点リスト(接続点リスト: Iterable<接続点<座標点T>>):void {
        for (const 接続点 of 接続点リスト) {
            this.add接続点(接続点);
        }
    }

    public 接触点を取得(pos: 描画座標点):接触判定可能な点|null {
        const 格子情報: 格子情報 = this.座標が所属するセルの格子点情報を取得(pos);
        const 格子点番号 = this.行列番号を格子点番号に平坦化(格子情報);
        const 対象セル = this.領域セルリスト[格子点番号];
        return 対象セル.接触点を取得(pos);
    }

    public 接続点を取得(pos: 描画座標点): 接続点<座標点T>|null {
        const 格子情報: 格子情報 = this.座標が所属するセルの格子点情報を取得(pos);
        const 格子点番号 = this.行列番号を格子点番号に平坦化(格子情報);
        const 対象セル = this.領域セルリスト[格子点番号];
        return 対象セル.接続点を取得(pos);
    }
    
    public 未接続の点ハンドルを接続点と接続をtryする(接続点:接続点<座標点T>):void {
        // TODO: 実装
    }

    
    
    /**
     * 
     * @param i : 行番号：0 ~ this._格子行数-1
     * @param j : 列番号: 0 ~ this._格子列数-1
     * @returns : 0 ~ (this._格子行数 * this._格子列数 -1)
     */
    private 行列番号を格子点番号に平坦化(格子情報: 格子情報): number {
        return 格子情報.i * this._格子列数 + 格子情報.j 
    }

    private 格子点番号を行列番号に復元(格子点番号: number): 格子情報 {
        return {
            i: Math.floor(格子点番号 / this._格子列数), //商
            j: 格子点番号 % this._格子列数              //余り
        }
    }

    private 座標が所属するセルの格子点情報を取得(pos: 描画座標点): 格子情報 {
        return {
            i: Math.floor(pos.px2DVector.x.value/this._セルの縦横.x.value),
            j: Math.floor(pos.px2DVector.y.value/this._セルの縦横.y.value)
        }
    }

}

export interface 格子情報 {
    i: number; //行番号
    j: number; //列番号
}
