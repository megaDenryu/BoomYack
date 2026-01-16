import { DivC, LV2HtmlComponentBase, TextAreaC } from "SengenUI/index";


import { I付箋View } from "../../I配置物";

import { sticky_note_container, drag_handle, main_container, sticky_note_textarea, resize_handle, resize_handle_top, resize_handle_bottom, resize_handle_left, resize_handle_right, resize_handle_top_left, resize_handle_top_right, resize_handle_bottom_left, resize_handle_bottom_right } from "./付箋View/style.css";
import { I付箋View操作 } from "./付箋View/スクロール可能モード/I付箋View操作";



/**
 * テキスト編集（インライン編集・自動リサイズ・改行対応）
 * ４辺と頂点にリサイズハンドルを持つ
 * ドラッグで移動可能
 */
export class 付箋View extends LV2HtmlComponentBase implements I付箋View操作 {
    protected _componentRoot: DivC;
    private _mainContainer: DivC;
    private _textArea: TextAreaC;
    private _dragHandle: DivC;
    
    // リサイズハンドル
    private _resizeHandles: {
        top: DivC;
        bottom: DivC;
        left: DivC;
        right: DivC;
        topLeft: DivC;
        topRight: DivC;
        bottomLeft: DivC;
        bottomRight: DivC;
    };
    
    // 付箋のプロパティ
    private _text: string = "";
    private _backgroundColor: string;
    private _width: number;
    private _height: number;
    private _x: number;
    private _y: number;
    
    // ドラッグ状態
    private _isDragging: boolean = false;
    private _isResizing: boolean = false;
    private _dragStartX: number = 0;
    private _dragStartY: number = 0;
    private _resizeType: string | null = null;
    private _initialWidth: number = 0;
    private _initialHeight: number = 0;
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
        // グローバルマウスイベントのみここで設定
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    protected createComponentRoot(): DivC {
        // 直接returnするように努めることで、宣言的になり、可読性が極大化される
        return new DivC({ class: sticky_note_container })
                .setStyleCSS({
                    position: 'fixed',
                    left: '0px',
                    top: '0px',
                    transform: `translate(${this._x}px, ${this._y}px)`,
                    width: `${this._width}px`,
                    height: `${this._height}px`,
                    backgroundColor: this._backgroundColor
                })
                .childs([
                    // ドラッグハンドル（ヘッダー部分）
                    new DivC({ class: drag_handle })
                        .addDivEventListener('mousedown', (e) => {
                            e.preventDefault();
                            this._isDragging = true;
                            this._dragStartX = e.clientX;
                            this._dragStartY = e.clientY;
                            this._initialX = this._x;
                            this._initialY = this._y;
                        })
                        .bind((handle) => { this._dragHandle = handle; }),
                    
                    // メインコンテナ
                    new DivC({ class: main_container })
                        .bind((container) => { this._mainContainer = container; })
                        .childs([
                            // テキストエリア
                            new TextAreaC({
                                value: this._text,
                                placeholder: "付箋のテキストを入力...",
                                class: sticky_note_textarea
                            })
                            .addTextAreaEventListener('input', () => { this._text = this.getText(); })
                            .addTextAreaEventListener('focus', (e) => { (e.target as HTMLTextAreaElement).style.outline = "2px solid #2196f3"; })
                            .addTextAreaEventListener('blur', (e) => {(e.target as HTMLTextAreaElement).style.outline = "none";})
                            .addTextAreaEventListener('mousedown', (e) => { e.stopPropagation(); })// ドラッグとの競合を回避 
                            .bind((textarea) => { this._textArea = textarea; })
                        ]),
                    
                    // リサイズハンドル群
                    ...this.createResizeHandles()
                ]);
    }

    private createResizeHandles(): DivC[] {
        const handleSize = 8;
        const cornerSize = 12;
        
        // 直接returnするように努めることで、宣言的になり、可読性が極大化される
        return [
            // 上辺
            new DivC({ class: [resize_handle, resize_handle_top] })
                .setStyleCSS({
                    top: "-4px",
                    left: "10px",
                    right: "10px",
                    height: `${handleSize}px`
                })
                .addDivEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._isResizing = true;
                    this._resizeType = 'top';
                    this._dragStartX = e.clientX;
                    this._dragStartY = e.clientY;
                    this._initialWidth = this._width;
                    this._initialHeight = this._height;
                    this._initialX = this._x;
                    this._initialY = this._y;
                })
                .bind((handle) => { this._resizeHandles = { ...this._resizeHandles, top: handle }; }),
            
            // 下辺
            new DivC({ class: [resize_handle, resize_handle_bottom] })
                .setStyleCSS({
                    bottom: "-4px",
                    left: "10px",
                    right: "10px",
                    height: `${handleSize}px`
                })
                .addDivEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._isResizing = true;
                    this._resizeType = 'bottom';
                    this._dragStartX = e.clientX;
                    this._dragStartY = e.clientY;
                    this._initialWidth = this._width;
                    this._initialHeight = this._height;
                    this._initialX = this._x;
                    this._initialY = this._y;
                })
                .bind((handle) => { this._resizeHandles = { ...this._resizeHandles, bottom: handle }; }),
            
            // 左辺
            new DivC({ class: [resize_handle, resize_handle_left] })
                .setStyleCSS({
                    left: "-4px",
                    top: "10px",
                    bottom: "10px",
                    width: `${handleSize}px`
                })
                .addDivEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._isResizing = true;
                    this._resizeType = 'left';
                    this._dragStartX = e.clientX;
                    this._dragStartY = e.clientY;
                    this._initialWidth = this._width;
                    this._initialHeight = this._height;
                    this._initialX = this._x;
                    this._initialY = this._y;
                })
                .bind((handle) => { this._resizeHandles = { ...this._resizeHandles, left: handle }; }),
            
            // 右辺
            new DivC({ class: [resize_handle, resize_handle_right] })
                .setStyleCSS({
                    right: "-4px",
                    top: "10px",
                    bottom: "10px",
                    width: `${handleSize}px`
                })
                .addDivEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._isResizing = true;
                    this._resizeType = 'right';
                    this._dragStartX = e.clientX;
                    this._dragStartY = e.clientY;
                    this._initialWidth = this._width;
                    this._initialHeight = this._height;
                    this._initialX = this._x;
                    this._initialY = this._y;
                })
                .bind((handle) => { this._resizeHandles = { ...this._resizeHandles, right: handle }; }),
            
            // 左上角
            new DivC({ class: [resize_handle, resize_handle_top_left] })
                .setStyleCSS({
                    top: "-6px",
                    left: "-6px",
                    width: `${cornerSize}px`,
                    height: `${cornerSize}px`
                })
                .addDivEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._isResizing = true;
                    this._resizeType = 'topLeft';
                    this._dragStartX = e.clientX;
                    this._dragStartY = e.clientY;
                    this._initialWidth = this._width;
                    this._initialHeight = this._height;
                    this._initialX = this._x;
                    this._initialY = this._y;
                })
                .bind((handle) => { this._resizeHandles = { ...this._resizeHandles, topLeft: handle }; }),
            
            // 右上角
            new DivC({ class: [resize_handle, resize_handle_top_right] })
                .setStyleCSS({
                    top: "-6px",
                    right: "-6px",
                    width: `${cornerSize}px`,
                    height: `${cornerSize}px`
                })
                .addDivEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._isResizing = true;
                    this._resizeType = 'topRight';
                    this._dragStartX = e.clientX;
                    this._dragStartY = e.clientY;
                    this._initialWidth = this._width;
                    this._initialHeight = this._height;
                    this._initialX = this._x;
                    this._initialY = this._y;
                })
                .bind((handle) => { this._resizeHandles = { ...this._resizeHandles, topRight: handle }; }),
            
            // 左下角
            new DivC({ class: [resize_handle, resize_handle_bottom_left] })
                .setStyleCSS({
                    bottom: "-6px",
                    left: "-6px",
                    width: `${cornerSize}px`,
                    height: `${cornerSize}px`
                })
                .addDivEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._isResizing = true;
                    this._resizeType = 'bottomLeft';
                    this._dragStartX = e.clientX;
                    this._dragStartY = e.clientY;
                    this._initialWidth = this._width;
                    this._initialHeight = this._height;
                    this._initialX = this._x;
                    this._initialY = this._y;
                })
                .bind((handle) => { this._resizeHandles = { ...this._resizeHandles, bottomLeft: handle }; }),
            
            // 右下角
            new DivC({ class: [resize_handle, resize_handle_bottom_right] })
                .setStyleCSS({
                    bottom: "-6px",
                    right: "-6px",
                    width: `${cornerSize}px`,
                    height: `${cornerSize}px`
                })
                .addDivEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this._isResizing = true;
                    this._resizeType = 'bottomRight';
                    this._dragStartX = e.clientX;
                    this._dragStartY = e.clientY;
                    this._initialWidth = this._width;
                    this._initialHeight = this._height;
                    this._initialX = this._x;
                    this._initialY = this._y;
                })
                .bind((handle) => { this._resizeHandles = { ...this._resizeHandles, bottomRight: handle }; })
        ];
    }
    
    private handleMouseMove(e: MouseEvent): void {
        if (this._isDragging && !this._isResizing) {
            // ドラッグ処理
            const deltaX = e.clientX - this._dragStartX;
            const deltaY = e.clientY - this._dragStartY;
            this._x = this._initialX + deltaX;
            this._y = this._initialY + deltaY;
            this.updatePosition();
        } else if (this._isResizing && this._resizeType) {
            // リサイズ処理
            this.handleResize(e);
        }
    }
    
    private handleMouseUp(): void {
        this._isDragging = false;
        this._isResizing = false;
        this._resizeType = null;
    }
    
    private handleResize(e: MouseEvent): void {
        const deltaX = e.clientX - this._dragStartX;
        const deltaY = e.clientY - this._dragStartY;
        
        let newWidth = this._initialWidth;
        let newHeight = this._initialHeight;
        let newX = this._initialX;
        let newY = this._initialY;
        
        switch (this._resizeType) {
            case 'top':
                newHeight = Math.max(80, this._initialHeight - deltaY);
                newY = this._initialY + (this._initialHeight - newHeight);
                break;
            case 'bottom':
                newHeight = Math.max(80, this._initialHeight + deltaY);
                break;
            case 'left':
                newWidth = Math.max(100, this._initialWidth - deltaX);
                newX = this._initialX + (this._initialWidth - newWidth);
                break;
            case 'right':
                newWidth = Math.max(100, this._initialWidth + deltaX);
                break;
            case 'topLeft':
                newWidth = Math.max(100, this._initialWidth - deltaX);
                newHeight = Math.max(80, this._initialHeight - deltaY);
                newX = this._initialX + (this._initialWidth - newWidth);
                newY = this._initialY + (this._initialHeight - newHeight);
                break;
            case 'topRight':
                newWidth = Math.max(100, this._initialWidth + deltaX);
                newHeight = Math.max(80, this._initialHeight - deltaY);
                newY = this._initialY + (this._initialHeight - newHeight);
                break;
            case 'bottomLeft':
                newWidth = Math.max(100, this._initialWidth - deltaX);
                newHeight = Math.max(80, this._initialHeight + deltaY);
                newX = this._initialX + (this._initialWidth - newWidth);
                break;
            case 'bottomRight':
                newWidth = Math.max(100, this._initialWidth + deltaX);
                newHeight = Math.max(80, this._initialHeight + deltaY);
                break;
        }
        
        this._width = newWidth;
        this._height = newHeight;
        this._x = newX;
        this._y = newY;
        
        this.updateSize();
        this.updatePosition();
    }
    
    private updatePosition(): void {
        this._componentRoot.setStyleCSS({
            transform: `translate(${this._x}px, ${this._y}px)`
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
        this._textArea?.setValue(text);
    }

    public getText(): string {
        return this._textArea?.getValue() ?? this._text;
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
        this._textArea?.focus();
    }

    public blur(): void {
        // TextAreaのblurは自動的に処理される
    }
}
