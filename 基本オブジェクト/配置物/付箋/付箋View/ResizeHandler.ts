import { DivC, LV2HtmlComponentBase } from "SengenUI/index";


import { resize_handle, resize_handle_top, resize_handle_bottom, resize_handle_left, resize_handle_right, resize_handle_top_left, resize_handle_top_right, resize_handle_bottom_left, resize_handle_bottom_right } from "./style.css";

/**
 * リサイズタイプの定義
 */
export type ResizeType = 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

/**
 * リサイズ結果の型定義
 */
export interface ResizeResult {
    width: number;
    height: number;
    x: number;
    y: number;
}

/**
 * リサイズ機能専用コンポーネント
 * 8つのリサイズハンドル（4辺 + 4角）とリサイズイベント処理を担当
 */
export class ResizeHandler extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    
    // リサイズ状態
    private _isResizing: boolean = false;
    private _dragStartX: number = 0;
    private _dragStartY: number = 0;
    private _resizeType: ResizeType | null = null;
    private _initialWidth: number = 0;
    private _initialHeight: number = 0;
    private _initialX: number = 0;
    private _initialY: number = 0;
    
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
    
    // コールバック
    private _onResizeMove: (result: ResizeResult) => void;
    private _onResizeStart: (resizeType: ResizeType) => void;
    private _onResizeEnd: () => void;

    constructor(options: {
        onResizeMove: (result: ResizeResult) => void;
        onResizeStart?: (resizeType: ResizeType) => void;
        onResizeEnd?: () => void;
    }) {
        super();
        this._onResizeMove = options.onResizeMove;
        this._onResizeStart = options.onResizeStart ?? (() => {});
        this._onResizeEnd = options.onResizeEnd ?? (() => {});
        this._componentRoot = this.createComponentRoot();
        
        // グローバルマウスイベントを設定
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    protected createComponentRoot(): DivC {
        return new DivC().childs(this.createResizeHandles());
    }

    private createResizeHandles(): DivC[] {
        const handleSize = 8;
        const cornerSize = 12;
        
        return [
            // 上辺
            new DivC({ class: [resize_handle, resize_handle_top] })
                .setStyleCSS({
                    top: "-4px",
                    left: "10px",
                    right: "10px",
                    height: `${handleSize}px`
                })
                .addDivEventListener('mousedown', (e) => this.startResize(e, 'top'))
                .bind((handle) => { this._resizeHandles = { ...this._resizeHandles, top: handle }; }),
            
            // 下辺
            new DivC({ class: [resize_handle, resize_handle_bottom] })
                .setStyleCSS({
                    bottom: "-4px",
                    left: "10px",
                    right: "10px",
                    height: `${handleSize}px`
                })
                .addDivEventListener('mousedown', (e) => this.startResize(e, 'bottom'))
                .bind((handle) => { this._resizeHandles = { ...this._resizeHandles, bottom: handle }; }),
            
            // 左辺
            new DivC({ class: [resize_handle, resize_handle_left] })
                .setStyleCSS({
                    left: "-4px",
                    top: "10px",
                    bottom: "10px",
                    width: `${handleSize}px`
                })
                .addDivEventListener('mousedown', (e) => this.startResize(e, 'left'))
                .bind((handle) => { this._resizeHandles = { ...this._resizeHandles, left: handle }; }),
            
            // 右辺
            new DivC({ class: [resize_handle, resize_handle_right] })
                .setStyleCSS({
                    right: "-4px",
                    top: "10px",
                    bottom: "10px",
                    width: `${handleSize}px`
                })
                .addDivEventListener('mousedown', (e) => this.startResize(e, 'right'))
                .bind((handle) => { this._resizeHandles = { ...this._resizeHandles, right: handle }; }),
            
            // 左上角
            new DivC({ class: [resize_handle, resize_handle_top_left] })
                .setStyleCSS({
                    top: "-6px",
                    left: "-6px",
                    width: `${cornerSize}px`,
                    height: `${cornerSize}px`
                })
                .addDivEventListener('mousedown', (e) => this.startResize(e, 'topLeft'))
                .bind((handle) => { this._resizeHandles = { ...this._resizeHandles, topLeft: handle }; }),
            
            // 右上角
            new DivC({ class: [resize_handle, resize_handle_top_right] })
                .setStyleCSS({
                    top: "-6px",
                    right: "-6px",
                    width: `${cornerSize}px`,
                    height: `${cornerSize}px`
                })
                .addDivEventListener('mousedown', (e) => this.startResize(e, 'topRight'))
                .bind((handle) => { this._resizeHandles = { ...this._resizeHandles, topRight: handle }; }),
            
            // 左下角
            new DivC({ class: [resize_handle, resize_handle_bottom_left] })
                .setStyleCSS({
                    bottom: "-6px",
                    left: "-6px",
                    width: `${cornerSize}px`,
                    height: `${cornerSize}px`
                })
                .addDivEventListener('mousedown', (e) => this.startResize(e, 'bottomLeft'))
                .bind((handle) => { this._resizeHandles = { ...this._resizeHandles, bottomLeft: handle }; }),
            
            // 右下角
            new DivC({ class: [resize_handle, resize_handle_bottom_right] })
                .setStyleCSS({
                    bottom: "-6px",
                    right: "-6px",
                    width: `${cornerSize}px`,
                    height: `${cornerSize}px`
                })
                .addDivEventListener('mousedown', (e) => this.startResize(e, 'bottomRight'))
                .bind((handle) => { this._resizeHandles = { ...this._resizeHandles, bottomRight: handle }; })
        ];
    }
    
    private startResize(e: MouseEvent, resizeType: ResizeType): void {
        e.preventDefault();
        e.stopPropagation();
        this._isResizing = true;
        this._resizeType = resizeType;
        this._dragStartX = e.clientX;
        this._dragStartY = e.clientY;
        this._onResizeStart(resizeType);
    }
    
    // 外部から初期値を設定するメソッド
    public setInitialValues(width: number, height: number, x: number, y: number): void {
        this._initialWidth = width;
        this._initialHeight = height;
        this._initialX = x;
        this._initialY = y;
    }
    
    private handleMouseMove(e: MouseEvent): void {
        if (this._isResizing && this._resizeType) {
            const deltaX = e.clientX - this._dragStartX;
            const deltaY = e.clientY - this._dragStartY;
            
            const result = this.calculateResize(deltaX, deltaY, this._resizeType);
            this._onResizeMove(result);
        }
    }
    
    private handleMouseUp(): void {
        if (this._isResizing) {
            this._isResizing = false;
            this._resizeType = null;
            this._onResizeEnd();
        }
    }
    
    private calculateResize(deltaX: number, deltaY: number, resizeType: ResizeType): ResizeResult {
        let newWidth = this._initialWidth;
        let newHeight = this._initialHeight;
        let newX = this._initialX;
        let newY = this._initialY;
        
        switch (resizeType) {
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
        
        return { width: newWidth, height: newHeight, x: newX, y: newY };
    }
    
    // 外部からリサイズ状態を確認するためのメソッド
    public isResizing(): boolean {
        return this._isResizing;
    }
    
    // リソース解放
    public delete(): void {
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
        super.delete();
    }
}
