import { style } from '@vanilla-extract/css';

// 付箋本体。外枠(自動リサイズ付箋style.cssの付箋ホバー領域)のpadding分だけ内側に
// ぴったり収まる実サイズのdiv。背景色はここへ直接setStyleCSSで設定する
// (外枠にcontent-boxグラデーションで疑似的に色を塗る旧方式は、外枠と中身のサイズが
// 別経路で決まり得るため廃止した)。
export const 付箋本体 = style({
    position: "absolute",
    top: "0",
    left: "0",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    transition: "background-color 0.2s ease-in-out",
});
