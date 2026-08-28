import { グラフVM標準図形内座標, ノードVM標準描画座標, ノードVM標準描画座標と見なせる } from "../../グラフモデル/グラフVM標準";
import { グループミニキャンバスID, 配置物ID } from "../../ID";
import { Iグループミニキャンバス集約, IグループミニキャンバスView, IグループミニキャンバスVM } from "../../I配置物";
import { グループミニキャンバスView } from "./グループミニキャンバスView";
import { グループミニキャンバスVM } from "./グループミニキャンバスVM";

export class グループミニキャンバス集約 implements Iグループミニキャンバス集約 {
    public readonly view: IグループミニキャンバスView;
    public readonly vm: ノードVM標準描画座標と見なせる<グループミニキャンバスVM>;

    public constructor(ノードVM標準: ノードVM標準描画座標) {
        this.view = new グループミニキャンバスView();
        this.vm = new ノードVM標準描画座標と見なせる(ノードVM標準, new グループミニキャンバスVM(
            new グラフVM標準図形内座標([], []),
            new グループミニキャンバスID()
        ));
    }
}