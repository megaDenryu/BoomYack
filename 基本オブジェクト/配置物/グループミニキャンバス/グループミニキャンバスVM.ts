import { グループミニキャンバスID, 配置物ID } from "../../ID";
import { I配置物, グラフVM標準図形内座標を持つ, グラフVM標準図形内座標 } from "../../グラフモデル/グラフVM標準";
import { IグループミニキャンバスVM } from "../../I配置物";

export class グループミニキャンバスVM implements I配置物, グラフVM標準図形内座標を持つ, IグループミニキャンバスVM {
    public readonly 配置物ID: グループミニキャンバスID;
    public readonly 配置物種別 = 'グループミニキャンバス' as const;
    public readonly グラフVM標準図形内座標: グラフVM標準図形内座標;
    
    public constructor(グラフVM標準図形内座標: グラフVM標準図形内座標, id: グループミニキャンバスID) {
        this.配置物ID = id;
        this.グラフVM標準図形内座標 = グラフVM標準図形内座標;
    }
}