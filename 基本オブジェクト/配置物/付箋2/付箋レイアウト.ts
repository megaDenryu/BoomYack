import { Canvas座標Base, DivC, Drag中値, Px2DVector, Px長さ, 配置物座標点 } from "SengenUI/index";
import { 付箋ジオメトリ } from "./付箋ジオメトリ";

export class 付箋レイアウト<T extends Canvas座標Base<T> & 配置物座標点> {
    private _shell!: DivC;
    private _body!: DivC;

    public constructor(
        private _position: T,
        private _size: Px2DVector,
        private readonly _minHeight: Px長さ,
        public readonly hoverPadding: Px長さ,
    ) {}

    public get position(): T { return this._position; }
    public get size(): Px2DVector { return this._size; }
    public get ジオメトリ(): 付箋ジオメトリ<T> {
        return new 付箋ジオメトリ(this._position, this._size, this.hoverPadding);
    }

    public DOMを登録する(shell: DivC, body: DivC): void {
        this._shell = shell;
        this._body = body;
        this.設定する({});
    }

    public 設定する(rect: { size?: Px2DVector; position?: T }): void {
        if (rect.position) this._position = rect.position;
        if (rect.size) this._size = rect.size;
        this._shell.setStyleCSS({
            width: this._size.x.plus(this.hoverPadding.multiply(2)).toStr(),
            height: this._size.y.plus(this.hoverPadding.multiply(2)).toStr(),
        });
        this._shell.setViewportPositionByTransform(this.ジオメトリ.外枠位置.toビューポート座標値());
        this._body.setStyleCSS({
            top: this.hoverPadding.toStr(), left: this.hoverPadding.toStr(),
            width: this._size.x.toStr(), height: this._size.y.toStr(),
            minHeight: this._minHeight.toStr(),
        });
    }

    public 移動する(e: Drag中値): void {
        const delta = e.data.直前のマウス位置から現在位置までの差分;
        this.設定する({ position: this._position.plus(Px2DVector.fromNumbers(
            delta.x / this._position.拡縮率, delta.y / this._position.拡縮率)) });
    }

    public 左をリサイズする(e: Drag中値): void {
        const dx = e.data.直前のマウス位置から現在位置までの差分.x / this._position.拡縮率;
        this.設定する({
            size: new Px2DVector(this._size.x.minus(new Px長さ(dx)), this._size.y),
            position: this._position.plus(Px2DVector.fromNumbers(dx, 0)),
        });
    }

    public 右をリサイズする(e: Drag中値): void {
        const dx = e.data.直前のマウス位置から現在位置までの差分.x / this._position.拡縮率;
        this.設定する({ size: new Px2DVector(this._size.x.plus(new Px長さ(dx)), this._size.y) });
    }
}
