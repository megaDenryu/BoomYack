import { Canvas座標Base, Drag開始値, Drag中値, I描画空間, Px2DVector, 配置物座標点, 描画座標点 } from "SengenUI/index";
import { I折れ線矢印集約, I点ハンドル, I線分ハンドル } from "../../I配置物";
import { 中点State } from "./折れ線矢印state";
import { 中点ハンドルView } from "./折れ線矢印View";

export class 中点ハンドル<T extends Canvas座標Base<T> & 配置物座標点> implements I点ハンドル<T> {
    public readonly view: 中点ハンドルView;
    public index: number;
    public constructor(
        public readonly state: 中点State<T>, index: number,
        public readonly 親の折れ線矢印集約: I折れ線矢印集約<T>,
        private readonly 描画空間: I描画空間,
    ) {
        this.index = index;
        this.view = new 中点ハンドルView().配線する({
            onドラッグ開始: () => this.親の折れ線矢印集約.ハンドルドラッグ開始を通知する(),
            onドラッグ中: e => { this.ドラッグ移動処理(e); },
            onドラッグ終了: () => this.親の折れ線矢印集約.ハンドルドラッグ終了を通知する(),
            on右クリック: (e: MouseEvent) => { e.preventDefault(); this.親の折れ線矢印集約.delete中点(this.index); },
        });
    }

    public get next線分ハンドル(): I線分ハンドル<T> { return this.親の折れ線矢印集約.get線分ハンドルByIndex(this.index)!; }
    public get prev線分ハンドル(): I線分ハンドル<T> { return this.親の折れ線矢印集約.get線分ハンドルByIndex(this.index - 1)!; }
    public get 描画座標点(): 描画座標点 { return this.state.pos.to描画座標点(); }
    public 判定(_pos: Px2DVector): boolean { throw new Error("Method not implemented."); }
    public ドラッグ移動処理(e: Drag中値): this {
        const delta = e.data.直前のマウス位置から現在位置までの差分;
        const 拡縮率 = this.描画空間.描画基準座標.拡縮率;
        this.state.setPosition(this.state.pos.plus(Px2DVector.fromNumbers(delta.x / 拡縮率, delta.y / 拡縮率)));
        this.render();
        this.prev線分ハンドル.render();
        this.next線分ハンドル.render();
        return this;
    }
    public render(): this { this.view.位置を設定(this.state.pos); return this; }
    public move(diff: Px2DVector): this { return this.setPosition(this.state.pos.plus(diff)); }
    public 移動終了(_e: Drag中値): void {}
    public 移動開始(_e: Drag開始値): void {}
    public setPosition(pos: T): this { this.state.setPosition(pos); return this.render(); }
}
