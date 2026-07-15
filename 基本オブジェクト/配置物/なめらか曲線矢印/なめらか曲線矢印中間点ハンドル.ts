import { Canvas座標Base, Drag中値, I描画空間, Px2DVector, 配置物座標点, 描画座標点 } from "SengenUI/index";

import { 中点State } from "../折れ線矢印/折れ線矢印state";
import { 中点ハンドルView } from "../折れ線矢印/中点ハンドルView";
import type { なめらか曲線矢印集約 } from "./なめらか曲線矢印集約";

/**
 * なめらか曲線矢印の形状を手動でコントロールするための中間点ハンドル。
 * 曲線上での右クリックで生成され(なめらか曲線矢印集約.曲線上に中間点ハンドルを生成する参照)、
 * ドラッグすると2次ベジェの制御点として働き曲線を歪ませる(曲線制御点.中間点から計算する参照)。
 * 右クリックで自分自身を削除できる(折れ線矢印の中点ハンドルと同じ操作感)。
 *
 * 折れ線矢印の中点のように複数個は持てず、集約側で1個までの任意(null許容)として管理する。
 * 親を具象クラスなめらか曲線矢印集約で受けるのは、始点/終点ハンドルが使う共有interface
 * (Iなめらか曲線矢印集約)に中間点操作を追加するとファイルスコープ外の変更になるため。
 */
export class なめらか曲線矢印中間点ハンドル<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> {
    private readonly _view: 中点ハンドルView;
    public get view(): 中点ハンドルView { return this._view; }
    private readonly _state: 中点State<座標点T>;
    public get state(): 中点State<座標点T> { return this._state; }
    private readonly _親の曲線矢印集約: なめらか曲線矢印集約<座標点T>;
    private readonly _i描画基準座標を持つ: I描画空間;

    public constructor(
        state: 中点State<座標点T>,
        親の曲線矢印集約: なめらか曲線矢印集約<座標点T>,
        i描画基準座標を持つ: I描画空間
    ) {
        this._state = state;
        this._親の曲線矢印集約 = 親の曲線矢印集約;
        this._i描画基準座標を持つ = i描画基準座標を持つ;
        this._view = new 中点ハンドルView().配線する({
                onドラッグ開始: (): void => { this._親の曲線矢印集約.onハンドルドラッグ開始?.(); },
                onドラッグ中: (e: Drag中値): void => { this.ドラッグ移動処理(e); },
                onドラッグ終了: (): void => { this._親の曲線矢印集約.onハンドルドラッグ終了?.(); },
                on右クリック: (e: MouseEvent): void => {
                    e.preventDefault();
                    this._親の曲線矢印集約.中間点ハンドルを削除する();
                }
            });
    }

    public get 描画座標点(): 描画座標点 {
        return this._state.pos.to描画座標点();
    }

    public ドラッグ移動処理(e: Drag中値): this {
        const delta = e.data.直前のマウス位置から現在位置までの差分;
        const 拡縮率 = this._i描画基準座標を持つ.描画基準座標.拡縮率;
        const 補正されたdelta = Px2DVector.fromNumbers(delta.x / 拡縮率, delta.y / 拡縮率);
        this._state.setPosition(this._state.pos.plus(補正されたdelta));
        this.render();
        this._親の曲線矢印集約.再描画();
        return this;
    }

    public render(): this {
        this._view.位置を設定(this._state.pos);
        return this;
    }

    public move(diff: Px2DVector): this {
        return this.setPosition(this._state.pos.plus(diff));
    }

    public setPosition(pos: 座標点T): this {
        this._state.setPosition(pos);
        this.render();
        this._親の曲線矢印集約.再描画();
        return this;
    }
}
