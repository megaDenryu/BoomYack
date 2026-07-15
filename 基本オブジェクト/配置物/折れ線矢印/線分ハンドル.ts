import { Canvas座標Base, Drag中値, Drag終了値, Drag開始値, I描画空間, Px2DVector, 配置物座標点 } from "SengenUI/index";
import { I折れ線矢印集約, I点と線のリポジトリ, I点ハンドル, I線分ハンドル } from "../../I配置物";
import { 始点中心線分情報 } from "./始点中心線分情報";
import { 線分ハンドルView } from "./線分ハンドルView";

export class 線分ハンドル<T extends Canvas座標Base<T> & 配置物座標点> implements I線分ハンドル<T> {
    public readonly view: 線分ハンドルView;
    private parent: I点と線のリポジトリ<T> | null = null;
    private position = -1;
    public constructor(
        public readonly 始点: I点ハンドル<T>,
        public readonly 終点: I点ハンドル<T>,
        private readonly space: I描画空間
    ) {
        this.view = new 線分ハンドルView().配線する({
            onドラッグ開始: e => { this.移動開始(e); this.aggregate?.ハンドルドラッグ開始を通知する(); },
            onドラッグ中: e => { this.ドラッグ移動処理(e); },
            onドラッグ終了: e => { this.移動終了(e); this.aggregate?.ハンドルドラッグ終了を通知する(); },
            on右クリック: e => { this.線分ハンドルを右クリックしたときの処理(e); }
        });
    }
    private get aggregate(): I折れ線矢印集約<T> | null {
        return this.parent as unknown as I折れ線矢印集約<T> | null;
    }
    public set親の集約(parent: I点と線のリポジトリ<T>): this { this.parent = parent; return this; }
    public set線分の位置(position: number): this { this.position = position; return this; }
    public ドラッグ移動処理(e: Drag中値): this {
        const d = e.data.直前のマウス位置から現在位置までの差分;
        const scale = this.space.描画基準座標.拡縮率;
        const diff = Px2DVector.fromNumbers(d.x / scale, d.y / scale);
        this.始点.move(diff); this.終点.move(diff); this.render();
        this.始点.prev線分ハンドル?.render(); this.終点.next線分ハンドル?.render();
        return this;
    }
    private 移動終了(e: Drag終了値): void { this.始点.移動終了(e); this.終点.移動終了(e); }
    private 移動開始(e: Drag開始値): void { this.始点.移動開始(e); this.終点.移動開始(e); }
    public 線分ハンドルを右クリックしたときの処理(e: MouseEvent): this {
        e.preventDefault();
        if (!this.parent || this.position < 0) return this;
        this.parent.insert中点(this.position, this.始点.state.pos.plus(this.終点.state.pos.px2DVector).divide(2));
        return this;
    }
    public render(): this {
        const line = 始点中心線分情報.計算(this.始点.state.pos, this.終点.state.pos);
        this.view.render(line); this.始点.view.回転角度を設定(line.angle); this.終点.view.回転角度を設定(line.angle);
        return this;
    }
}
