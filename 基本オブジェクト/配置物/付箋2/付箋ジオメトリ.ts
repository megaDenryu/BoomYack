import { Canvas座標Base, Px2DVector, Px長さ, 図形内座標点, 配置物座標点, 描画座標点 } from "SengenUI/index";
import { 絶対矢印上下左右Position, 矢印上下左右Position } from "../矢印接続可能なもの/矢印接続可能なもの";

export class 付箋ジオメトリ<T extends Canvas座標Base<T> & 配置物座標点> {
    public constructor(
        private readonly _position: T,
        private readonly _size: Px2DVector,
        private readonly _hoverPadding: Px長さ,
    ) {}

    public get 衝突判定用矩形(): { 位置: 描画座標点 | 図形内座標点; サイズ: Px2DVector } {
        return {
            位置: this.外枠位置,
            サイズ: new Px2DVector(
                this._size.x.plus(this._hoverPadding.multiply(2)),
                this._size.y.plus(this._hoverPadding.multiply(2))),
        };
    }

    public get 外枠位置(): T {
        return this._position.minus(new Px2DVector(this._hoverPadding, this._hoverPadding));
    }

    public 接続点(padding: Px長さ): 絶対矢印上下左右Position<T> {
        const 半幅 = this._size.x.divide(2);
        const 半高 = this._size.y.divide(2);
        const 重心 = this._重心位置(半幅, 半高);
        return {
            上: 重心.plus(new Px2DVector(new Px長さ(0), 半高.plus(padding))) as T,
            下: 重心.minus(new Px2DVector(new Px長さ(0), 半高.plus(padding))) as T,
            左: 重心.minus(new Px2DVector(半幅.plus(padding), new Px長さ(0))) as T,
            右: 重心.plus(new Px2DVector(半幅.plus(padding), new Px長さ(0))) as T,
        };
    }

    public 相対接続点(position: 絶対矢印上下左右Position<T>): 矢印上下左右Position<T> {
        const origin = this.外枠位置.px2DVector;
        return { 絶対: position, 相対: {
            上: position.上.px2DVector.minus(origin),
            下: position.下.px2DVector.minus(origin),
            左: position.左.px2DVector.minus(origin),
            右: position.右.px2DVector.minus(origin),
        } };
    }

    private _重心位置(半幅: Px長さ, 半高: Px長さ): 描画座標点 | 図形内座標点 {
        const vec = this._position.px2DVector.plus(new Px2DVector(半幅, 半高));
        return this._position instanceof 描画座標点
            ? 描画座標点.fromPx2DVector(vec, this._position.描画基準座標)
            : 図形内座標点.fromPx2DVector(vec, this._position.図形内基準座標);
    }
}
