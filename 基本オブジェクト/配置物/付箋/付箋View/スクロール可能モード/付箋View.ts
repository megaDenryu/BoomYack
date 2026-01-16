import { DivC, LV2HtmlComponentBase } from "SengenUI/index";


import { I付箋View } from "../../../../I配置物";
import { sticky_note_container, main_container } from "../style.css";
import { I付箋View操作 } from "./I付箋View操作";
import { DragHandler } from "../DragHandler";
import { ResizeHandler, ResizeResult } from "../ResizeHandler";
import { StickyNoteTextArea } from "./StickyNoteTextArea";



/**
 * テキスト編集（インライン編集・自動リサイズ・改行対応）
 * ４辺と頂点にリサイズハンドルを持つ
 * ドラッグで移動可能
 */
export class 付箋View extends LV2HtmlComponentBase implements I付箋View操作 {
    protected _componentRoot: DivC;
    private _mainContainer!: DivC;
    private _textAreaComponent!: StickyNoteTextArea;
    private _dragHandler!: DragHandler;
    private _resizeHandler!: ResizeHandler;
    
    // 付箋のプロパティ
    private _text: string = "";
    private _backgroundColor: string;
    private _width: number;
    private _height: number;
    private _x: number;
    private _y: number;
    
    // 初期値保存用（DragHandler用）
    private _initialX: number = 0;
    private _initialY: number = 0;

    constructor(options?: {
        text?: string;
        width?: number;
        height?: number;
        x?: number;
        y?: number;
        backgroundColor?: string;
    }) {
        // 基本的にこの順番で初期化する
        super();
        this._text = options?.text ?? "新しい付箋";
        this._backgroundColor = options?.backgroundColor ?? "#ffeb3b";
        this._width = options?.width ?? 200;
        this._height = options?.height ?? 150;
        this._x = options?.x ?? 0;
        this._y = options?.y ?? 0;
        
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): DivC {
        // 直接returnするように努めることで、宣言的になり、可読性が極大化される
        return new DivC({ class: sticky_note_container })
                .setStyleCSS({
                    left: `${this._x}px`,
                    top: `${this._y}px`,
                    width: `${this._width}px`,
                    height: `${this._height}px`,
                    backgroundColor: this._backgroundColor
                })
                .childs([
                    // ドラッグハンドラーコンポーネント
                    new DragHandler({
                        onDragMove: (deltaX: number, deltaY: number, initialX: number, initialY: number) => {
                            // 初期位置 + 差分で新しい位置を計算
                            this._x = this._initialX + deltaX;
                            this._y = this._initialY + deltaY;
                            this.updatePosition();
                        },
                        onDragStart: (initialX: number, initialY: number) => {
                            // ドラッグ開始時の初期位置を記録
                            this._initialX = this._x;
                            this._initialY = this._y;
                        }
                    }).bind((dragHandler) => { this._dragHandler = dragHandler; }),
                    
                    // メインコンテナ
                    new DivC({ class: main_container })
                        .bind((container) => { this._mainContainer = container; })
                        .childs([
                            // テキストエリアコンポーネント
                            new StickyNoteTextArea({
                                initialText: this._text,
                                placeholder: "付箋のテキストを入力...",
                                onTextChange: (text: string) => {
                                    this._text = text;
                                }
                            }).bind((textAreaComponent) => { this._textAreaComponent = textAreaComponent; })
                        ]),
                    
                    // リサイズハンドラーコンポーネント
                    new ResizeHandler({
                        onResizeMove: (result: ResizeResult) => {
                            this._width = result.width;
                            this._height = result.height;
                            this._x = result.x;
                            this._y = result.y;
                            this.updateSize();
                            this.updatePosition();
                        },
                        onResizeStart: (resizeType) => {
                            // リサイズ開始時の初期値をResizeHandlerに設定
                            this._resizeHandler.setInitialValues(this._width, this._height, this._x, this._y);
                        }
                    }).bind((resizeHandler) => { this._resizeHandler = resizeHandler; })
                ]);
    }
    
    private updatePosition(): void {
        this._componentRoot.setStyleCSS({
            left: `${this._x}px`,
            top: `${this._y}px`
        });
    }
    
    private updateSize(): void {
        this._componentRoot.setStyleCSS({
            width: `${this._width}px`,
            height: `${this._height}px`
        });
    }

    // 公開メソッド
    public setText(text: string): void {
        this._text = text;
        this._textAreaComponent.setValue(text);
    }

    public getText(): string {
        return this._textAreaComponent.getValue();
    }

    public setPosition(x: number, y: number): void {
        this._x = x;
        this._y = y;
        this.updatePosition();
    }

    public getPosition(): { x: number; y: number } {
        return { x: this._x, y: this._y };
    }

    public setSize(width: number, height: number): void {
        this._width = Math.max(100, width);
        this._height = Math.max(80, height);
        this.updateSize();
    }

    public getSize(): { width: number; height: number } {
        return { width: this._width, height: this._height };
    }

    public setBackgroundColor(color: string): void {
        this._backgroundColor = color;
        this._componentRoot.setStyleCSS({
            backgroundColor: color
        });
    }

    public focus(): void {
        this._textAreaComponent.focus();
    }

    public blur(): void {
        this._textAreaComponent.blur();
    }
}
