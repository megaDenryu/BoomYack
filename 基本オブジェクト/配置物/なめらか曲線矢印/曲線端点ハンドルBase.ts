import { Canvas座標Base, Drag開始値, Drag中値, I描画空間, Px2DVector, 配置物座標点, 描画座標点 } from "SengenUI/index";
import { Iなめらか曲線矢印集約, I接続点, I接触点を教えてくれる人, I点ハンドル, 接触判定可能な点 } from "../../I配置物";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { 接続参照データ } from "../../描画キャンバス/データクラス";
import { I点state } from "../折れ線矢印/折れ線矢印state";
import { I点ハンドルView } from "../折れ線矢印/I点ハンドルView";
import { Iハンドル操作実行時コマンド } from "../折れ線矢印/Iハンドル操作実行時コマンド";

interface 接続表示可能ハンドルView extends I点ハンドルView {
    見た目を接続状態にする(): void;
}

export abstract class 曲線端点ハンドルBase<
    T extends Canvas座標Base<T> & 配置物座標点,
    S extends I点state<T>, V extends 接続表示可能ハンドルView,
> implements I点ハンドル<T>, 接触判定可能な点 {
    public abstract readonly index: number;
    public readonly 親の折れ線矢印集約: Iなめらか曲線矢印集約<T>;
    private _接続点: I接続点<T> | null = null;
    private readonly _view: V;

    protected constructor(
        private readonly _state: S, parent: Iなめらか曲線矢印集約<T>,
        private readonly _space: I描画空間, private readonly _contacts: I接触点を教えてくれる人<T>,
        private readonly _selection: I配置物選択機能集約,
        viewFactory: (commands: Iハンドル操作実行時コマンド[]) => V,
    ) {
        this.親の折れ線矢印集約 = parent;
        this._view = viewFactory(this._操作());
    }

    private _操作(): Iハンドル操作実行時コマンド[] {
        return [{
            onハンドルドラッグ開始: e => { this.移動開始(e); this.親の折れ線矢印集約.onハンドルドラッグ開始?.(); },
            onハンドルドラッグ中: e => { this.ドラッグ移動処理(e); },
            onハンドルドラッグ終了: e => { this.移動終了(e); this.親の折れ線矢印集約.onハンドルドラッグ終了?.(); },
        }];
    }

    public get view(): V { return this._view; }
    public get state(): S { return this._state; }
    public get 接続点(): I接続点<T> | null { return this._接続点; }
    public get 描画座標点(): 描画座標点 { return this._state.pos.to描画座標点(); }
    public get next線分ハンドル(): null { return null; }
    public get prev線分ハンドル(): null { return null; }
    public get 未接続(): boolean { return this._接続点 === null; }
    public 判定(pos: Px2DVector): boolean { const d = this._state.pos.px2DVector.minus(pos); return d.dot(d) <= 400; }
    public ドラッグ移動処理(e: Drag中値): this {
        const d = e.data.直前のマウス位置から現在位置までの差分;
        const scale = this._space.描画基準座標.拡縮率;
        this._state.setPosition(this._state.pos.plus(Px2DVector.fromNumbers(d.x / scale, d.y / scale)));
        this.render(); this.親の折れ線矢印集約.再描画(); return this;
    }
    public render(): this { this._view.位置を設定(this._state.pos); return this; }
    public move(diff: Px2DVector): this { return this.setPosition(this._state.pos.plus(diff)); }
    public setPosition(pos: T): this { this._state.setPosition(pos); this.render(); this.親の折れ線矢印集約.再描画(); return this; }
    public 移動終了(_e: Drag中値): void {
        const point = this._contacts.接続点を取得(this.描画座標点);
        if (point === null) return;
        this.接続(point); this._selection.全ての接続点を表示非表示切り替え(false);
    }
    public 移動開始(_e: Drag開始値): void { this._接続解除(); this._selection.全ての接続点を表示非表示切り替え(true); }
    public 接続(point: I接続点<T>): this {
        this._接続解除(); this._view.見た目を接続状態にする(); this._接続点 = point; point.接続(this); return this;
    }
    private _接続解除(): void { this._接続点?.接続解除(this); this._接続点 = null; }
    public get接続参照データ(): 接続参照データ | null { return this._接続点?.get接続参照データ() ?? null; }
}
