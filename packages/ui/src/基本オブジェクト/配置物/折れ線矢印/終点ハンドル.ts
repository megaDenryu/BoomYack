import { Canvas座標Base, Drag中値, Drag開始値, I描画空間, Px2DVector, 描画座標点, 配置物座標点 } from "SengenUI/index";
import { I接続点, I接触点を教えてくれる人, I折れ線矢印集約, I点ハンドル, I線分ハンドル, 接触判定可能な点 } from "../../I配置物";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { 接続参照データ } from "../../描画キャンバス/データクラス";
import { 終点State } from "./折れ線矢印state";
import { 終点ハンドルView } from "./終点ハンドルView";

export class 終点ハンドル<T extends Canvas座標Base<T> & 配置物座標点>
implements I点ハンドル<T>, 接触判定可能な点 {
    public readonly view: 終点ハンドルView;
    private connection: I接続点<T> | null = null;
    public constructor(
        public readonly state: 終点State<T>,
        public readonly 親の折れ線矢印集約: I折れ線矢印集約<T>,
        public readonly index: number,
        private readonly space: I描画空間,
        private readonly contacts: I接触点を教えてくれる人<T>,
        private readonly selection: I配置物選択機能集約
    ) {
        this.view = new 終点ハンドルView().配線する({
            onドラッグ開始: e => { this.移動開始(e); this.親の折れ線矢印集約.ハンドルドラッグ開始を通知する(); },
            onドラッグ中: e => { this.ドラッグ移動処理(e); },
            onドラッグ終了: e => { this.移動終了(e); this.親の折れ線矢印集約.ハンドルドラッグ終了を通知する(); },
            on右クリック: () => { }
        });
    }
    public get 接続点(): I接続点<T> | null { return this.connection; }
    public get 描画座標点(): 描画座標点 { return this.state.pos.to描画座標点(); }
    public get next線分ハンドル(): null { return null; }
    public get prev線分ハンドル(): I線分ハンドル<T> {
        return this.親の折れ線矢印集約.get線分ハンドルByIndex(this.index - 1) as I線分ハンドル<T>;
    }
    public get 未接続(): boolean { return this.connection == null; }
    public 判定(pos: Px2DVector): boolean { const d = this.state.pos.px2DVector.minus(pos); return d.dot(d) <= 400; }
    public ドラッグ移動処理(e: Drag中値): this {
        const d = e.data.直前のマウス位置から現在位置までの差分;
        return this.move(Px2DVector.fromNumbers(d.x / this.space.描画基準座標.拡縮率, d.y / this.space.描画基準座標.拡縮率));
    }
    public render(): this { this.view.位置を設定(this.state.pos); return this; }
    public move(diff: Px2DVector): this { return this.setPosition(this.state.pos.plus(diff)); }
    public setPosition(pos: T): this { this.state.setPosition(pos); this.render(); this.prev線分ハンドル.render(); return this; }
    public 移動開始(_e: Drag開始値): void { this.接続解除(); this.selection.全ての接続点を表示非表示切り替え(true); }
    public 移動終了(_e: Drag中値): void {
        const point = this.contacts.接続点を取得(this.描画座標点);
        if (point == null) return;
        this.接続(point); this.selection.全ての接続点を表示非表示切り替え(false);
    }
    public 接続(point: I接続点<T>): void { this.接続解除(); this.view.見た目を接続状態にする(); this.connection = point; point.接続(this); }
    private 接続解除(): void { this.connection?.接続解除(this); this.connection = null; }
    public get接続参照データ(): 接続参照データ | null { return this.connection?.get接続参照データ() ?? null; }
}
