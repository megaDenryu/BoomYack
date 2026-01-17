import { Canvas座標Base } from "SengenUI/index";
import { エッジID, ノードID } from "../ID";
import { サイズ } from "../数値";


export abstract class ノードVMBase<TPosition extends Canvas座標Base<TPosition>, Self extends ノードVMBase<TPosition, Self>> {
    public readonly id: ノードID;
    public 位置: TPosition;
    public サイズ: サイズ;

    public constructor(位置: TPosition, サイズ: サイズ, id: ノードID) {
        this.id = id;
        this.位置 = 位置;
        this.サイズ = サイズ;
    }

    public abstract get ノードVM標準(): Self;
    public 位置を更新(新しい位置: TPosition): Self { this.位置 = 新しい位置; return this.ノードVM標準; }
    public サイズを更新(新しいサイズ: サイズ): Self { this.サイズ = 新しいサイズ; return this.ノードVM標準; }
    public equals(other: ノードVMBase<any, any>): boolean { return this.id.equal(other.id); }
}

export abstract class エッジVMBase<TNode extends ノードVMBase<any, any>, Self extends エッジVMBase<TNode, Self>> {
    public readonly id: エッジID;
    public readonly start: TNode;
    public readonly end: TNode;
    public constructor(start: TNode, end: TNode, id: エッジID) {
        this.id = id;
        this.start = start;
        this.end = end;
    }

    public abstract get エッジVM標準(): Self;
}

export interface ノードVMBaseと見なせる<TPosition extends Canvas座標Base<TPosition>, Self extends ノードVMBase<TPosition, Self>> {
    get ノードVM標準(): Self;
}

