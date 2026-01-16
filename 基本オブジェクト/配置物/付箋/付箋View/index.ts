/**
 * 付箋コンポーネント エクスポート用index
 */

// 通常の付箋（固定サイズ、スクロールバー表示）
export { 付箋View } from "./スクロール可能モード/付箋View";

// 自動リサイズ付箋（高さが自動調整、スクロールバーなし）
export { 自動リサイズ付箋View } from "./自動リサイズモード/自動リサイズ付箋View";
export { 自動リサイズテキストエリア } from "./自動リサイズモード/自動リサイズテキストエリア";

// ハンドラーコンポーネント（両方で共有）
export { DragHandler } from "./DragHandler";
export { ResizeHandler } from "./ResizeHandler";
export { StickyNoteTextArea } from "./スクロール可能モード/StickyNoteTextArea";

// インターフェース
export type { I付箋View操作 } from "./スクロール可能モード/I付箋View操作";
export type { I自動リサイズ付箋View操作 } from "./自動リサイズモード/I自動リサイズ付箋View操作";

// 使用例
export { 自動リサイズ付箋Example } from "./自動リサイズモード/自動リサイズ付箋Example";

/**
 * 使用方法:
 * 
 * 1. 通常の付箋（固定サイズ）:
 * ```typescript
 * import { 付箋View } from "./付箋View";
 * 
 * const stickyNote = new 付箋View({
 *     text: "固定サイズの付箋",
 *     width: 200,
 *     height: 150,
 *     x: 100,
 *     y: 100
 * });
 * ```
 * 
 * 2. 自動リサイズ付箋（高さが自動調整）:
 * ```typescript
 * import { 自動リサイズ付箋View } from "./自動リサイズ付箋View";
 * 
 * const autoStickyNote = new 自動リサイズ付箋View({
 *     initialPosition: { x: 100, y: 100 },
 *     initialWidth: 250,
 *     initialText: "自動リサイズ付箋\n改行で高さが拡張されます",
 *     onTextChange: (text) => console.log("テキスト変更:", text),
 *     onPositionChange: (x, y) => console.log(`位置: ${x}, ${y}`),
 *     onDelete: () => console.log("削除")
 * });
 * ```
 * 
 * 特徴の比較:
 * - 付箋View: 固定サイズ、リサイズハンドル付き、スクロールバー表示
 * - 自動リサイズ付箋View: 高さ自動調整、スクロールバーなし、ドラッグのみ
 */