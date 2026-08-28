import { style } from '@vanilla-extract/css';
import { 付箋ドラッグ操作余白Px } from "./付箋操作仕様";

export const 付箋召喚寸法 = {
    本体幅: 200,
    本体最小高さ: 52,
    操作余白: 付箋ドラッグ操作余白Px,
} as const;

/** 実付箋と同じ外観を持つが、配置物ではない生成UIの操作領域。 */
export const 付箋召喚操作領域 = style({
    position: "absolute",
    width: `${付箋召喚寸法.本体幅 + 付箋召喚寸法.操作余白 * 2}px`,
    height: `${付箋召喚寸法.本体最小高さ + 付箋召喚寸法.操作余白 * 2}px`,
    boxSizing: "border-box",
    backgroundColor: "transparent",
});

/** 操作領域の中央にある、実背景と実寸を持つ付箋プレビュー。 */
export const 付箋召喚本体 = style({
    position: "absolute",
    top: `${付箋召喚寸法.操作余白}px`,
    left: `${付箋召喚寸法.操作余白}px`,
    width: `${付箋召喚寸法.本体幅}px`,
    height: `${付箋召喚寸法.本体最小高さ}px`,
    backgroundColor: "#ffffd0",
});

/** 新しい付箋へ渡す下書きを入力する。見た目は自由テキスト付箋と同じ。 */
export const 付箋召喚テキストエリア = style({
    width: "100%",
    height: "100%",
    padding: "16px",
    border: "none",
    backgroundColor: "transparent",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    lineHeight: "20px",
    resize: "none",
    outline: "none",
    boxSizing: "border-box",
    overflow: "hidden",
});
