import { 図形内基準座標, 図形内座標点, 描画基準座標, 描画座標点, 画面座標点 } from "SengenUI/index";
import { エッジID, ノードID, 配置物ID } from "../ID";
import { サイズ } from "../数値";

import { エッジVMBase, ノードVMBase } from "./グラフVMBase";

// ========== 基底インターフェース ==========

export interface IノードVM標準描画座標と見なせる {
    get ノードVM標準(): ノードVM標準描画座標;
}

export interface IエッジVM標準描画座標と見なせる {
    get エッジVM標準(): エッジVM標準描画座標;
}

export interface IノードVM標準画面座標と見なせる {
    get ノードVM標準(): ノードVM標準画面座標;
}

export interface IエッジVM標準画面座標と見なせる {
    get エッジVM標準(): エッジVM標準画面座標;
}

export interface IノードVM標準図形内座標と見なせる {
    get ノードVM標準(): ノードVM標準図形内座標;
}

export interface IエッジVM標準図形内座標と見なせる {
    get エッジVM標準(): エッジVM標準図形内座標;
}

// シンプルな識別用インターフェース
export interface I配置物 {
    readonly 配置物ID: 配置物ID;
    readonly 配置物種別: '付箋' | 'まっすぐ矢印' | 'なめらか曲線矢印' | '折れ線矢印' | 'グループミニキャンバス';
}

// ========== 基底ラップクラス ==============

export class ノードVM標準描画座標と見なせる<T extends I配置物> implements IノードVM標準描画座標と見なせる {
    private _ノードVM標準: ノードVM標準描画座標;
    public vm:T
    public get ノードVM標準(): ノードVM標準描画座標 {return this._ノードVM標準;}
    public constructor(ノードVM標準: ノードVM標準描画座標, vm:T) {
        this._ノードVM標準 = ノードVM標準;
        this.vm = vm
    }
}

export class エッジVM標準描画座標と見なせる<T extends I配置物> implements IエッジVM標準描画座標と見なせる {
    private _エッジVM標準: エッジVM標準描画座標;
    public vm:T
    public get エッジVM標準(): エッジVM標準描画座標 {return this._エッジVM標準;}
    public constructor(エッジVM標準: エッジVM標準描画座標, vm:T) {
        this._エッジVM標準 = エッジVM標準;
        this.vm = vm
    }
}

export class ノードVM標準画面座標と見なせる<T extends I配置物> implements IノードVM標準画面座標と見なせる {
    private _ノードVM標準: ノードVM標準画面座標;
    public vm:T
    public get ノードVM標準(): ノードVM標準画面座標 {return this._ノードVM標準;}
    public constructor(ノードVM標準: ノードVM標準画面座標, vm:T) {
        this._ノードVM標準 = ノードVM標準;
        this.vm = vm
    }
}

export class エッジVM標準画面座標と見なせる<T extends I配置物> implements IエッジVM標準画面座標と見なせる {
    private _エッジVM標準: エッジVM標準画面座標;
    public vm:T
    public get エッジVM標準(): エッジVM標準画面座標 {return this._エッジVM標準;}
    public constructor(エッジVM標準: エッジVM標準画面座標, vm:T) {
        this._エッジVM標準 = エッジVM標準;
        this.vm = vm
    }
}

export class ノードVM標準図形内座標と見なせる<T extends I配置物> implements IノードVM標準図形内座標と見なせる {
    private _ノードVM標準: ノードVM標準図形内座標;
    public vm:T
    public get ノードVM標準(): ノードVM標準図形内座標 {return this._ノードVM標準;}
    public constructor(ノードVM標準: ノードVM標準図形内座標, vm:T) {
        this._ノードVM標準 = ノードVM標準;
        this.vm = vm
    }
}

export class エッジVM標準図形内座標と見なせる<T extends I配置物> implements IエッジVM標準図形内座標と見なせる {
    private _エッジVM標準: エッジVM標準図形内座標;
    public vm:T
    public get エッジVM標準(): エッジVM標準図形内座標 {return this._エッジVM標準;}
    public constructor(エッジVM標準: エッジVM標準図形内座標, vm:T) {
        this._エッジVM標準 = エッジVM標準;
        this.vm = vm
    }
}

// ========== 描画座標系（キャンバス用）==========

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

// ========== 画面座標系 ==========

export class ノードVM標準画面座標 extends ノードVMBase<画面座標点, ノードVM標準画面座標> implements IノードVM標準画面座標と見なせる {
    
    public constructor(位置: 画面座標点, サイズ: サイズ, id: ノードID) {
        super(位置, サイズ, id);
    }

    public get ノードVM標準(): ノードVM標準画面座標 {
        return this;
    }

    /**
     * 描画座標系に変換（デフォルトの描画基準座標を使用）
     * @param 基準座標 変換に使用する描画基準座標（省略時は画面座標点を原点とする）
     */
    public to描画座標(描画基準座標: 描画基準座標): ノードVM標準描画座標 {
        return new ノードVM標準描画座標(this.位置.to描画座標点(描画基準座標), this.サイズ, this.id);
    }

    /**
     * 図形内座標系に変換
     * @param 図形内座標 変換先の図形内座標系
     */
    public to図形内座標(図形内基準座標: 図形内基準座標): ノードVM標準図形内座標 {
        return new ノードVM標準図形内座標(this.位置.to図形内座標点(図形内基準座標), this.サイズ, this.id);
    }
}

export class エッジVM標準画面座標 extends エッジVMBase<ノードVM標準画面座標, エッジVM標準画面座標> implements IエッジVM標準画面座標と見なせる {

    public constructor(start: ノードVM標準画面座標, end: ノードVM標準画面座標, id: エッジID) {
        super(start, end, id);
    }

    public get エッジVM標準(): エッジVM標準画面座標 {
        return this;
    }
}

// ========== 図形内座標系 ==========

export class ノードVM標準図形内座標 extends ノードVMBase<図形内座標点, ノードVM標準図形内座標> implements IノードVM標準図形内座標と見なせる {
    public constructor(位置: 図形内座標点, サイズ: サイズ, id: ノードID) {
        super(位置, サイズ, id);
    }

    public get ノードVM標準(): ノードVM標準図形内座標 {
        return this;
    }

    /**
     * 描画座標系に変換
     */
    public to描画座標(): ノードVM標準描画座標 {
        return new ノードVM標準描画座標(this.位置.to描画座標点(), this.サイズ, this.id);
    }

    /**
     * 画面座標系に変換
     */
    public to画面座標(): ノードVM標準画面座標 {
        return new ノードVM標準画面座標(this.位置.to画面座標点(), this.サイズ, this.id);
    }

    /**
     * 別の図形内座標系に変換
     * @param 新しい図形内座標 変換先の図形内座標系
     */
    public to別の図形内座標(新しい図形内座標: 図形内基準座標): ノードVM標準図形内座標 {
        // 図形内座標 → 描画座標 → 新しい図形内座標の順で変換
        return this.to描画座標().to図形内座標(新しい図形内座標);
    }
}

export class エッジVM標準図形内座標 extends エッジVMBase<ノードVM標準図形内座標, エッジVM標準図形内座標> implements IエッジVM標準図形内座標と見なせる {
    public constructor(start: ノードVM標準図形内座標, end: ノードVM標準図形内座標, id: エッジID) {
        super(start, end, id);
    }

    public get エッジVM標準(): エッジVM標準図形内座標 {
        return this;
    }
}

// ========== ファクトリー関数（型安全な作成） ==========

export namespace ノードVMFactory {
    /**
     * 描画座標系ノードを作成
     */
    export function create描画座標(位置: 描画座標点, サイズ: サイズ): ノードVM標準描画座標 {
        return new ノードVM標準描画座標(位置, サイズ, new ノードID());
    }

    /**
     * 画面座標系ノードを作成
     */
    export function create画面座標(位置: 画面座標点, サイズ: サイズ): ノードVM標準画面座標 {
        return new ノードVM標準画面座標(位置, サイズ, new ノードID());
    }

    /**
     * 図形内座標系ノードを作成
     */
    export function create図形内座標(位置: 図形内座標点, サイズ: サイズ): ノードVM標準図形内座標 {
        return new ノードVM標準図形内座標(位置, サイズ, new ノードID());
    }
}

export namespace エッジVMFactory {
    /**
     * 描画座標系エッジを作成
     */
    export function create描画座標(start: ノードVM標準描画座標, end: ノードVM標準描画座標): エッジVM標準描画座標 {
        return new エッジVM標準描画座標(start, end, new エッジID());
    }

    /**
     * 画面座標系エッジを作成
     */
    export function create画面座標(start: ノードVM標準画面座標, end: ノードVM標準画面座標): エッジVM標準画面座標 {
        return new エッジVM標準画面座標(start, end, new エッジID());
    }

    /**
     * 図形内座標系エッジを作成
     */
    export function create図形内座標(start: ノードVM標準図形内座標, end: ノードVM標準図形内座標): エッジVM標準図形内座標 {
        return new エッジVM標準図形内座標(start, end, new エッジID());
    }
}


export class グラフVM標準図形内座標 {
    public readonly ノード: IノードVM標準図形内座標と見なせる[];
    public readonly エッジ: IエッジVM標準図形内座標と見なせる[];
    public constructor(ノード?: IノードVM標準図形内座標と見なせる[], エッジ?: IエッジVM標準図形内座標と見なせる[]) {
        this.ノード = ノード ?? [];
        this.エッジ = エッジ ?? [];
    }
}

export interface グラフVM標準図形内座標を持つ {
    get グラフVM標準図形内座標(): グラフVM標準図形内座標;
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




export class グラフVM標準画面座標 {
    public readonly ノード: IノードVM標準画面座標と見なせる[];
    public readonly エッジ: IエッジVM標準画面座標と見なせる[];
    public constructor(ノード?: IノードVM標準画面座標と見なせる[], エッジ?: IエッジVM標準画面座標と見なせる[]) {
        this.ノード = ノード ?? [];
        this.エッジ = エッジ ?? [];
    }
}