import { Canvas座標Base, div, DivC, Drag開始値, Drag終了値, Drag中値, LV2HtmlComponentBase, MouseEventData, PointerWife, Px2DVector, Px長さ, TypedEventListener, 図形内座標点, 配置物座標点, 描画座標点 } from "SengenUI/index";

import { auto_resize_handle_left, auto_resize_handle_right, 付箋ホバー領域, 付箋コンテンツコンテナ } from "./自動リサイズ付箋style.css";
import { 付箋本体 } from "./付箋枠style.css";
import { I付箋View, 配置物zIndex } from "../../I配置物";
import { 付箋選択状態 } from "./自動リサイズ付箋View";
import { 自動リサイズ付箋Viewオプション, 自動リサイズ付箋用コンテキストメニュー依存関係 } from "./付箋枠オプション";
import { 付箋コンテキストメニューを構築する } from "./付箋枠コンテキストメニュー";
import { 付箋ジオメトリ } from "./付箋ジオメトリ";

import { 矢印接続可能なもの, 矢印接続可能なもの依存関係 } from "../矢印接続可能なもの/矢印接続可能なもの";
import { 付箋ID } from "../../ID";
import { Iコンテキストメニュー } from "../../キャンバス操作/円状コンテキストメニュー/円状コンテキストメニュー";

import { 付箋設定状態 } from "../設定パネル";
import { I接続点親情報 } from "../矢印接続可能なもの/接続点";
import { I付箋コンテンツView } from "./I付箋コンテンツView";
import { 付箋コンテンツViewを生成する } from "./付箋コンテンツViewファクトリ";
import { 付箋コンテンツデータ } from "../../描画キャンバス/付箋コンテンツデータ";
import { リサイズハンドル } from "./リサイズハンドル";

export { 付箋選択状態 } from "./自動リサイズ付箋View";
export type { 自動リサイズ付箋Viewオプション, 自動リサイズ付箋用コンテキストメニュー依存関係 } from "./付箋枠オプション";

/**
 * 付箋の「枠」(ドラッグ・リサイズ・矢印接続・選択・コンテキストメニュー・zIndex)。
 * 旧`自動リサイズ付箋View`の置き換え(2026-07-16)。旧ファイルはそのまま残し、
 * 参照実装・切り戻し先として使う。
 *
 * 関連ファイル:
 * - 付箋枠オプション.ts: コンストラクタが受け取る依存関係の型
 * - 付箋枠コンテキストメニュー.ts: 右クリックメニューの組み立て
 * - 付箋ジオメトリ.ts: 位置・サイズから重心・矢印接続ポイントを導出する純粋計算
 *
 * DOM構造(2026-07-16 全面書き直し):
 * - 付箋ホバー領域(外枠): ドラッグ用のpadding込み領域。常に透明で、色は一切持たない
 * - 付箋本体(内枠、新設): 外枠のpadding分だけ内側にぴったり収まる、常にコンテンツと
 *   同じ実サイズを持つ実要素。背景色はここへ直接設定する
 *
 * 旧実装は外枠にcontent-boxグラデーションで疑似的に色を塗っていた。「見えている
 * 黄色い付箋」と「実際に色が適用されている領域」が別々の計算経路(CSS content-box
 * 算出 vs JSのサイズ計算)を持つ構造で、サイズが変わるたびに両者が食い違う実害が
 * 出ていた(付箋テキストエリアが空文字時に2行分の高さへ張り付くバグ修正時に発覚)。
 * 選択時の枠線は旧実装と同じく外枠(ハンドルを含むpadding込み領域全体)に出す。
 */
export class 付箋枠<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> extends LV2HtmlComponentBase implements I付箋View,I接続点親情報<座標点T> {
    protected _componentRoot: DivC;
    private 付箋ホバー領域: DivC;
    private _付箋本体: DivC;
    private _content!: I付箋コンテンツView;
    private _position: 座標点T;
    public get position(): 描画座標点|図形内座標点{ return this._position;}
    private _size: Px2DVector;
    private readonly _hoverPadding: Px長さ = new Px長さ(30); //ホバー領域拡張用のpadding
    private readonly _padding: Px長さ = new Px長さ(15); //矢印接続ポイント計算用のpadding
    public readonly 配置物ID: 付箋ID;
    private _矢印接続可能なもの: 矢印接続可能なもの<座標点T>;
    public get 矢印接続可能なもの(): 矢印接続可能なもの<座標点T> { return this._矢印接続可能なもの; }
    private get ジオメトリ(): 付箋ジオメトリ<座標点T> { return new 付箋ジオメトリ(this._position, this._size, this._hoverPadding); }

    public getSize(): Px2DVector { return this._size; }
    public get hoverPadding(): Px長さ { return this._hoverPadding; }
    public get衝突判定用矩形(): { 位置: 描画座標点|図形内座標点; サイズ: Px2DVector } { return this.ジオメトリ.衝突判定用矩形; }

    private _minHeight: Px長さ;
    private _onDrag?: (e: Drag中値, ドラッグしたコンポーネント: 付箋枠<座標点T>) => void;
    private _onResize?: () => void;
    private _onTextChange?: (text: string) => void;
    private _mouseWife: PointerWife;
    public get mouseWife(): PointerWife { return this._mouseWife; }
    private _コンテキストメニュー: Iコンテキストメニュー;

    public constructor(
        option: 自動リサイズ付箋Viewオプション<座標点T>,
        矢印接続可能なもの依存関係: 矢印接続可能なもの依存関係<座標点T>,
        配置物ID: 付箋ID,
        コンテキストメニュー依存関係: 自動リサイズ付箋用コンテキストメニュー依存関係
    ) {
        super();
        this.配置物ID = 配置物ID;
        this._position = option.position;
        this._minHeight = option.minHeight;
        this._size = option.size;
        this._onDrag = option.onDrag;
        this._onResize = option.onResize;
        this._onTextChange = option.onTextChange;
        this._componentRoot = this._ルートを構築する(option, 矢印接続可能なもの依存関係, コンテキストメニュー依存関係);

        // 札参照コンテンツ等、外部データの投影であるコンテンツはLLMへ渡すと実体と乖離した
        // 平文が独り歩きするためAI分解/AI生成を無効化する(設計2026-07-14_付箋コンテンツ設計.md 7.3節)
        const AI操作対応 = this._content.AI操作に対応しているか();
        this._コンテキストメニュー = 付箋コンテキストメニューを構築する(
            option.コンテキストメニューコンテナ,
            コンテキストメニュー依存関係,
            AI操作対応,
            () => this._position as unknown as 描画座標点,
        );
    }

    protected _ルートを構築する(
        option: 自動リサイズ付箋Viewオプション<座標点T>,
        矢印接続可能なもの依存関係: 矢印接続可能なもの依存関係<座標点T>,
        コンテキストメニュー依存関係: 自動リサイズ付箋用コンテキストメニュー依存関係
    ): DivC {
        const 矢印上下左右Position = this.ジオメトリ.calculate矢印接続ポイント(this._padding);
        return (
            div({ class : 付箋ホバー領域 }).tap(self => {
                    this.付箋ホバー領域 = self;
                    this._mouseWife = new PointerWife(self).ドラッグ連動登録({
                        onドラッグ開始: (e: Drag開始値)=> {option.onDragStart?.();},
                        onドラッグ中: (e: Drag中値)=> {
                            this.ドラッグ移動処理(e);
                            this._onDrag?.(e, this);
                        },
                        onドラッグ終了: (e: Drag終了値)=> {option.onDragEnd?.();}
                    });
                })
                .addDivEventListener('contextmenu', (e: MouseEvent) => {
                    e.preventDefault();
                    const position = new MouseEventData(e).position;
                    const 補正済み位置 = コンテキストメニュー依存関係.座標変換.viewportPointを補正する(position.x, position.y);
                    this._コンテキストメニュー.表示({ x: 補正済み位置.x.値, y: 補正済み位置.y.値 });
                })
                .addDivEventListener('click', (e: MouseEvent) => {
                    this._コンテキストメニュー.非表示();
                })
                .addDivEventListener('pointerdown', (e: PointerEvent) => {
                    this.選択する?.(e);
                })
                .childs([
                    div({ class: 付箋本体 }).tap(self => {
                            this._付箋本体 = self;
                            // 外枠のtap内(まだ付箋本体が存在しない)ではなくここで初期Transformを
                            // 確定させる。構築完了前に一瞬でも実サイズが未確定のまま描画される
                            // (「生成直後の背景半塗り」)のを避けるため、childs評価中の
                            // このタイミングで両方一度に確定させる。
                            this.set付箋ボードTransform({position:this._position, size:this._size});
                        })
                        .childs([
                            div({class: 付箋コンテンツコンテナ})
                                .setStyleCSS({
                                    flex: "1",
                                    display: "flex",
                                    flexDirection: "column",
                                    minHeight: this._minHeight.minus(new Px長さ(30)).toStr(),
                                    zIndex: 配置物zIndex.付箋内部構造.コンテナ
                                })
                                .childs([
                                    付箋コンテンツViewを生成する(option.初期コンテンツ, {
                                        最小高さ: this._minHeight,
                                        onTextChange: (text: string) => {
                                            this._onTextChange?.(text);
                                        },
                                        onBlurTextCommit: (oldText: string, newText: string) => {
                                            option.onTextCommit?.(oldText, newText);
                                        },
                                        onHeightChange: (newHeight: number) => {
                                            this.set付箋ボードTransform({size:new Px2DVector(this._size.x, new Px長さ(newHeight))});
                                            this.update接続点座標();
                                            this.onResize();
                                        },
                                        onFocus: () => {
                                            // フォーカス時に自身を選択状態にする（バグ修正）
                                            if (this.選択する) {
                                                this.選択する(new MouseEvent('mousedown'));
                                            }
                                        }
                                    }, { fudabaAPIクライアント: option.fudabaAPIクライアント }).tap((content) => { this._content = content; })
                                ]),
                            new リサイズハンドル("left").tap((handle) => { handle.mouseWife.ドラッグ連動登録({
                                                                                                onドラッグ開始: (e: Drag開始値)=> {},
                                                                                                onドラッグ中: (e: Drag中値)=> { this.leftHandleドラッグ中(e);},
                                                                                                onドラッグ終了: (e: Drag終了値)=> {}
                                                                                            })})
                                                                                            .setStyleCSS({zIndex: 配置物zIndex.付箋内部構造.リサイズハンドル}),
                            new リサイズハンドル("right").tap((handle) => { handle.mouseWife.ドラッグ連動登録({
                                                                                                onドラッグ開始: (e: Drag開始値)=> {},
                                                                                                onドラッグ中: (e: Drag中値)=> { this.rightHandleドラッグ中(e);},
                                                                                                onドラッグ終了: (e: Drag終了値)=> {}
                                                                                            })})
                                                                                            .setStyleCSS({zIndex: 配置物zIndex.付箋内部構造.リサイズハンドル}),
                        ]),
                    new 矢印接続可能なもの<座標点T>( 矢印上下左右Position, 矢印接続可能なもの依存関係, this )
                                                .tap((self)=>{this._矢印接続可能なもの = self;}),

                ])
        );
    }

    public ドラッグ移動処理(e: Drag中値): this {
        const delta = e.data.直前のマウス位置から現在位置までの差分;
        // 拡縮率を考慮: 視覚的に正しい移動量にするため、deltaを拡縮率で割る
        const 拡縮率 = this._position.拡縮率;
        const 補正されたdelta = Px2DVector.fromNumbers(delta.x / 拡縮率, delta.y / 拡縮率);
        this.set付箋ボードTransform({position:this._position.plus(補正されたdelta)})
        this.update接続点座標();
        return this;
    }

    private leftHandleドラッグ中(e: Drag中値): void {
        const deltaX = e.data.直前のマウス位置から現在位置までの差分.x;
        const 拡縮率 = this._position.拡縮率;
        const 補正されたdeltaX = deltaX / 拡縮率;
        const newWidth = this._size.x.minus(new Px長さ(補正されたdeltaX));
        this.set付箋ボードTransform({size:new Px2DVector(newWidth, this._size.y), position:this._position.plus(Px2DVector.fromNumbers(補正されたdeltaX,0))});
        this.onResize();
    }

    private rightHandleドラッグ中(e: Drag中値): void {
        const deltaX = e.data.直前のマウス位置から現在位置までの差分.x;
        const 拡縮率 = this._position.拡縮率;
        const 補正されたdeltaX = deltaX / 拡縮率;
        const newWidth = this._size.x.plus(new Px長さ(補正されたdeltaX));
        this.set付箋ボードTransform({size:new Px2DVector(newWidth, this._size.y)});
        this.onResize();
    }

    private onResize(): void {
        this.update接続点座標();
        this._onResize?.();
    }

    /**
     * 付箋ボードのTransformを設定する。付箋の見た目上の実サイズ・実位置を決める
     * 唯一の場所であり、外枠(ホバー領域)と付箋本体の両方をここから一度に確定させる。
     *
     * 構造:
     * - 外枠(ホバー領域)の全体サイズ = 付箋本体の実サイズ + hoverPadding*2
     * - 付箋本体は外枠のpadding-box内に、常にコンテンツと同じ実サイズで配置する
     * - positionは付箋本体の左上角(=見た目上の付箋そのものの左上角)を指す
     */
    private set付箋ボードTransform(rect: {size?: Px2DVector, position?: 座標点T}):this{
        if (rect.position) {this._position = rect.position;}
        if (rect.size) {this._size = rect.size;}

        const 全体幅 = this._size.x.plus(this._hoverPadding.multiply(2));
        const 全体高さ = this._size.y.plus(this._hoverPadding.multiply(2));

        this.付箋ホバー領域.setStyleCSS({
            width: 全体幅.toStr(),
            height: 全体高さ.toStr(),
            padding: this._hoverPadding.toStr(),
            boxSizing: "border-box",
        });
        this.付箋ホバー領域.setViewportPositionByTransform(this.ジオメトリ.外枠オフセット位置.toビューポート座標値());

        this._付箋本体.setStyleCSS({
            width: this._size.x.toStr(),
            height: this._size.y.toStr(),
        });
        return this;
    }

    public 付箋をめくる動作を登録(callback: TypedEventListener<'click'>): void {
        this._componentRoot.onceClick(callback);
    }
    public 再描画(): void {
        this.set付箋ボードTransform({});
    }

    /** 位置を設定する（外部から呼び出し可能） */
    public 位置を設定(新しい位置: 座標点T): void {
        this.set付箋ボードTransform({ position: 新しい位置 });
    }

    private 選択する: TypedEventListener<'mousedown'>|null = null;
    public 選択するを登録(callback: TypedEventListener<'mousedown'>): this {
        this.選択する = callback;
        return this;
    }

    public onClick(callback: TypedEventListener<'click'>): this {
        this._componentRoot.onClick(callback);
        return this;
    }

    public onHover(callback: TypedEventListener<'mouseover'>): this {
        this._componentRoot.onMouseOver(callback);
        return this;
    }

    /** 選択状態を設定し、アウトラインを更新(旧実装と同じく外枠=ハンドルを含む領域に出す) */
    public set選択状態(状態: 付箋選択状態): void {
        this.付箋ホバー領域.setStyleCSS({
            outline: this.getアウトラインスタイル(状態),
            outlineOffset: "0px",
            transition: "outline 0.2s ease-in-out"
        });
    }

    /** 状態に応じたアウトラインスタイルを取得 */
    private getアウトラインスタイル(状態: 付箋選択状態): string {
        switch (状態) {
            case 付箋選択状態.選択: return "2px dashed red";           // 赤
            case 付箋選択状態.ホバー: return "2px dashed #4caf50";       // 緑
            case 付箋選択状態.矢印選択: return "2px dashed #a5d6a7";       // 薄い緑
            case 付箋選択状態.なし:
            default: return "none";                     // 透明
        }
    }

    /** テキストを取得 */
    public get text(): string { return this._content.text; }

    /** テキストを設定（音声認識など外部からの直接書き換え用） */
    public setText(text: string): void {
        this._content.setText(text);
        this._onTextChange?.(text);
    }

    /** シリアライズ用のコンテンツデータを取得（コンテンツ種別ごとの構造を保ったまま） */
    public get コンテンツデータ(): 付箋コンテンツデータ { return this._content.コンテンツデータ; }

    /** 接続点座標を再計算して更新する */
    public update接続点座標(): void {
        const geo = this.ジオメトリ;
        this._矢印接続可能なもの.update接続点座標(geo.calculate矢印接続ポイント相対Transform(geo.calculate矢印接続ポイント(this._padding)));
    }

    public delete(): void {
        super.delete();
        this._コンテキストメニュー.delete();
        this._content.delete();
    }

    public 選択状態のzIndexにする(): void {
        this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.選択中 });
    }

    public 通常状態のzIndexにする(): void {
        this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.未選択 });
    }

    public 設定を適用(設定: 付箋設定状態): void {
        this._付箋本体.setStyleCSS({ backgroundColor: 設定.背景色 });
        this._content.設定を適用(設定);
    }
}
