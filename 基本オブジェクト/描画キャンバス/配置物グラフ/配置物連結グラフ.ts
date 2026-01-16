import { 配置物座標点 } from "SengenUI/index";
import { I配置物集約 } from "../../../../BoomYack/基本オブジェクト/I配置物";
import { 配置物グラフ } from "./配置物グラフ";
import { IDMap } from "TypeScriptBenriKakuchou/DDDBase/IDBase";
import { 付箋ID, 折れ線矢印ID } from "../../../../BoomYack/基本オブジェクト/ID";

import { 付箋情報, 折れ線矢印情報 } from "./配置物情報";
import { 折れ線矢印集約 } from "../../../../BoomYack/基本オブジェクト/配置物";
import { 矢印接続可能付箋Old } from "../../../../BoomYack/基本オブジェクト/配置物/付箋2/矢印接続可能付箋Old";

export class 配置物連結グラフ {
    public readonly 付箋map: IDMap<付箋ID, 付箋情報<配置物座標点>> = new IDMap();
    public readonly 折れ線矢印map: IDMap<折れ線矢印ID, 折れ線矢印情報<配置物座標点>> = new IDMap();
    public get 配置物集約リスト(): I配置物集約[] {
        const 付箋リスト = Array.from(this.付箋map.values()).map(x => x.配置物);
        const 矢印リスト = Array.from(this.折れ線矢印map.values()).map(x => x.配置物);
        return [...付箋リスト, ...矢印リスト];
    }

    public constructor(付箋情報: 付箋情報<配置物座標点>) {
        this.add付箋情報(付箋情報); //これで再帰的にグラフ全体が追加される
    }

    private add付箋情報(付箋情報: 付箋情報<配置物座標点> | null): void {
        if (付箋情報 === null) { return; }
        if (this.付箋map.has(付箋情報.配置物データ.id)) { return; }
        this.付箋map.set(付箋情報.配置物データ.id, 付箋情報);
        for (const 接続矢印 of 付箋情報.始点が接続している矢印){
            this.add前進折れ線矢印情報(接続矢印);
        }

        for (const 接続矢印 of 付箋情報.終点が接続している矢印){
            this.add後退折れ線矢印情報(接続矢印);
        }
    }

    private add前進折れ線矢印情報(折れ線矢印情報: 折れ線矢印情報<配置物座標点> | null): void {
        if (折れ線矢印情報 === null) { return; }
        if (this.折れ線矢印map.has(折れ線矢印情報.配置物データ.id)) { return; }
        this.折れ線矢印map.set(折れ線矢印情報.配置物データ.id, 折れ線矢印情報);
        this.add付箋情報(折れ線矢印情報.終点接続付箋);
    }

    private add後退折れ線矢印情報(折れ線矢印情報: 折れ線矢印情報<配置物座標点> | null): void {
        if (折れ線矢印情報 === null) { return; }
        if (this.折れ線矢印map.has(折れ線矢印情報.配置物データ.id)) { return; }
        this.折れ線矢印map.set(折れ線矢印情報.配置物データ.id, 折れ線矢印情報);
        this.add付箋情報(折れ線矢印情報.始点接続付箋);
    }

    public exec<T>(func: (グラフ: 配置物連結グラフ) => T): T {
        return func(this);
    }
}

export class 配置物連結グラフ群 {
    public readonly 配置物連結グラフリスト: 配置物連結グラフ[];

    public constructor(配置物連結グラフリスト: 配置物連結グラフ[]) {
        this.配置物連結グラフリスト = 配置物連結グラフリスト;
    }

    public 配置物が含まれるグラフを取得(配置物:I配置物集約): 配置物連結グラフ | null {
        if (配置物 instanceof 折れ線矢印集約){
            for (const グラフ of this.配置物連結グラフリスト){
                if (グラフ.折れ線矢印map.has(配置物.id)){ return グラフ;}
            }
            return null;
        }

        if (配置物 instanceof 矢印接続可能付箋Old){
            for (const グラフ of this.配置物連結グラフリスト){
                if (グラフ.付箋map.has(配置物.id)){return グラフ; }
            }
            return null;
        }
        
        return null;
    }

    public exec<T>(func: (グラフ群: 配置物連結グラフ群) => T): T {
        return func(this);
    }
}


export function 配置物連結グラフにクラスタリング(配置物グラフ: 配置物グラフ): 配置物連結グラフ群 {
    const 結果: 配置物連結グラフ[] = [];
    for (const 付箋情報 of 配置物グラフ.付箋map.values()){
        // この付箋がまだどのグラフにも含まれていない場合のみ、新しいグラフを作成
        const まだどこにも含まれていない = 結果.every(グラフ => !グラフ.付箋map.has(付箋情報.配置物データ.id));
        if (まだどこにも含まれていない) {
            結果.push(new 配置物連結グラフ(付箋情報));
        }
    }
    return new 配置物連結グラフ群(結果);
}


export function 配置物連結グラフをすべて抽出(配置物リスト: I配置物集約[]): 配置物連結グラフ群 {
    const グラフ = new 配置物グラフ(配置物リスト);
    const 連結グラフ群 = グラフ.exec(配置物連結グラフにクラスタリング);
    return 連結グラフ群;
}


