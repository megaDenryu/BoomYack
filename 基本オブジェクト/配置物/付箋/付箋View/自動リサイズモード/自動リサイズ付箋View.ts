import { DivC, LV2HtmlComponentBase, MouseStateManager, Px長さ } from "SengenUI/index";


import { テキストエリアサイズパラメータ, 自動リサイズテキストエリア } from "./自動リサイズテキストエリア";
import { I自動リサイズ付箋View } from "../../../../I配置物";
import { I自動リサイズ付箋View操作 } from "./I自動リサイズ付箋View操作";

import { 
    sticky_note_container, 
    sticky_note_header,
    sticky_note_close_button,
    sticky_note_title,
    auto_resize_sticky_note,
    auto_resize_handle_left,
    auto_resize_handle_right
} from "../style.css";


/**
 * 自動リサイズ対応付箋コンポーネント
 * テキスト量に応じて高さが自動調整される付箋
 * 通常の付箋と異なり、スクロールバーは表示されず、高さが動的に変化する
 */

export interface 自動リサイズ付箋Viewオプション {
    initialPosition?: { x: number; y: number };
    initialWidth?: number;
    initialText?: string;
    placeholder?: string;
    minHeight?: number;
    onTextChange?: (text: string) => void;
    onPositionChange?: (x: number, y: number) => void;
    onDelete?: () => void;
}

export class 自動リサイズ付箋View extends LV2HtmlComponentBase implements I自動リサイズ付箋View, I自動リサイズ付箋View操作 {
    protected _componentRoot: DivC;
    
    private _textArea!: 自動リサイズテキストエリア;
    private _eventCleanupHandlers: (() => void)[] = [];
    private _mouseStateManager: MouseStateManager;
    private _minWidth: number = 150;
    private _position: { x: number; y: number };
    private _size: { width: number; height: number };
    private _text: string;
    private _minHeight: number = 80;
    
    private _onTextChange: (text: string) => void;
    private _onPositionChange: (x: number, y: number) => void;
    private _onDelete: () => void;

    constructor(options: 自動リサイズ付箋Viewオプション) {
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

        this._mouseStateManager = MouseStateManager.instance()//new MouseStateManager();

        this._componentRoot = this.createComponentRoot();
        this.updatePosition();
    }

    protected createComponentRoot(): DivC {
        return new DivC({ class: [sticky_note_container, auto_resize_sticky_note] })
            .setStyleCSS({
                position: "absolute",
                width: `${this._size.width}px`,
                minHeight: `${this._minHeight}px`
            })
            .childs([
                new DivC({ class: sticky_note_header })
                    .childs([
                        new DivC({ class: sticky_note_title }).setTextContent("付箋"),
                        new DivC({ class: sticky_note_close_button })
                            .setTextContent("×")
                            .addDivEventListener("click", (e) => {
                                e.stopPropagation();
                                this._onDelete();
                            })
                    ])
                    .bind((header) => { this.setupDragHandling(header); }),
                
                new DivC()
                    .setStyleCSS({
                        flex: "1",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: `${this._minHeight - 30}px`
                    })
                    .childs([
                        new 自動リサイズテキストエリア({
                            initialText: this._text,
                            placeholder: "付箋の内容を入力...",
                            初期テキストエリアサイズパラメータ: new テキストエリアサイズパラメータ().setMinHeight(new Px長さ(this._minHeight - 30 - 16)),
                            onTextChange: (text: string) => { this._text = text; this._onTextChange(text); },
                            onHeightChange: (newHeight: number) => {
                                const totalHeight = newHeight + 30 + 16;
                                this._size.height = totalHeight;
                                this._componentRoot?.setStyleCSS({ height: `${totalHeight}px` });
                            }
                        }).bind((textArea) => { this._textArea = textArea; })
                    ]),
                
                new DivC({ class: auto_resize_handle_left })
                    .bind((leftHandle) => { this.setupResizeHandling(leftHandle, 'left'); }),
                
                new DivC({ class: auto_resize_handle_right })
                    .bind((rightHandle) => { this.setupResizeHandling(rightHandle, 'right'); })
            ]);
    }
    
    private setupDragHandling(header: DivC): void {
        let initialPositionX = 0;
        let initialPositionY = 0;
        let isSelected = false;
        
        const onMouseDown = (e:MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.textContent === '×' || target.closest('[class*="close_button"]')) return;
            e.preventDefault();
            const operationHistory = this._mouseStateManager.マウスダウン時のマウス情報(e);
            initialPositionX = this._position.x;
            initialPositionY = this._position.y;
            isSelected = true;
        };
        
        const onMouseMove = (e: MouseEvent) => {
            const updatedHistory = this._mouseStateManager.マウス移動時のマウス情報(e);
            
            if (updatedHistory && this._mouseStateManager.isDrag(updatedHistory)) {
                if (!isSelected) {
                    return;
                }
                
                this._position.x = initialPositionX + updatedHistory.ドラッグ開始位置から現在位置までの差分.x;
                this._position.y = initialPositionY + updatedHistory.ドラッグ開始位置から現在位置までの差分.y;
                
                this.updatePosition()._onPositionChange(this._position.x, this._position.y);
            }
        };
        
        const onMouseUp = (e: MouseEvent) => {
            const finalHistory = this._mouseStateManager.マウスアップ時のマウス情報(e);
            isSelected = false;
        };
        
        header.addDivEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        
        this._eventCleanupHandlers.push(() => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        });
    }
    
    private setupResizeHandling(handle: DivC, direction: 'left' | 'right'): void {
        let isResizing = false;
        let resizeStartX = 0;
        let initialWidth = 0;
        let initialX = 0;
        
        const onMouseDown = (e: MouseEvent) => {
            const updateHistory = this._mouseStateManager.マウスダウン時のマウス情報(e);
            e.preventDefault();
            e.stopPropagation();
            
            isResizing = true;
            resizeStartX = updateHistory.現在のマウス位置.x;
            initialWidth = this._size.width; //コンストラクタでこのviewの値が設定される。
            initialX = this._position.x;
        };
        
        /**
         * 辺をリサイズ時のマウスムーブは
         * 1. マウスの移動量を取得
         * 2. 「適用したい値」を入力して移動量を加算して新しい値をreturn
         * 3. 新しい値を適用したい値に適用
         * つまり、サイズはreactive propertyにすべき。
         * 
         * そして座標が変わるほうは、サイズもreactive propertyにすべき。
         * @param e 
         * @returns 
         */
        const onMouseMove = (e: MouseEvent) => {
            const updateHistory = this._mouseStateManager.マウス移動時のマウス情報(e);
            if (!updateHistory) return;
            if (!isResizing) return;

            const deltaX = updateHistory.現在のマウス位置.x - resizeStartX;
            
            if (direction === 'left') {
                this._size.width = Math.max(this._minWidth, initialWidth - deltaX);
                this._position.x = initialX + (initialWidth - this._size.width);
            } else {
                this._size.width = Math.max(this._minWidth, initialWidth + deltaX);
            }
            
            this._componentRoot.setStyleCSS({
                width: `${this._size.width}px`,
                left: `${this._position.x}px`
            });
            
            this._onPositionChange(this._position.x, this._position.y);
        };
        
        const handleMouseUp = (e: MouseEvent) => {
            const finalHistory = this._mouseStateManager.マウスアップ時のマウス情報(e);
            isResizing = false;
        };
        
        handle.addDivEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        this._eventCleanupHandlers.push(() => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        });
    }
    
    private updatePosition(): this {
        this._componentRoot.setStyleCSS({
            left: `${this._position.x}px`,
            top: `${this._position.y}px`
        });
        return this;
    }

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

    public blur(): void {
        this._textArea?.blur();
    }

    public delete(): void {
        this._eventCleanupHandlers.forEach(cleanup => cleanup());
        this._eventCleanupHandlers = [];
        
        this._textArea?.delete();
        
        super.delete();
    }
}
