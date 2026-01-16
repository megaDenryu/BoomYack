import { 描画座標点, 配置物座標点 } from "SengenUI/index";
import { I接触点を教えてくれる人, リスト配置可能, 接触判定可能な点 } from "../I配置物";

import { 接続点 } from "../配置物/矢印接続可能なもの/接続点";
import { 始点ハンドル, 終点ハンドル } from "../配置物/折れ線矢印/矢印集約";


export class 無分割管理<座標点T extends 配置物座標点> implements I接触点を教えてくれる人<座標点T>, リスト配置可能<座標点T> {
    private 配置物リスト: 接触判定可能な点[] = [];
    private 接続点リスト: 接続点<座標点T>[] = [];

    public constructor(){}

    public add配置物(node:接触判定可能な点):void {
        this.配置物リスト.push(node);
    }

    public add配置物リスト(nodes: Iterable<接触判定可能な点>):void {
        for (const node of nodes) {
            this.add配置物(node);
        }
    }

    public add接続点(接続点: 接続点<座標点T>):void {
        this.接続点リスト.push(接続点);
    }

    public add接続点リスト(接続点リスト: Iterable<接続点<座標点T>>):void {
        for (const 接続点 of 接続点リスト) {
            this.add接続点(接続点);
        }
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

    private *未接続の点ハンドルを取得する():Iterable<(始点ハンドル<座標点T>|終点ハンドル<座標点T>)>{
        for (const handle of this.配置物リスト) {
            if (handle instanceof 始点ハンドル || handle instanceof 終点ハンドル) {
                if (handle.未接続 == true){ yield handle; }
            }
        }
    }

    public 未接続の点ハンドルを接続点と接続をtryする(接続点:接続点<座標点T>):void {
        for (const handle of this.未接続の点ハンドルを取得する()) {
            if (接続点.判定(handle.描画座標点.px2DVector)){
                handle.接続(接続点);
            }
        }
    }

}