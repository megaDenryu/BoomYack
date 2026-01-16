import { DivC, LV2HtmlComponentBase } from "SengenUI/index";


import { drag_handle } from "./style.css";

/**
 * ドラッグ機能専用コンポーネント
 * ドラッグハンドルとドラッグイベント処理を担当
 */
export class DragHandler extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    
    // ドラッグ状態
    private _isDragging: boolean = false;
    private _dragStartX: number = 0;
    private _dragStartY: number = 0;
    private _initialX: number = 0;
    private _initialY: number = 0;
    
    // コールバック
    private _onDragMove: (deltaX: number, deltaY: number, initialX: number, initialY: number) => void;
    private _onDragStart: (initialX: number, initialY: number) => void;
    private _onDragEnd: () => void;

    constructor(options: {
        onDragMove: (deltaX: number, deltaY: number, initialX: number, initialY: number) => void;
        onDragStart?: (initialX: number, initialY: number) => void;
        onDragEnd?: () => void;
    }) {
        super();
        this._onDragMove = options.onDragMove;
        this._onDragStart = options.onDragStart ?? (() => {});
        this._onDragEnd = options.onDragEnd ?? (() => {});
        this._componentRoot = this.createComponentRoot();
        
        // グローバルマウスイベントを設定
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    protected createComponentRoot(): DivC {
        return new DivC({ class: drag_handle })
            .addDivEventListener('mousedown', (e) => {
                e.preventDefault();
                this._isDragging = true;
                this._dragStartX = e.clientX;
                this._dragStartY = e.clientY;
                this._initialX = 0; // 初期位置は親コンポーネントが管理
                this._initialY = 0;
                this._onDragStart(this._initialX, this._initialY);
            });
    }
    
    private handleMouseMove(e: MouseEvent): void {
        if (this._isDragging) {
            const deltaX = e.clientX - this._dragStartX;
            const deltaY = e.clientY - this._dragStartY;
            this._onDragMove(deltaX, deltaY, this._initialX, this._initialY);
        }
    }
    
    private handleMouseUp(): void {
        if (this._isDragging) {
            this._isDragging = false;
            this._onDragEnd();
        }
    }
    
    // 外部からドラッグ状態を確認するためのメソッド
    public isDragging(): boolean {
        return this._isDragging;
    }
    
    // リソース解放
    public delete(): void {
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
        super.delete();
    }
}
