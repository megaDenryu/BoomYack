import { Canvas座標Base, I描画空間, Px2DVector, 配置物座標点 } from "SengenUI/index";
import { Iドラッグ移動可能 } from "../../I配置物";
import { 中点State } from "../折れ線矢印/折れ線矢印state";
import type { なめらか曲線矢印集約 } from "./なめらか曲線矢印集約";
import { なめらか曲線矢印中間点ハンドル } from "./なめらか曲線矢印中間点ハンドル";
import { なめらか曲線矢印View } from "./なめらか曲線矢印View";
import { 曲線上の追加点を探す } from "./曲線上の追加点";

export class なめらか曲線矢印中間点管理<T extends Canvas座標Base<T> & 配置物座標点> {
    private readonly _handles: なめらか曲線矢印中間点ハンドル<T>[] = [];
    public get handles(): readonly なめらか曲線矢印中間点ハンドル<T>[] { return this._handles; }
    public get positions(): readonly T[] { return this._handles.map(handle => handle.state.pos); }

    public constructor(private readonly _parent: なめらか曲線矢印集約<T>,
        private readonly _space: I描画空間, private readonly _view: なめらか曲線矢印View) {}

    public 初期化する(positions: readonly T[]): void { positions.forEach(pos => this._追加する(pos)); }

    public 生成する(start: T, end: T, click: Px2DVector): void {
        const point = 曲線上の追加点を探す(start, end, this.positions, click);
        const handle = this._作る(point.座標);
        this._handles.splice(point.挿入位置, 0, handle);
        this._parent.再描画();
    }

    public 削除する(handle: なめらか曲線矢印中間点ハンドル<T>): void {
        const index = this._handles.indexOf(handle);
        if (index < 0) return;
        this._handles.splice(index, 1);
        this._view.remove中間点ハンドル(handle.view);
        this._parent.再描画();
    }

    public 置換する(positions: readonly T[]): void {
        this._handles.forEach(handle => this._view.remove中間点ハンドル(handle.view));
        this._handles.length = 0;
        positions.forEach(pos => this._追加する(pos));
        this._parent.再描画();
    }

    private _追加する(pos: T): void { this._handles.push(this._作る(pos)); }
    private _作る(pos: T): なめらか曲線矢印中間点ハンドル<T> {
        const handle = new なめらか曲線矢印中間点ハンドル(
            new 中点State(pos), this._parent, this._space, target => this.削除する(target));
        this._view.add中間点ハンドル(handle.view);
        return handle;
    }
    public render(): void { this._handles.forEach(handle => handle.render()); }
    public ドラッグ対象へ追加する(base: Iドラッグ移動可能[]): Iドラッグ移動可能[] {
        return [...base, ...this._handles];
    }
}
