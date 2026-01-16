import { DivC, LV2HtmlComponentBase, Px長さ } from "SengenUI/index";


import { DragHandler } from "./DragHandler";
import { 
    sticky_note_container, 
    sticky_note_header,
    sticky_note_close_button,
    sticky_note_title,
    auto_resize_sticky_note
} from "./style.css";
import { テキストエリアサイズパラメータ, 自動リサイズテキストエリア } from "./自動リサイズモード/自動リサイズテキストエリア";


/**
 * 自動リサイズ対応付箋コンポーネント
 * テキスト量に応じて高さが自動調整される付箋
 * 通常の付箋と異なり、スクロールバーは表示されず、高さが動的に変化する
 */
export class AutoResizeStickyNoteView extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    
    private _dragHandler: DragHandler;
    private _textArea: 自動リサイズテキストエリア;
    private _position: { x: number; y: number };
    private _size: { width: number; height: number };
    private _text: string;
    private _minHeight: number = 80;
    
    // コールバック
    private _onTextChange: (text: string) => void;
    private _onPositionChange: (x: number, y: number) => void;
    private _onDelete: () => void;

    constructor(options: {
        initialPosition?: { x: number; y: number };
        initialWidth?: number;
        initialText?: string;
        placeholder?: string;
        minHeight?: number;
        onTextChange?: (text: string) => void;
        onPositionChange?: (x: number, y: number) => void;
        onDelete?: () => void;
    }) {
        super();
        this._position = options.initialPosition ?? { x: 100, y: 100 };
        this._size = { 
            width: options.initialWidth ?? 200, 
            height: this._minHeight 
        };
        this._text = options.initialText ?? "";
        this._minHeight = options.minHeight ?? 80;
        
        this._onTextChange = options.onTextChange ?? (() => {});
        this._onPositionChange = options.onPositionChange ?? (() => {});
        this._onDelete = options.onDelete ?? (() => {});

        this._componentRoot = this.createComponentRoot();
        
        // 初期位置とサイズを適用
        this.updatePosition();
    }

    protected createComponentRoot(): DivC {
        return new DivC({ class: [sticky_note_container, auto_resize_sticky_note] })
            .setStyleCSS({
                position: "absolute",
                width: `${this._size.width}px`,
                minHeight: `${this._minHeight}px`,
                backgroundColor: "#ffeb3b",
                border: "1px solid #fbc02d",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                display: "flex",
                flexDirection: "column",
                overflow: "visible"
            })
            .childs([
                // ドラッグハンドラーと一緒にヘッダー作成
                new DragHandler({
                    onDragStart: () => {},
                    onDragMove: (deltaX, deltaY) => {
                        this._position.x += deltaX;
                        this._position.y += deltaY;
                        this.updatePosition();
                        this._onPositionChange(this._position.x, this._position.y);
                    },
                    onDragEnd: () => {}
                }).bind((dragHandler) => {
                    this._dragHandler = dragHandler;
                }),
                
                // ヘッダー（タイトル + 閉じるボタン）
                new DivC({ class: sticky_note_header })
                    .setStyleCSS({
                        height: "30px",
                        backgroundColor: "#fbc02d",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 8px",
                        cursor: "move",
                        borderBottom: "1px solid #f9a825",
                        flexShrink: "0"
                    })
                    .childs([
                        new DivC({ class: sticky_note_title })
                            .setStyleCSS({
                                fontSize: "12px",
                                color: "#795548",
                                fontWeight: "bold",
                                userSelect: "none"
                            })
                            .setTextContent("付箋"),
                        new DivC({ class: sticky_note_close_button })
                            .setStyleCSS({
                                width: "20px",
                                height: "20px",
                                backgroundColor: "#f44336",
                                color: "white",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                cursor: "pointer",
                                userSelect: "none"
                            })
                            .setTextContent("×")
                            .addDivEventListener("click", (e) => {
                                e.stopPropagation();
                                this._onDelete();
                            })
                    ]),
                
                // コンテンツエリア（自動リサイズテキストエリア）
                new DivC()
                    .setStyleCSS({
                        flex: "1",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: `${this._minHeight - 30}px` // ヘッダーの高さを引く
                    })
                    .childs([
                        new 自動リサイズテキストエリア({
                            initialText: this._text,
                            placeholder: "付箋の内容を入力...",
                            初期テキストエリアサイズパラメータ: new テキストエリアサイズパラメータ().setMinHeight(new Px長さ(this._minHeight - 30 - 16)),
                            onTextChange: (text: string) => {
                                this._text = text;
                                this._onTextChange(text);
                            },
                            onHeightChange: (newHeight: number) => {
                                // テキストエリアの高さが変わった時、付箋全体の高さを更新
                                const totalHeight = newHeight + 30 + 16; // ヘッダー + padding
                                this._size.height = totalHeight;
                                this._componentRoot.setStyleCSS({
                                    height: `${totalHeight}px`
                                });
                            },
                            onFocus: () => {
                                // フォーカス時の処理（必要に応じて）
                            },
                            onBlur: () => {
                                // フォーカスアウト時の処理（必要に応じて）
                            }
                        }).bind((textArea) => {
                            this._textArea = textArea;
                        })
                    ])
            ]);
    }
    
    /**
     * 位置を更新
     */
    private updatePosition(): void {
        this._componentRoot.setStyleCSS({
            left: `${this._position.x}px`,
            top: `${this._position.y}px`
        });
    }

    // 外部API
    public setText(text: string): void {
        this._text = text;
        this._textArea?.setValue(text);
    }

    public getText(): string {
        return this._textArea?.getText() ?? this._text;
    }

    public setPosition(x: number, y: number): void {
        this._position = { x, y };
        this.updatePosition();
    }

    public getPosition(): { x: number; y: number } {
        return { ...this._position };
    }

    public setWidth(width: number): void {
        this._size.width = width;
        this._componentRoot.setStyleCSS({
            width: `${width}px`
        });
    }

    public getWidth(): number {
        return this._size.width;
    }

    public getCurrentHeight(): number {
        return this._size.height;
    }

    public setMinHeight(minHeight: number): void {
        this._minHeight = minHeight;
        this._textArea?.setMinHeight(minHeight - 30 - 16);
        this._componentRoot.setStyleCSS({
            minHeight: `${minHeight}px`
        });
    }

    public focus(): void {
        this._textArea?.focus();
    }

    public delete(): void {
        this._dragHandler?.delete();
        this._textArea?.delete();
        super.delete();
    }
}
