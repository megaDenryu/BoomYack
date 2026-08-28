import { style } from '@vanilla-extract/css';

// タイトル付きコンテンツ全体のレイアウト(タイトル行+本文を縦積み)
export const タイトル付き付箋コンテナ = style({
    display: "flex",
    flexDirection: "column",
    width: "100%"
});

// タイトル行: 本文と地続きの落ち着いた見た目にするため、色面ではなく下線1本で区切る
export const タイトル入力欄 = style({
    fontWeight: "600",
    color: "#6b4a23",
    borderBottom: "1px solid rgba(121, 85, 72, 0.25)"
});
