import {
    Canvas座標Base, div, DivC, Drag中値, I配線可能, LV2部品集約Base,
    Px2DVector, Px長さ, 図形内座標点, 配置物座標点, 描画座標点, 配線ポート,
} from "SengenUI/index";
import { I付箋View, 配置物zIndex } from "../../I配置物";
import { 付箋ID } from "../../ID";
import type { 付箋コンテンツデータ } from "../../描画キャンバス/付箋コンテンツデータ";
import { I接続点親情報 } from "../矢印接続可能なもの/接続点";
import { 矢印接続可能なもの, 矢印接続可能なもの依存関係, 絶対矢印上下左右Position, 矢印上下左右Position } from "../矢印接続可能なもの/矢印接続可能なもの";
import { 付箋設定状態 } from "../設定パネル";
import { 付箋座標シェル } from "./自動リサイズ付箋style.css";
import { 付箋View部品, 付箋View部品を構築する } from "./付箋View部品";
import { 付箋Viewサービス } from "./付箋Viewサービス";
import { 付箋ドラッグ操作余白Px } from "./付箋操作仕様";
import { 付箋レイアウト } from "./付箋レイアウト";
import { 付箋アウトライン, 付箋選択状態 } from "./付箋選択状態";
import type { 自動リサイズ付箋Viewオプション, 自動リサイズ付箋View構築データ, 自動リサイズ付箋用コンテキストメニュー依存関係 } from "./自動リサイズ付箋Viewオプション";
export { 付箋選択状態 } from "./付箋選択状態";
export type { 自動リサイズ付箋Viewオプション, 自動リサイズ付箋用コンテキストメニュー依存関係 } from "./自動リサイズ付箋Viewオプション";

export interface I自動リサイズ付箋View配線<T extends Canvas座標Base<T> & 配置物座標点> {
    on選択(e: PointerEvent | MouseEvent): void;
    onHover(): void;
    onDragStart(): void;
    onDrag(e: Drag中値, view: 自動リサイズ付箋View<T>): void;
    onDragEnd(): void;
    onResize(): void;
    onTextChange(text: string): void;
    onTextCommit(oldText: string, newText: string): void;
}

export class 自動リサイズ付箋View<T extends Canvas座標Base<T> & 配置物座標点>
    extends LV2部品集約Base<付箋View部品<T>, 付箋Viewサービス<T>>
    implements I付箋View, I接続点親情報<T>, I配線可能<I自動リサイズ付箋View配線<T>> {
    protected _componentRoot: DivC;
    private readonly _配線 = new 配線ポート<I自動リサイズ付箋View配線<T>>("自動リサイズ付箋View");
    private readonly _layout: 付箋レイアウト<T>;
    private readonly _部品: 付箋View部品<T>;
    private readonly _service: 付箋Viewサービス<T>;

    public constructor(option: 自動リサイズ付箋View構築データ<T>, arrowDep: 矢印接続可能なもの依存関係<T>,
        public readonly 配置物ID: 付箋ID, menuDep: 自動リサイズ付箋用コンテキストメニュー依存関係) {
        super();
        this._layout = new 付箋レイアウト(option.position, option.size, option.minHeight, new Px長さ(付箋ドラッグ操作余白Px));
        this._部品 = 付箋View部品を構築する(option, arrowDep, this, this._layout.ジオメトリ, new Px長さ(15));
        this._service = new 付箋Viewサービス(option, this._layout, this._部品, menuDep, this, this._上方向配線());
        this._componentRoot = this._ルートを構築する(this._部品, this._service);
        this._layout.DOMを登録する(this._componentRoot, this._部品.本体);
        this._service.接続点を更新する();
    }

    protected _ルートを構築する(部品: 付箋View部品<T>, service: 付箋Viewサービス<T>): DivC {
        return div({ class: 付箋座標シェル })
            .addDivEventListener("contextmenu", e => service.メニューを表示する(e))
            .addDivEventListener("click", () => service.menu.非表示())
            .addDivEventListener("mouseover", () => this._配線.先.onHover())
            .childs([
                部品.ドラッグ操作領域.配線する(service.ドラッグ配線),
                部品.本体.child(部品.コンテンツ.配線する(service.コンテンツ配線)),
                部品.左ハンドル.配線する(service.左ハンドル配線),
                部品.右ハンドル.配線する(service.右ハンドル配線), 部品.接続点,
            ]);
    }

    private _上方向配線(): I自動リサイズ付箋View配線<T> {
        return {
            on選択: e => this._配線.先.on選択(e), onHover: () => this._配線.先.onHover(),
            onDragStart: () => this._配線.先.onDragStart(), onDragEnd: () => this._配線.先.onDragEnd(),
            onDrag: (e, view) => this._配線.先.onDrag(e, view), onResize: () => this._配線.先.onResize(),
            onTextChange: text => this._配線.先.onTextChange(text),
            onTextCommit: (oldText, newText) => this._配線.先.onTextCommit(oldText, newText),
        };
    }

    public get position(): 描画座標点 | 図形内座標点 { return this._layout.position; }
    public get 矢印接続可能なもの(): 矢印接続可能なもの<T> { return this._部品.接続点; }
    public get hoverPadding(): Px長さ { return this._layout.hoverPadding; }
    public get text(): string { return this._部品.コンテンツ.text; }
    public get コンテンツデータ(): 付箋コンテンツデータ { return this._部品.コンテンツ.コンテンツデータ; }
    public getSize(): Px2DVector { return this._layout.size; }
    public get衝突判定用矩形(): { 位置: 描画座標点 | 図形内座標点; サイズ: Px2DVector } { return this._layout.ジオメトリ.衝突判定用矩形; }
    public calculate矢印接続ポイント(p: Px長さ): 絶対矢印上下左右Position<T> { return this._layout.ジオメトリ.接続点(p); }
    public calculate矢印接続ポイント相対Transform(p: 絶対矢印上下左右Position<T>): 矢印上下左右Position<T> { return this._layout.ジオメトリ.相対接続点(p); }
    public ドラッグ移動処理(e: Drag中値): this { this._layout.移動する(e); this.update接続点座標(); return this; }
    public 位置を設定(pos: T): void { this._layout.設定する({ position: pos }); }
    public 再描画(): void { this._layout.設定する({}); }
    public update接続点座標(): void { this._service.接続点を更新する(); }
    public add矢印接続可能なもの(x: 矢印接続可能なもの<T>): void { this.child(x.setStyleCSS({ zIndex: 配置物zIndex.付箋内部構造.ホバー用四角形 })); }
    public 配線する(配線: I自動リサイズ付箋View配線<T>): this { this._配線.配線する(配線); return this; }
    public set選択状態(s: 付箋選択状態): void { this._部品.ドラッグ操作領域.アウトラインを設定する(付箋アウトライン(s)); }
    public setText(text: string): void { this._部品.コンテンツ.setText(text); this._配線.先.onTextChange(text); }
    public 選択状態のzIndexにする(): void { this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.選択中 }); }
    public 通常状態のzIndexにする(): void { this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.未選択 }); }
    public 設定を適用(s: 付箋設定状態): void { this._部品.本体.setStyleCSS({ backgroundColor: s.背景色 }); this._部品.コンテンツ.設定を適用(s); }
    public delete(): void { super.delete(); this._service.menu.delete(); this._部品.コンテンツ.delete(); }
}
