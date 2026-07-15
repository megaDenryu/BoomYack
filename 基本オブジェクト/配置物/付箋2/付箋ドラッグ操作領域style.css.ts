import { style } from "@vanilla-extract/css";
import { 付箋ドラッグ操作余白Px } from "./付箋操作仕様";

export const 付箋ドラッグ操作枠 = style({
    position: "absolute",
    inset: "0",
    pointerEvents: "none",
    outlineOffset: "0",
    transition: "outline 0.2s ease-in-out",
});

const ドラッグハンドル = style({
    position: "absolute",
    pointerEvents: "auto",
    cursor: "inherit",
    touchAction: "none",
});

export const 上ドラッグハンドル = style([
    ドラッグハンドル,
    { top: "0", left: "0", right: "0", height: `${付箋ドラッグ操作余白Px}px` },
]);

export const 下ドラッグハンドル = style([
    ドラッグハンドル,
    { bottom: "0", left: "0", right: "0", height: `${付箋ドラッグ操作余白Px}px` },
]);

export const 左ドラッグハンドル = style([
    ドラッグハンドル,
    {
        top: `${付箋ドラッグ操作余白Px}px`,
        bottom: `${付箋ドラッグ操作余白Px}px`,
        left: "0",
        width: `${付箋ドラッグ操作余白Px}px`,
    },
]);

export const 右ドラッグハンドル = style([
    ドラッグハンドル,
    {
        top: `${付箋ドラッグ操作余白Px}px`,
        right: "0",
        bottom: `${付箋ドラッグ操作余白Px}px`,
        width: `${付箋ドラッグ操作余白Px}px`,
    },
]);
