/**
 * 付箋の操作インターフェース
 * テキスト操作、位置・サイズ設定、スタイル変更、フォーカス制御を提供
 */
export interface I付箋View操作 {
    /**
     * 付箋のテキストを設定する
     * @param text 設定するテキスト
     */
    setText(text: string): void;

    /**
     * 付箋のテキストを取得する
     * @returns 現在のテキスト
     */
    getText(): string;

    /**
     * 付箋の位置を設定する
     * @param x X座標
     * @param y Y座標
     */
    setPosition(x: number, y: number): void;

    /**
     * 付箋の位置を取得する
     * @returns 現在の位置 {x, y}
     */
    getPosition(): { x: number; y: number };

    /**
     * 付箋のサイズを設定する
     * @param width 幅（最小100px）
     * @param height 高さ（最小80px）
     */
    setSize(width: number, height: number): void;

    /**
     * 付箋のサイズを取得する
     * @returns 現在のサイズ {width, height}
     */
    getSize(): { width: number; height: number };

    /**
     * 付箋の背景色を設定する
     * @param color CSS形式の色（例: "#ffeb3b", "rgba(255, 235, 59, 0.8)"）
     */
    setBackgroundColor(color: string): void;

    /**
     * 付箋のテキストエリアにフォーカスを当てる
     */
    focus(): void;

    /**
     * 付箋のテキストエリアからフォーカスを外す
     */
    blur(): void;
}