import {
    Canvas座標Base, DivC, Drag中値, LV2HtmlComponentBase, Px2DVector, Px長さ,
    TypedEventListener, 図形内座標点, 配置物座標点, 描画座標点,
} from "SengenUI/index";
import { I付箋View, 配置物zIndex } from "../../I配置物";
import { 付箋ID } from "../../ID";
import type { 付箋コンテンツデータ } from "../../描画キャンバス/付箋コンテンツデータ";
import { I接続点親情報 } from "../矢印接続可能なもの/接続点";
import { 矢印接続可能なもの, 矢印接続可能なもの依存関係, 絶対矢印上下左右Position, 矢印上下左右Position } from "../矢印接続可能なもの/矢印接続可能なもの";
import { 付箋設定状態 } from "../設定パネル";
import { 付箋アウトライン, 付箋選択状態 } from "./付箋選択状態";
import { 付箋View内部, 付箋View内部を構築する } from "./付箋View内部";
import type { 自動リサイズ付箋Viewオプション, 自動リサイズ付箋用コンテキストメニュー依存関係 } from "./自動リサイズ付箋Viewオプション";
export { 付箋選択状態 } from "./付箋選択状態";
export type { 自動リサイズ付箋Viewオプション, 自動リサイズ付箋用コンテキストメニュー依存関係 } from "./自動リサイズ付箋Viewオプション";

export class 自動リサイズ付箋View<T extends Canvas座標Base<T> & 配置物座標点>
    extends LV2HtmlComponentBase implements I付箋View, I接続点親情報<T> {
    protected _componentRoot: DivC;
    private readonly _内部: 付箋View内部<T>;
    private _on選択: TypedEventListener<"mousedown"> | null = null;

    public constructor(
        option: 自動リサイズ付箋Viewオプション<T>,
        arrowDep: 矢印接続可能なもの依存関係<T>,
        public readonly 配置物ID: 付箋ID,
        menuDep: 自動リサイズ付箋用コンテキストメニュー依存関係,
    ) {
        super();
        this._内部 = 付箋View内部を構築する(option, arrowDep, menuDep, this, e => this._on選択?.(e as MouseEvent));
        this._componentRoot = this._内部.root;
    }

    public get position(): 描画座標点 | 図形内座標点 { return this._内部.layout.position; }
    public get 矢印接続可能なもの(): 矢印接続可能なもの<T> { return this._内部.部品.接続点; }
    public get hoverPadding(): Px長さ { return this._内部.layout.hoverPadding; }
    public get text(): string { return this._内部.部品.コンテンツ.text; }
    public get コンテンツデータ(): 付箋コンテンツデータ { return this._内部.部品.コンテンツ.コンテンツデータ; }
    public getSize(): Px2DVector { return this._内部.layout.size; }
    public get衝突判定用矩形(): { 位置: 描画座標点 | 図形内座標点; サイズ: Px2DVector } { return this._内部.layout.ジオメトリ.衝突判定用矩形; }
    public calculate矢印接続ポイント(p: Px長さ): 絶対矢印上下左右Position<T> { return this._内部.layout.ジオメトリ.接続点(p); }
    public calculate矢印接続ポイント相対Transform(p: 絶対矢印上下左右Position<T>): 矢印上下左右Position<T> { return this._内部.layout.ジオメトリ.相対接続点(p); }

    public ドラッグ移動処理(e: Drag中値): this { this._内部.layout.移動する(e); this.update接続点座標(); return this; }
    public 位置を設定(pos: T): void { this._内部.layout.設定する({ position: pos }); }
    public 再描画(): void { this._内部.layout.設定する({}); }
    public update接続点座標(): void { const p = this.calculate矢印接続ポイント(new Px長さ(15)); this.矢印接続可能なもの.update接続点座標(this.calculate矢印接続ポイント相対Transform(p)); }
    public add矢印接続可能なもの(x: 矢印接続可能なもの<T>): void { this.child(x.setStyleCSS({ zIndex: 配置物zIndex.付箋内部構造.ホバー用四角形 })); }
    public 選択するを登録(fn: TypedEventListener<"mousedown">): this { this._on選択 = fn; return this; }
    public onClick(fn: TypedEventListener<"click">): this { this._componentRoot.onClick(fn); return this; }
    public onHover(fn: TypedEventListener<"mouseover">): this { this._componentRoot.onMouseOver(fn); return this; }
    public set選択状態(s: 付箋選択状態): void { this._内部.部品.ドラッグ操作領域.アウトラインを設定する(付箋アウトライン(s)); }
    public setText(text: string): void { this._内部.部品.コンテンツ.setText(text); this._内部.onTextChange(text); }
    public 選択状態のzIndexにする(): void { this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.選択中 }); }
    public 通常状態のzIndexにする(): void { this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.未選択 }); }
    public 設定を適用(s: 付箋設定状態): void { this._内部.部品.本体.setStyleCSS({ backgroundColor: s.背景色 }); this._内部.部品.コンテンツ.設定を適用(s); }
    public delete(): void { super.delete(); this._内部.menu.delete(); this._内部.部品.コンテンツ.delete(); }
}
