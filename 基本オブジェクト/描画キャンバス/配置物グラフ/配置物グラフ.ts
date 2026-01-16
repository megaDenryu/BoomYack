import { 配置物座標点 } from "SengenUI/index";
import { IDMap } from "Extend/DDDBase/IDBase";
import { 付箋ID, 折れ線矢印ID } from "../../../../BoomYack/基本オブジェクト/ID";
import { I配置物集約 } from "../../../../BoomYack/基本オブジェクト/I配置物";

import { 付箋情報, 折れ線矢印情報, 配置物情報 } from "./配置物情報";
import { Func } from "OneONetアーキテクチャ支援/アーキテクチャBase";

export class 配置物グラフ {

    public readonly 付箋map: IDMap<付箋ID, 付箋情報<配置物座標点>> = new IDMap();
    public readonly 折れ線矢印map: IDMap<折れ線矢印ID, 折れ線矢印情報<配置物座標点>> = new IDMap();

    // コンストラクト時に配置物リストを受け取り、グラフ情報を完全に構築する
    public constructor(配置物リスト: I配置物集約[]) {
        for (const 配置物 of 配置物リスト){
            const 情報 = 配置物情報(配置物)
            if (情報.type === "付箋データ"){
                this.付箋map.set(情報.配置物データ.id, 情報) 
            }
            else if (情報.type === "折れ線矢印"){
                this.折れ線矢印map.set(情報.配置物データ.id, 情報)
            }
        }

        this.線を介してグラフ情報を埋める();

    }

    private 線を介してグラフ情報を埋める():void{
        for (const 折れ線矢印情報 of this.折れ線矢印map.values()){
            const 折れ線矢印 = 折れ線矢印情報.配置物
            const 始点に接続した付箋ID = 折れ線矢印.始点ハンドル.接続点?.親配置物ID;
            
            if (始点に接続した付箋ID){
                const 始点に接続した付箋情報 = this.付箋map.get(始点に接続した付箋ID)
                if (始点に接続した付箋情報){
                    折れ線矢印情報.始点接続付箋 = 始点に接続した付箋情報
                    始点に接続した付箋情報.始点が接続している矢印.push(折れ線矢印情報)
                }
            }
            const 終点に接続した付箋ID = 折れ線矢印.終点ハンドル.接続点?.親配置物ID;
            if (終点に接続した付箋ID){
                const 終点に接続した付箋情報 = this.付箋map.get(終点に接続した付箋ID)
                if (終点に接続した付箋情報){
                    折れ線矢印情報.終点接続付箋 = 終点に接続した付箋情報
                    終点に接続した付箋情報.終点が接続している矢印.push(折れ線矢印情報)
                }
            }
        }
    }

    public exec<Output>(func: Func<配置物グラフ, Output>): Output {
        return func(this);
    }

}