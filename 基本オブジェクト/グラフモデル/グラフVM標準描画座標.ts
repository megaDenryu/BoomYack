import { 図形内基準座標, 描画座標点 } from "SengenUI/index";
import { エッジID, ノードID } from "../ID";
import { サイズ } from "../数値";
import { エッジVMBase, ノードVMBase } from "./グラフVMBase";
import { I配置物 } from "./グラフVM標準共通";
import { ノードVM標準画面座標, エッジVM標準画面座標 } from "./グラフVM標準画面座標";
import { ノードVM標準図形内座標, エッジVM標準図形内座標 } from "./グラフVM標準図形内座標";

export interface IノードVM標準描画座標と見なせる {
    get ノードVM標準(): ノードVM標準描画座標;
}

export interface IエッジVM標準描画座標と見なせる {
    get エッジVM標準(): エッジVM標準描画座標;
}

export class ノードVM標準描画座標と見なせる<T extends I配置物> implements IノードVM標準描画座標と見なせる {
    private _ノードVM標準: ノードVM標準描画座標;
    public vm: T
    public get ノードVM標準(): ノードVM標準描画座標 { return this._ノードVM標準; }
    public constructor(ノードVM標準: ノードVM標準描画座標, vm: T) {
        this._ノードVM標準 = ノードVM標準;
        this.vm = vm
    }
}

export class エッジVM標準描画座標と見なせる<T extends I配置物> implements IエッジVM標準描画座標と見なせる {
    private _エッジVM標準: エッジVM標準描画座標;
    public vm: T
    public get エッジVM標準(): エッジVM標準描画座標 { return this._エッジVM標準; }
    public constructor(エッジVM標準: エッジVM標準描画座標, vm: T) {
        this._エッジVM標準 = エッジVM標準;
        this.vm = vm
    }
}

export class ノードVM標準描画座標 extends ノードVMBase<描画座標点, ノードVM標準描画座標> implements IノードVM標準描画座標と見なせる {
    public constructor(位置: 描画座標点, サイズ: サイズ, id: ノードID) {
        super(位置, サイズ, id);
    }

    public get ノードVM標準(): ノードVM標準描画座標 {return this;}

    /**
     * 画面座標系に変換
     */
    public to画面座標(): ノードVM標準画面座標 {
        return new ノードVM標準画面座標(this.位置.to画面座標点(), this.サイズ, this.id);
    }

    /**
     * 図形内座標系に変換
     */
    public to図形内座標(図形内基準座標: 図形内基準座標): ノードVM標準図形内座標 {
        return new ノードVM標準図形内座標(this.位置.to図形内座標点(図形内基準座標), this.サイズ, this.id);
    }
}

export class エッジVM標準描画座標 extends エッジVMBase<ノードVM標準描画座標, エッジVM標準描画座標> implements IエッジVM標準描画座標と見なせる {
    public constructor(start: ノードVM標準描画座標, end: ノードVM標準描画座標, id: エッジID) {
        super(start, end, id);
    }

    public get エッジVM標準(): エッジVM標準描画座標 {return this;}
}

export class グラフVM標準描画座標 {
    public readonly ノード: IノードVM標準描画座標と見なせる[];
    public readonly エッジ: IエッジVM標準描画座標と見なせる[];
    public constructor(ノード?: IノードVM標準描画座標と見なせる[], エッジ?: IエッジVM標準描画座標と見なせる[]) {
        this.ノード = ノード ?? [];
        this.エッジ = エッジ ?? [];
    }
}

export interface IグラフVM標準描画座標を持つ {
    get グラフVM標準描画座標(): グラフVM標準描画座標;
}
