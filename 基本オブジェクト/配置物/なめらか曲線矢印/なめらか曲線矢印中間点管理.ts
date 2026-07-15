import { Canvas座標Base, I描画空間, 配置物座標点 } from "SengenUI/index";
import { Iドラッグ移動可能 } from "../../I配置物";
import { 中点State } from "../折れ線矢印/折れ線矢印state";
import type { なめらか曲線矢印集約 } from "./なめらか曲線矢印集約";
import { なめらか曲線矢印中間点ハンドル } from "./なめらか曲線矢印中間点ハンドル";
import { なめらか曲線矢印View } from "./なめらか曲線矢印View";
import { 曲線上の中点 } from "./なめらか曲線矢印計算";

export class なめらか曲線矢印中間点管理<T extends Canvas座標Base<T> & 配置物座標点> {
    private _handle: なめらか曲線矢印中間点ハンドル<T> | null = null;
    public get handle(): なめらか曲線矢印中間点ハンドル<T> | null { return this._handle; }

    public constructor(
        private readonly _parent: なめらか曲線矢印集約<T>,
        private readonly _space: I描画空間,
        private readonly _view: なめらか曲線矢印View,
    ) {}

    public 生成する(start: T, end: T): void {
        if (this._handle !== null) return;
        this._handle = new なめらか曲線矢印中間点ハンドル(
            new 中点State(曲線上の中点(start, end)), this._parent, this._space);
        this._view.add中間点ハンドル(this._handle.view);
        this._parent.再描画();
    }
    public 削除する(): void {
        if (this._handle === null) return;
        this._handle.view.delete();
        this._handle = null;
        this._parent.再描画();
    }
    public render(): void { this._handle?.render(); }
    public get position(): 配置物座標点 | null { return this._handle?.state.pos ?? null; }
    public ドラッグ対象へ追加する(base: Iドラッグ移動可能[]): Iドラッグ移動可能[] {
        return this._handle === null ? base : [...base, this._handle];
    }
}
