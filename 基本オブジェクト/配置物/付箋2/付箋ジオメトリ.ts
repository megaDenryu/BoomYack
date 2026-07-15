import { Canvas座標Base, Px2DVector, Px長さ, 図形内座標点, 配置物座標点, 描画座標点 } from "SengenUI/index";
import { 絶対矢印上下左右Position, 矢印上下左右Position } from "../矢印接続可能なもの/矢印接続可能なもの";

/**
 * 付箋の位置・サイズから、外形矩形・重心・矢印接続ポイントを導出する純粋な計算だけを
 * 集めたもの。位置やサイズが変わるたびに使い捨てで作り直して使う(状態を持たない)。
 */
export class 付箋ジオメトリ<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> {
    public constructor(
        private readonly _position: 座標点T,
        private readonly _size: Px2DVector,
        private readonly _hoverPadding: Px長さ,
    ) {}

    public get 横幅の半分(): Px長さ { return this._size.x.divide(2); }
    public get 縦幅の半分(): Px長さ { return this._size.y.divide(2); }

    public get 重心位置(): 描画座標点 | 図形内座標点 {
        const vec = this._position.px2DVector.plus(new Px2DVector(this.横幅の半分, this.縦幅の半分));
        if (this._position instanceof 描画座標点) {
            return 描画座標点.fromPx2DVector(vec, this._position.描画基準座標);
        }
        return 図形内座標点.fromPx2DVector(vec, this._position.図形内基準座標);
    }

    public get 衝突判定用矩形(): { 位置: 描画座標点 | 図形内座標点; サイズ: Px2DVector } {
        const パディング込みサイズ = new Px2DVector(
            this._size.x.plus(this._hoverPadding.multiply(2)),
            this._size.y.plus(this._hoverPadding.multiply(2))
        );
        return { 位置: this.外枠オフセット位置, サイズ: パディング込みサイズ };
    }

    /** 外枠(ホバー領域)のborder原点。付箋本体の実位置からhoverPadding分だけ左上にオフセットした点 */
    public get 外枠オフセット位置(): 座標点T {
        return this._position.minus(new Px2DVector(this._hoverPadding, this._hoverPadding));
    }

    /**
     * 矢印接続ポイントを計算する
     * @param padding 付箋の外側に配置する接続ポイントのパディング
     */
    public calculate矢印接続ポイント(padding: Px長さ): 絶対矢印上下左右Position<座標点T> {
        const 横幅の半分 = this.横幅の半分;
        const 縦幅の半分 = this.縦幅の半分;
        const 重心 = this.重心位置;

        return {
            上: 重心.plus(new Px2DVector(new Px長さ(0), 縦幅の半分.plus(padding))) as 座標点T,
            下: 重心.minus(new Px2DVector(new Px長さ(0), 縦幅の半分.plus(padding))) as 座標点T,
            左: 重心.minus(new Px2DVector(横幅の半分.plus(padding), new Px長さ(0))) as 座標点T,
            右: 重心.plus(new Px2DVector(横幅の半分.plus(padding), new Px長さ(0))) as 座標点T
        };
    }

    /** 絶対座標の矢印接続ポイントを、外枠のborder原点を基準にした相対座標へ変換する */
    public calculate矢印接続ポイント相対Transform(position: 絶対矢印上下左右Position<座標点T>): 矢印上下左右Position<座標点T> {
        const offsetPosition = this.外枠オフセット位置;
        return {
            絶対: position,
            相対: {
                上: position.上.px2DVector.minus(offsetPosition.px2DVector),
                下: position.下.px2DVector.minus(offsetPosition.px2DVector),
                左: position.左.px2DVector.minus(offsetPosition.px2DVector),
                右: position.右.px2DVector.minus(offsetPosition.px2DVector)
            }
        };
    }
}
