import { Canvas座標Base, Drag開始値, Drag中値, I描画空間, Px2DVector, 配置物座標点, 描画座標点 } from "SengenUI/index";

import { I点ハンドル, 接触判定可能な点, I接触点を教えてくれる人, I接続点, Iなめらか曲線矢印集約 } from "../../I配置物";
import { 始点State } from "../折れ線矢印/折れ線矢印state";
import { 始点ハンドルView } from "../折れ線矢印/始点ハンドルView";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { 接続参照データ } from "../../描画キャンバス/データクラス";

/**
 * なめらか曲線矢印の始点ハンドル。折れ線矢印の始点ハンドル(矢印集約.ts)と同じ
 * ドラッグ・接続の流儀に乗るが、隣接する線分ハンドルを持たない
 * (曲線はSVG pathとして集約が一括描画するため、next/prev線分ハンドルは常にnull)。
 */
export class 始点ハンドル<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> implements I点ハンドル<座標点T>, 接触判定可能な点 {
    private _view: 始点ハンドルView;
    public get view(): 始点ハンドルView { return this._view; }
    private _state: 始点State<座標点T>;
    public get state(): 始点State<座標点T> { return this._state; }
    public readonly 親の折れ線矢印集約: Iなめらか曲線矢印集約<座標点T>;
    private _i描画基準座標を持つ: I描画空間;
    public index: number = 0;
    private _i接触点を教えてくれる人: I接触点を教えてくれる人<座標点T>;
    private _i配置物選択機能集約: I配置物選択機能集約;
    private _i接続点: I接続点<座標点T> | null = null;
    public get 接続点(): I接続点<座標点T> | null { return this._i接続点; }

    public constructor(
        state: 始点State<座標点T>,
        親: Iなめらか曲線矢印集約<座標点T>,
        i描画基準座標を持つ: I描画空間,
        i接触点を教えてくれる人: I接触点を教えてくれる人<座標点T>,
        i配置物選択機能集約: I配置物選択機能集約
    ) {
        this._state = state;
        this.親の折れ線矢印集約 = 親;
        this._i描画基準座標を持つ = i描画基準座標を持つ;
        this._i接触点を教えてくれる人 = i接触点を教えてくれる人;
        this._i配置物選択機能集約 = i配置物選択機能集約;
        this._view = new 始点ハンドルView([
            {
                onハンドルドラッグ開始: (e: Drag開始値): void => {
                    this.移動開始(e);
                    this.親の折れ線矢印集約.onハンドルドラッグ開始?.();
                },
                onハンドルドラッグ中: (e: Drag中値): void => { this.ドラッグ移動処理(e); },
                onハンドルドラッグ終了: (e: Drag中値): void => {
                    this.移動終了(e);
                    this.親の折れ線矢印集約.onハンドルドラッグ終了?.();
                }
            }
        ]);
    }

    public get 描画座標点(): 描画座標点 {
        return this._state.pos.to描画座標点();
    }

    public 判定(pos: Px2DVector): boolean {
        const length = this._state.pos.px2DVector.minus(pos);
        return length.dot(length) <= 20 * 20;
    }

    public get next線分ハンドル(): null { return null; }
    public get prev線分ハンドル(): null { return null; }

    public ドラッグ移動処理(e: Drag中値): this {
        const delta = e.data.直前のマウス位置から現在位置までの差分;
        const 拡縮率 = this._i描画基準座標を持つ.描画基準座標.拡縮率;
        const 補正されたdelta = Px2DVector.fromNumbers(delta.x / 拡縮率, delta.y / 拡縮率);
        this._state.setPosition(this._state.pos.plus(補正されたdelta));
        this.render();
        this.親の折れ線矢印集約.再描画();
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
        this.親の折れ線矢印集約.再描画();
        return this;
    }

    public 移動終了(e: Drag中値): void {
        const v接続点 = this._i接触点を教えてくれる人.接続点を取得(this.描画座標点);
        if (v接続点 == null) { return; }
        this.接続(v接続点);
        this._i配置物選択機能集約.全ての接続点を表示非表示切り替え(false);
    }

    public 移動開始(e: Drag開始値): void {
        this.接続解除();
        this._i配置物選択機能集約.全ての接続点を表示非表示切り替え(true);
    }

    public 接続(v接続点: I接続点<座標点T>): this {
        this.接続解除();
        this.view.見た目を接続状態にする();
        this._i接続点 = v接続点;
        this._i接続点.接続(this);
        return this;
    }

    private 接続解除(): void {
        this._i接続点?.接続解除(this);
        this._i接続点 = null;
    }

    public get接続参照データ(): 接続参照データ | null {
        return this._i接続点?.get接続参照データ() ?? null;
    }

    public get 未接続(): boolean {
        return this._i接続点 == null;
    }
}
