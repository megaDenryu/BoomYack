import { style } from '@vanilla-extract/css';

// 付箋コンテナのスタイル
export const sticky_note_container = style({
    position: "absolute",
    border: "1px solid #fdd835",
    borderRadius: "4px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    cursor: "move"
});

// 付箋コンテナのスタイル
export const 付箋ホバー領域 = style({
    position: "absolute",
    cursor: "move",
    background: "linear-gradient(#ffffd0, #ffffd0) content-box",
    backgroundColor: "transparent"
});

// ドラッグハンドルのスタイル
export const drag_handle = style({
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    height: "25px",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: "4px 4px 0 0",
    cursor: "move",
    zIndex: "10"
});

// メインコンテナのスタイル
export const main_container = style({
    position: "absolute",
    top: "25px",
    left: "0",
    right: "0",
    bottom: "0",
    padding: "0",
    overflow: "hidden"
});

// 付箋テキストエリアのスタイル
export const sticky_note_textarea = style({
    width: "100%",
    height: "100%",
    padding: "8px",
    border: "none",
    backgroundColor: "transparent",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    lineHeight: "1.4",
    resize: "none",
    outline: "none",
    boxSizing: "border-box"
});

// リサイズハンドルの基本スタイル
export const resize_handle = style({
    position: "absolute",
    backgroundColor: "#2196f3",
    opacity: "0.7",
    zIndex: "20",
    cursor: "pointer"
});

// 上辺リサイズハンドル
export const resize_handle_top = style({
    cursor: "n-resize"
});

// 下辺リサイズハンドル
export const resize_handle_bottom = style({
    cursor: "s-resize"
});

// 左辺リサイズハンドル
export const resize_handle_left = style({
    cursor: "w-resize"
});

// 右辺リサイズハンドル
export const resize_handle_right = style({
    cursor: "e-resize"
});

// 左上角リサイズハンドル
export const resize_handle_top_left = style({
    cursor: "nw-resize"
});

// 右上角リサイズハンドル
export const resize_handle_top_right = style({
    cursor: "ne-resize"
});

// 左下角リサイズハンドル
export const resize_handle_bottom_left = style({
    cursor: "sw-resize"
});

// 右下角リサイズハンドル
export const resize_handle_bottom_right = style({
    cursor: "se-resize"
});

// 自動リサイズ付箋用のスタイル
export const auto_resize_sticky_note = style({
    minHeight: "80px"
});

// 付箋ヘッダーのスタイル
export const sticky_note_header = style({
    backgroundColor: "#fbc02d",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 8px",
    cursor: "move",
    borderBottom: "1px solid #f9a825",
    borderRadius: "4px 4px 0 0",
    flexShrink: 0
});

// 閉じるボタンのスタイル
export const sticky_note_close_button = style({
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
    userSelect: "none",
    ':hover': {
        backgroundColor: "#d32f2f"
    }
});

// ヘッダータイトルのスタイル
export const sticky_note_title = style({
    fontSize: "12px",
    color: "#795548",
    fontWeight: "bold",
    userSelect: "none"
});

// 自動リサイズ付箋用の左右リサイズハンドル
export const auto_resize_handle_left = style({
    position: "absolute",
    left: "0",
    top: "0",
    bottom: "0",
    width: "10px",
    backgroundColor: "transparent",
    cursor: "w-resize",
    zIndex: "15",
    ':hover': {
        backgroundColor: "rgba(33, 150, 243, 0.3)"
    }
});

export const auto_resize_handle_right = style({
    position: "absolute",
    right: "0",
    top: "0",
    bottom: "0",
    width: "10px",
    backgroundColor: "transparent",
    cursor: "e-resize",
    zIndex: "15",
    ':hover': {
        backgroundColor: "rgba(33, 150, 243, 0.3)"
    }
});