import { Canvas座標Base, I描画空間, Px2DVector, 配置物座標点 } from "SengenUI/index";
import { 曲線上の追加点を探す } from "./曲線上の追加点";
import { 始点ハンドル } from "./なめらか曲線矢印始点ハンドル";
import { 終点ハンドル } from "./なめらか曲線矢印終点ハンドル";
import { なめらか曲線矢印中間点ハンドル } from "./なめらか曲線矢印中間点ハンドル";

type 曲線点<T extends Canvas座標Base<T> & 配置物座標点> = {
    readonly state: { readonly pos: T; setPosition(pos: T): void };
};

export class 曲線区間移動<T extends Canvas座標Base<T> & 配置物座標点> {
    private _区間 = -1;

    public constructor(private readonly _start: 始点ハンドル<T>, private readonly _end: 終点ハンドル<T>,
        private readonly _middle: () => readonly なめらか曲線矢印中間点ハンドル<T>[],
        private readonly _space: I描画空間, private readonly _再描画: () => void,
        private readonly _開始通知: () => void, private readonly _終了通知: () => void) {}

    public 開始する(click: Px2DVector): void {
        const middle = this._middle();
        this._区間 = 曲線上の追加点を探す(
            this._start.state.pos, this._end.state.pos, middle.map(point => point.state.pos), click).挿入位置;
        if (this._区間 === 0) this._start.区間移動開始();
        if (this._区間 === middle.length) this._end.区間移動開始();
        this._開始通知();
    }

    public 移動する(viewportDelta: Px2DVector): void {
        if (this._区間 < 0) return;
        const scale = this._space.描画基準座標.拡縮率;
        const delta = Px2DVector.fromNumbers(viewportDelta.x.値 / scale, viewportDelta.y.値 / scale);
        const points: 曲線点<T>[] = [this._start, ...this._middle(), this._end];
        [points[this._区間], points[this._区間 + 1]].forEach(point =>
            point.state.setPosition(point.state.pos.plus(delta)));
        this._再描画();
    }

    public 終了する(): void {
        if (this._区間 < 0) return;
        const middleCount = this._middle().length;
        if (this._区間 === 0) this._start.区間移動終了();
        if (this._区間 === middleCount) this._end.区間移動終了();
        this._区間 = -1;
        this._終了通知();
    }
}
