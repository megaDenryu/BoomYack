import { DivC, Drag中値, Drag終了値, Drag開始値, HtmlComponentBase, I描画空間, LV2HtmlComponentBase, MouseWife, Px2DVector, Px長さ, TypedEventListener, 図形内座標点, 描画座標点, 配置物座標点 } from "SengenUI/index";






import { auto_resize_handle_left, auto_resize_handle_right, auto_resize_sticky_note, sticky_note_close_button, sticky_note_container, 付箋ホバー領域, sticky_note_header, sticky_note_title } from "../付箋/付箋View/style.css";
import { テキストエリアサイズパラメータ, 自動リサイズテキストエリア } from "../付箋/付箋View/自動リサイズモード/自動リサイズテキストエリア";
import { I付箋View, 配置物zIndex } from "../../I配置物";

import { 絶対矢印上下左右Position, 矢印接続可能なもの, 矢印接続可能なもの依存関係, 矢印上下左右Position } from "../矢印接続可能なもの/矢印接続可能なもの";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { I配置物リポジトリ } from "../../配置物リポジトリ";
import { 付箋ID } from "../../ID";
import { コンテキストメニューコンテナ } from "BoomYack/基本オブジェクト/キャンバス操作/円状コンテキストメニュー/コンテキストメニューコンテナ";
import { 付箋設定状態 } from "../設定パネル";

/** 付箋の選択線の状態 */
export enum 付箋選択状態 {
    なし = "none",           // 透明
    ホバー = "hover",         // 緑
    矢印選択 = "arrowSelect",  // 薄い緑
    選択 = "selected"        // 赤
}

export interface 自動リサイズ付箋View2オプション<座標点T extends 配置物座標点> {
    position: 座標点T;
    size: Px2DVector;
    minHeight: Px長さ;
    text: string;
    コンテキストメニューコンテナ: コンテキストメニューコンテナ;
    onDelete?: () => void;
    onDrag?: () => void;
    onResize?: () => void;
    onTextChange?: (text: string) => void;
}

export class 自動リサイズ付箋View2<座標点T extends 配置物座標点> extends LV2HtmlComponentBase implements I付箋View {
    protected _componentRoot: DivC;
    private 付箋ホバー領域: DivC;
    private _textArea!: 自動リサイズテキストエリア;
    private _position: 座標点T;
    public get position(): 描画座標点|図形内座標点{ return this._position;}
    private _size: Px2DVector;
    private readonly _hoverPadding: Px長さ = new Px長さ(30); //ホバー領域拡張用のpadding
    private readonly _padding: Px長さ = new Px長さ(15); //矢印接続ポイント計算用のpadding
    public readonly 配置物ID: 付箋ID;
    private _矢印接続可能なもの: 矢印接続可能なもの<座標点T>;
    public get 矢印接続可能なもの(): 矢印接続可能なもの<座標点T> { return this._矢印接続可能なもの; }


    public getSize(): Px2DVector { return this._size; }
    public get hoverPadding(): Px長さ { return this._hoverPadding; }
    public get衝突判定用矩形(): { 位置: 描画座標点|図形内座標点; サイズ: Px2DVector } {
        const パディング込みサイズ = new Px2DVector(
            this._size.x.plus(this._hoverPadding.multiply(2)),
            this._size.y.plus(this._hoverPadding.multiply(2))
        );
        const パディング分オフセット位置 = this._position.minus(new Px2DVector(this._hoverPadding, this._hoverPadding));
        return { 位置: パディング分オフセット位置, サイズ: パディング込みサイズ };
    }
    public get横幅の半分(): Px長さ { return this._size.x.divide(2); }
    public get縦幅の半分(): Px長さ { return this._size.y.divide(2); }
    public get重心位置(): 描画座標点|図形内座標点 {
        const vec = this._position.px2DVector.plus(new Px2DVector(this.get横幅の半分(), this.get縦幅の半分()));
        if (this._position instanceof 描画座標点) {
            return 描画座標点.fromPx2DVector(vec,this._position.描画基準座標);
        }
        return 図形内座標点.fromPx2DVector(vec,this._position.図形内基準座標);
    }
    private _minHeight: Px長さ;
    private _text: string;
    private _onDrag?: () => void;
    private _onResize?: () => void;
    private _onTextChange?: (text: string) => void;
    private _mouseWife: MouseWife;
    public get mouseWife(): MouseWife { return this._mouseWife; }
    private _ヘッダー高さ: Px長さ = new Px長さ(30);

    public constructor(
        option: 自動リサイズ付箋View2オプション<座標点T>,
        矢印接続可能なもの依存関係: 矢印接続可能なもの依存関係<座標点T>,
        配置物ID: 付箋ID
    ) {
        super();
        this.配置物ID = 配置物ID;
        this._position = option.position;
        this._minHeight = option.minHeight ?? new Px長さ(150);
        this._size = option.size ?? new Px2DVector( new Px長さ(200),  this._minHeight );
        this._text = option.text ?? "";
        this._onDrag = option.onDrag;
        this._onResize = option.onResize;
        this._onTextChange = option.onTextChange;
        this._componentRoot = this.createComponentRoot(option, 矢印接続可能なもの依存関係);
    }

    protected createComponentRoot(
        option: 自動リサイズ付箋View2オプション<座標点T>,
        矢印接続可能なもの依存関係: 矢印接続可能なもの依存関係<座標点T>
    ): DivC {
        const 矢印上下左右Position = this.calculate矢印接続ポイント(this._padding);
        // 親要素はzIndexを指定しない → スタッキングコンテキストを作らない
        return new DivC({ class : [付箋ホバー領域, auto_resize_sticky_note]}).bind(self => {
                                                                                            this.付箋ホバー領域 = self;
                                                                                            this.set付箋ボードTransform({position:this._position, size:this._size});
                                                                                            this._mouseWife = new MouseWife(self).ドラッグ連動登録({
                                                                                                onドラッグ開始: (e: Drag開始値)=> {},
                                                                                                onドラッグ中: (e: Drag中値)=> {this.ドラッグ移動処理(e);},
                                                                                                onドラッグ終了: (e: Drag終了値)=> {}
                                                                                            });
                                                                                        })
                                                                            .setStyleCSS({
                                                                                        transition: "background 0.2s ease-in-out"
                                                                                    })
                                                                                    .childs([
                            new 付箋ヘッダー(this._ヘッダー高さ, option.onDelete).bind((header)=>{header.mouseWife.ドラッグ連動登録({
                                                                                                    onドラッグ開始: (e: Drag開始値)=> {},
                                                                                                    onドラッグ中: (e: Drag中値)=> { this.ドラッグ移動処理(e);},
                                                                                                    onドラッグ終了: (e: Drag終了値)=> {}
                                                                                                })}).setStyleCSS({zIndex: 配置物zIndex.付箋内部構造.ヘッダー}),
                            new DivC({class:"コンテナ"})
                                .setStyleCSS({
                                    flex: "1",
                                    display: "flex",
                                    flexDirection: "column",
                                    minHeight: this._minHeight.minus(new Px長さ(30)).toStr(),
                                    zIndex: 配置物zIndex.付箋内部構造.コンテナ
                                })
                                .childs([
                                    new 自動リサイズテキストエリア({
                                        initialText: this._text,
                                        placeholder: "付箋の内容を入力...",
                                        初期テキストエリアサイズパラメータ: new テキストエリアサイズパラメータ().setMinHeight(this._minHeight.minus(this._ヘッダー高さ)),
                                        onTextChange: (text: string) => { 
                                            this._text = text;
                                            this._onTextChange?.(text);
                                        },
                                        onHeightChange: (newHeight: number) => {
                                            this.set付箋ボードTransform({size:new Px2DVector(this._size.x, new Px長さ(newHeight).plus(this._ヘッダー高さ))});
                                            this.update接続点座標();
                                            this._onResize?.();
                                        }
                                    }).bind((textArea) => { this._textArea = textArea; })
                                ]),
                            new リサイズハンドル("left").bind((handle) => { handle.mouseWife.ドラッグ連動登録({
                                                                                                onドラッグ開始: (e: Drag開始値)=> {},
                                                                                                onドラッグ中: (e: Drag中値)=> { this.leftHandleドラッグ中(e);},
                                                                                                onドラッグ終了: (e: Drag終了値)=> {}
                                                                                            })})
                                                                                            .setStyleCSS({zIndex: 配置物zIndex.付箋内部構造.リサイズハンドル}),
                            new リサイズハンドル("right").bind((handle) => { handle.mouseWife.ドラッグ連動登録({
                                                                                                onドラッグ開始: (e: Drag開始値)=> {},
                                                                                                onドラッグ中: (e: Drag中値)=> { this.rightHandleドラッグ中(e);},
                                                                                                onドラッグ終了: (e: Drag終了値)=> {}
                                                                                            })})
                                                                                            .setStyleCSS({zIndex: 配置物zIndex.付箋内部構造.リサイズハンドル}),
                            new 矢印接続可能なもの<座標点T>( 矢印上下左右Position, 矢印接続可能なもの依存関係, this )
                                                        .bind((self)=>{ 
                                                            this._矢印接続可能なもの = self; 
                                                        })
                                                                                            
                        ]);
    }

    public ドラッグ移動処理(e: Drag中値): this {
        const delta = e.data.直前のマウス位置から現在位置までの差分;
        // 拡縮率を考慮: 視覚的に正しい移動量にするため、deltaを拡縮率で割る
        const 拡縮率 = this._position.拡縮率;
        const 補正されたdelta = Px2DVector.fromNumbers(
            delta.x / 拡縮率,
            delta.y / 拡縮率
        );
        this.set付箋ボードTransform({position:this._position.plus(補正されたdelta) as 座標点T})
        this._onDrag?.();
        return this;
    }

    private leftHandleドラッグ中(e: Drag中値): void {
        const deltaX = e.data.直前のマウス位置から現在位置までの差分.x;
        // 拡縮率を考慮: 視覚的に正しい移動量にするため、deltaXを拡縮率で割る
        const 拡縮率 = this._position.拡縮率;
        const 補正されたdeltaX = deltaX / 拡縮率;
        const newWidth = this._size.x.minus(new Px長さ(補正されたdeltaX));
        this._componentRoot.setViewportPositionByTransform(this._position.toビューポート座標値());
        this.set付箋ボードTransform({size:new Px2DVector(newWidth, this._size.y), position:this._position.plus(Px2DVector.fromNumbers(補正されたdeltaX,0)) as 座標点T});
        this.update接続点座標();
        this._onResize?.();
    }

    private rightHandleドラッグ中(e: Drag中値): void {
        const deltaX = e.data.直前のマウス位置から現在位置までの差分.x;
        // 拡縮率を考慮: 視覚的に正しい移動量にするため、deltaXを拡縮率で割る
        const 拡縮率 = this._position.拡縮率;
        const 補正されたdeltaX = deltaX / 拡縮率;
        const newWidth = this._size.x.plus(new Px長さ(補正されたdeltaX));
        this.set付箋ボードTransform({size:new Px2DVector(newWidth, this._size.y)});
        this.update接続点座標();
        this._onResize?.();
    }


    /**
     * 付箋ボードのTransformを設定する
     * paddingを使用してホバー領域を拡張する
     * 
     * 構造:
     * - 付箋ボード全体のサイズ = コンテンツサイズ + padding*2
     * - paddingは要素内部なのでオフセット計算不要
     * - positionは付箋ボードの左上角（padding含む）を指す
     */
    private set付箋ボードTransform(rect: {size?: Px2DVector, position?: 座標点T}):this{
        if (rect.position) {this._position = rect.position;}
        if (rect.size) {this._size = rect.size;}
        
        // paddingを含めた全体サイズ
        const 全体幅 = this._size.x.plus(this._hoverPadding.multiply(2));
        const 全体高さ = this._size.y.plus(this._hoverPadding.multiply(2));

        // マージン分だけ左上にオフセットした位置（border原点がpositionと一致するように）
        const offsetPosition = this._position.minus(
            new Px2DVector(this._hoverPadding, this._hoverPadding)
        );
        
        this.付箋ホバー領域.setStyleCSS({
            width: 全体幅.toStr(),
            height: 全体高さ.toStr(),
            padding: this._hoverPadding.toStr(),
            boxSizing: "border-box",
        });
        this.付箋ホバー領域.setViewportPositionByTransform(offsetPosition.toビューポート座標値());
        return this;
    }


    public add矢印接続可能なもの( v矢印接続可能なもの:矢印接続可能なもの<座標点T>){
        this.child(
            v矢印接続可能なもの.setStyleCSS({
                zIndex: 配置物zIndex.付箋内部構造.ホバー用四角形
            })
        )
    }

    /**
     * 矢印接続ポイントを計算する
     * @param padding 付箋の外側に配置する接続ポイントのパディング
     * @returns 上下左右の接続ポイント座標
     */
    public calculate矢印接続ポイント(padding: Px長さ): 絶対矢印上下左右Position<座標点T> {
        const 付箋view横幅の半分 = this.get横幅の半分();
        const 付箋view縦幅の半分 = this.get縦幅の半分();
        const 付箋view重心 = this.get重心位置();
        
        return {
            上: 付箋view重心.minus(new Px2DVector(new Px長さ(0), 付箋view縦幅の半分.plus(padding))) as 座標点T,
            下: 付箋view重心.plus(new Px2DVector(new Px長さ(0), 付箋view縦幅の半分.plus(padding))) as 座標点T,
            左: 付箋view重心.minus(new Px2DVector(付箋view横幅の半分.plus(padding), new Px長さ(0))) as 座標点T,
            右: 付箋view重心.plus(new Px2DVector(付箋view横幅の半分.plus(padding), new Px長さ(0))) as 座標点T
        };
    }

    public calculate矢印接続ポイント相対Transform(position: 絶対矢印上下左右Position<座標点T>): 矢印上下左右Position<座標点T>{
        return {
            絶対: position,
            相対: {
                上: position.上.px2DVector.minus(this._position.px2DVector),
                下: position.下.px2DVector.minus(this._position.px2DVector),
                左: position.左.px2DVector.minus(this._position.px2DVector),
                右: position.右.px2DVector.minus(this._position.px2DVector)
            }
        }
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

    public onClick(callback: TypedEventListener<'click'>): this {
        this._componentRoot.onClick(callback);
        return this;
    }

    public onHover(callback: TypedEventListener<'mouseover'>): this {
        this._componentRoot.onMouseOver(callback);
        return this;
    }


    /** 選択状態を設定し、アウトラインを更新 */
    public set選択状態(状態: 付箋選択状態): void {
        this.付箋ホバー領域.setStyleCSS({
            outline: this.getアウトラインスタイル(状態),
            outlineOffset: "0px",
            transition: "outline 0.2s ease-in-out"
        });
    }

    /** テキストを取得 */
    public get text(): string {
        return this._text;
    }

    /** 状態に応じたアウトラインスタイルを取得 */
    private getアウトラインスタイル(状態: 付箋選択状態): string {
        switch (状態) {
            case 付箋選択状態.選択:
                return "2px dashed red";           // 赤
            case 付箋選択状態.ホバー:
                return "2px dashed #4caf50";       // 緑
            case 付箋選択状態.矢印選択:
                return "2px dashed #a5d6a7";       // 薄い緑
            case 付箋選択状態.なし:
            default:
                return "none";                     // 透明
        }
    }

    /**
     * 接続点座標を再計算して更新する
     */
    public update接続点座標(): void {
        this._矢印接続可能なもの.update接続点座標(this.calculate矢印接続ポイント相対Transform(this.calculate矢印接続ポイント(this._padding)));
    }

    public 選択状態のzIndexにする(): void {
        this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.選択中 });
    }

    public 通常状態のzIndexにする(): void {
        this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.未選択 });
    }

    public 設定を適用(設定: 付箋設定状態): void {
        // グラデーションを使ってcontent-boxにのみ色を塗る（padding部分は透明のまま）
        this.付箋ホバー領域.setStyleCSS({
            background: `linear-gradient(${設定.背景色}, ${設定.背景色}) content-box`,
            backgroundColor: "transparent"
        });
        if (this._textArea) {
            this._textArea.setStyleCSS({
                fontSize: `${設定.文字サイズ}px`,
                color: 設定.文字色
            });
        }
    }

}

class 付箋ヘッダー extends LV2HtmlComponentBase{
    protected _componentRoot: HtmlComponentBase;
    private _mouseWife!: MouseWife;
    public get mouseWife(): MouseWife { return this._mouseWife; }
    private _onDelete?: () => void;

    public constructor(ヘッダー高さ: Px長さ,onDelete?: () => void) {
        super();
        this._onDelete = onDelete;
        this._componentRoot = this.createComponentRoot(ヘッダー高さ);
    }

    protected createComponentRoot(ヘッダー高さ: Px長さ): HtmlComponentBase {
        return new DivC({ class: sticky_note_header }).setStyleCSS({
                    height: ヘッダー高さ.toStr(),})
                .childs([
                    new DivC({ class: sticky_note_title, text :"付箋" }),
                    new DivC({ class: sticky_note_close_button ,text: "×"})
                        .addDivEventListener("click", (e) => {
                            e.stopPropagation();
                            this._onDelete?.();
                        })
                ])
                .bind((header) => {this._mouseWife = new MouseWife(header); })
    }
}

class リサイズハンドル extends LV2HtmlComponentBase{
    protected _componentRoot: HtmlComponentBase;
    private _mouseWife!: MouseWife;
    public get mouseWife(): MouseWife { return this._mouseWife; }

    public constructor(左右: 'left' | 'right') {
        super();
        this._componentRoot = this.createComponentRoot(左右);
    }

    protected createComponentRoot(左右: 'left' | 'right'): HtmlComponentBase {
        return new DivC({ class: 左右 == 'left' ? auto_resize_handle_left : auto_resize_handle_right })
            .bind((handle) => {this._mouseWife = new MouseWife(handle) });
    }
}
