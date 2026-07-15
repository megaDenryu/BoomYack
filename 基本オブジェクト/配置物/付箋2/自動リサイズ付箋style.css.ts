import { style } from '@vanilla-extract/css';

// 付箋ホバー領域(外枠)のスタイル
export const 付箋ホバー領域 = style({
    position: "absolute",
    cursor: "move",
    background: "linear-gradient(#ffffd0, #ffffd0) content-box",
    backgroundColor: "transparent"
});

// 付箋コンテンツコンテナ
export const 付箋コンテンツコンテナ = style({});

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

// 自動リサイズ付箋用のスタイル
export const auto_resize_sticky_note = style({
    minHeight: "80px"
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
