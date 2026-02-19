import { 配置物座標点 } from "SengenUI/index";
import { I配置物集約, I折れ線矢印集約 } from "../../../../BoomYack/基本オブジェクト/I配置物";
import { 配置物データ, 付箋データ, 折れ線矢印データ } from "../データクラス";
import { Func } from "TypeScriptBenriKakuchou/アーキテクチャBase";

interface I配置物情報 {
    type: "付箋データ"|"折れ線矢印"
    readonly 配置物:I配置物集約
    readonly 配置物データ: 配置物データ
}

export class 付箋情報<座標点T extends 配置物座標点> implements I配置物情報 {
    public readonly type = "付箋データ";
    public readonly 配置物: I配置物集約
    public readonly 配置物データ: 付箋データ
    public 始点が接続している矢印: 折れ線矢印情報<座標点T>[] = []
    public 終点が接続している矢印: 折れ線矢印情報<座標点T>[] = []
    public constructor(配置物: I配置物集約){
        this.配置物 = 配置物;
        this.配置物データ = 配置物.toシリアライズデータ() as 付箋データ
    }

    public exec<T>(func: Func<this,T>): T {return func(this);}
}

export class 折れ線矢印情報<座標点T extends 配置物座標点> implements I配置物情報 {
    public readonly type = "折れ線矢印";
    public readonly 配置物: I折れ線矢印集約<座標点T>
    public readonly 配置物データ: 折れ線矢印データ
    public 始点接続付箋: 付箋情報<座標点T>|null = null
    public 終点接続付箋: 付箋情報<座標点T>|null = null
    public constructor(配置物: I折れ線矢印集約<座標点T>){
        this.配置物 = 配置物;
        this.配置物データ = 配置物.toシリアライズデータ() as 折れ線矢印データ
    }

    public exec<T>(func: Func<this,T>): T {return func(this);}
}

export type 配置物情報 = 付箋情報<配置物座標点>|折れ線矢印情報<配置物座標点>

function is折れ線矢印集約(item: I配置物集約): item is I折れ線矢印集約<配置物座標点> {
    return item.type === "折れ線矢印";
}

export function 配置物情報(i配置物集約: I配置物集約): 配置物情報 {
    if (is折れ線矢印集約(i配置物集約)) return new 折れ線矢印情報(i配置物集約);
    return new 付箋情報(i配置物集約);
}