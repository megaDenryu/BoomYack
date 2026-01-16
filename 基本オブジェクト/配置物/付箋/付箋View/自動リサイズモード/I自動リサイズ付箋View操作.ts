/**
 * 自動リサイズ付箋の操作インターフェース
 * テキスト操作、位置・幅設定、スタイル変更、フォーカス制御を提供
 * 通常の付箋と異なり、高さは自動調整されるため高さの設定はできない
 */
export interface I自動リサイズ付箋View操作 {
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
     * 付箋の幅を設定する
     * @param width 幅（最小150px）
     */
    setWidth(width: number): void;

    /**
     * 付箋の幅を取得する
     * @returns 現在の幅
     */
    getWidth(): number;

    /**
     * 付箋の現在の高さを取得する（読み取り専用）
     * 高さはテキスト量によって自動調整される
     * @returns 現在の高さ
     */
    getCurrentHeight(): number;

    /**
     * 付箋の最小高さを設定する
     * @param minHeight 最小高さ（デフォルト80px）
     */
    setMinHeight(minHeight: number): void;

    /**
     * 付箋のテキストエリアにフォーカスを当てる
     */
    focus(): void;

    /**
     * 付箋のテキストエリアからフォーカスを外す
     */
    blur(): void;
}