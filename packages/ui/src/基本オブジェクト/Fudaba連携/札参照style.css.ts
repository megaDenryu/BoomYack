import { style } from "@vanilla-extract/css";

export const fudaba札バッジ = style({
    display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: "10px",
    fontSize: "11px", fontWeight: "600", color: "#fff",
});
export const 札参照カード = style({
    display: "flex", flexDirection: "column", gap: "6px", width: "100%",
    padding: "10px", boxSizing: "border-box",
});
export const 札参照タイトル = style({
    fontWeight: "600", fontSize: "14px", color: "#333", wordBreak: "break-word",
});
export const 札参照バッジ行 = style({ display: "flex", flexWrap: "wrap", gap: "6px" });
export const 札参照担当者 = style({ fontSize: "12px", color: "#666" });
export const 札参照案内文 = style({ fontSize: "12px", color: "#888", fontStyle: "italic" });
