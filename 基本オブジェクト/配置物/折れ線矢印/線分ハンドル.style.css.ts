import { style, styleVariants } from '@vanilla-extract/css';

// 線分ハンドルの外側コンテナ（padding + 当たり判定拡大用）
export const 線分ハンドルコンテナ = style({
    width: "100%",
    height: "20px",
    boxSizing: "border-box",
});

// 線分ハンドルの基本スタイル
export const 線分ハンドル基本 = style({
    width: "100%",
    height: "20px",// 当たり判定拡大分を含む
    padding: "8px 0px", // 上下に8pxずつpaddingを追加し、実際には中央4px分だけ色をぬって見えるようにする。ホバーの当たり判定は20pxになる。
    borderRadius: "2px",
    transition: "all 200ms ease-in-out"
});

// 線分ハンドルの状態別スタイル
export const 線分ハンドル状態 = styleVariants({
    // 未選択 + ホバーなし
    通常: {
        background: "linear-gradient(#7cd3ff, #7cd3ff) content-box",
    },
    // 未選択 + ホバー中
    未選択ホバー: {
        background: "linear-gradient(#2d7a99, #2d7a99) content-box",
    },
    // 選択中 + ホバーなし
    選択中: {
        background: "linear-gradient(#94ff7f, #94ff7f) content-box",
    },
    // 選択中 + ホバー中
    選択中ホバー: {
        background: "linear-gradient(#5a9558, #5a9558) content-box",
    },
    // ドラッグ中
    ドラッグ中: {
        background: "linear-gradient(#42A5F5, #42A5F5) content-box",
    }
});
