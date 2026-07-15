export interface 全ての接続点を表示非表示切り替え可能 {
    全ての接続点を表示非表示切り替え(表示する: boolean): void;
}
export interface I配置物選択機能集約用のキャンバス機能 extends 全ての接続点を表示非表示切り替え可能 {}
export interface 拡縮入力 { 拡縮率: number; 中心X: number; 中心Y: number; }
export interface CanvasViewOptions { canvasId?: string; onSaveClick?: () => void; }
