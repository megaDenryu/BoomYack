import { 配置物座標点 } from "SengenUI/index";
import { I配置物集約, I折れ線矢印集約, I付箋シリアライズ可能, I折れ線矢印シリアライズ可能, Iなめらか曲線矢印集約, Iなめらか曲線矢印シリアライズ可能 } from "../../../../BoomYack/基本オブジェクト/I配置物";
import { 配置物データ, 付箋データ, 折れ線矢印データ, なめらか曲線矢印データ } from "../データクラス";
import { Func } from "TypeScriptBenriKakuchou/アーキテクチャBase";

interface I配置物情報 {
    type: "付箋データ"|"折れ線矢印"|"なめらか曲線矢印"
    readonly 配置物:I配置物集約
    readonly 配置物データ: 配置物データ
}

export class 付箋情報<座標点T extends 配置物座標点> implements I配置物情報 {
    public readonly type = "付箋データ";
    public readonly 配置物: I配置物集約 & I付箋シリアライズ可能
    public readonly 配置物データ: 付箋データ
    public 始点が接続している矢印: 折れ線矢印情報<座標点T>[] = []
    public 終点が接続している矢印: 折れ線矢印情報<座標点T>[] = []
    public constructor(配置物: I配置物集約 & I付箋シリアライズ可能){
        this.配置物 = 配置物;
        this.配置物データ = (配置物 as I付箋シリアライズ可能).toシリアライズデータ()
    }

    public exec<T>(func: Func<this,T>): T {return func(this);}
}

export class 折れ線矢印情報<座標点T extends 配置物座標点> implements I配置物情報 {
    public readonly type = "折れ線矢印";
    public readonly 配置物: I折れ線矢印集約<座標点T> & I折れ線矢印シリアライズ可能
    public readonly 配置物データ: 折れ線矢印データ
    public 始点接続付箋: 付箋情報<座標点T>|null = null
    public 終点接続付箋: 付箋情報<座標点T>|null = null
    public constructor(配置物: I折れ線矢印集約<座標点T> & I折れ線矢印シリアライズ可能){
        this.配置物 = 配置物;
        this.配置物データ = (配置物 as I折れ線矢印シリアライズ可能).toシリアライズデータ()
    }

    public exec<T>(func: Func<this,T>): T {return func(this);}
}

export class なめらか曲線矢印情報<座標点T extends 配置物座標点> implements I配置物情報 {
    public readonly type = "なめらか曲線矢印";
    public readonly 配置物: Iなめらか曲線矢印集約<座標点T> & Iなめらか曲線矢印シリアライズ可能
    public readonly 配置物データ: なめらか曲線矢印データ
    public 始点接続付箋: 付箋情報<座標点T>|null = null
    public 終点接続付箋: 付箋情報<座標点T>|null = null
    public constructor(配置物: Iなめらか曲線矢印集約<座標点T> & Iなめらか曲線矢印シリアライズ可能){
        this.配置物 = 配置物;
        this.配置物データ = (配置物 as Iなめらか曲線矢印シリアライズ可能).toシリアライズデータ()
    }

    public exec<T>(func: Func<this,T>): T {return func(this);}
}

export type 配置物情報 = 付箋情報<配置物座標点>|折れ線矢印情報<配置物座標点>|なめらか曲線矢印情報<配置物座標点>

function is折れ線矢印集約(item: I配置物集約): item is I折れ線矢印集約<配置物座標点> & I折れ線矢印シリアライズ可能 {
    return item.type === "折れ線矢印";
}

function isなめらか曲線矢印集約(item: I配置物集約): item is Iなめらか曲線矢印集約<配置物座標点> & Iなめらか曲線矢印シリアライズ可能 {
    return item.type === "なめらか曲線矢印";
}

function is付箋集約(item: I配置物集約): item is I配置物集約 & I付箋シリアライズ可能 {
    return item.type === "付箋" || item.type === "自動リサイズ付箋";
}

export function 配置物情報(i配置物集約: I配置物集約): 配置物情報 {
    if (is折れ線矢印集約(i配置物集約)) return new 折れ線矢印情報(i配置物集約);
    if (isなめらか曲線矢印集約(i配置物集約)) return new なめらか曲線矢印情報(i配置物集約);
    if (is付箋集約(i配置物集約)) return new 付箋情報(i配置物集約);
    // フォールバック: 未知の配置物型の場合は付箋として扱う
    return new 付箋情報(i配置物集約 as I配置物集約 & I付箋シリアライズ可能);
}