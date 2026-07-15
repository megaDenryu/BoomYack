import { style } from "@vanilla-extract/css";

export const 検索ダイアログコンテナ = style({
    position: "absolute", width: "280px", maxHeight: "360px", backgroundColor: "#ffffff",
    border: "2px solid #333", borderRadius: "8px", padding: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column",
    gap: "10px", zIndex: "1000",
});
export const 検索ダイアログヘッダー = style({
    display: "flex", justifyContent: "space-between", alignItems: "center",
    paddingBottom: "8px", borderBottom: "1px solid #ddd", cursor: "grab",
});
export const 検索ダイアログタイトル = style({ fontSize: "14px", fontWeight: "bold", color: "#333" });
export const 検索ダイアログ閉じるボタン = style({
    width: "24px", height: "24px", border: "none", backgroundColor: "#ff4444", color: "white",
    borderRadius: "4px", cursor: "pointer", fontSize: "16px", display: "flex",
    alignItems: "center", justifyContent: "center",
});
export const 検索入力欄 = style({
    width: "100%", height: "32px", padding: "0 8px", border: "1px solid #ccc",
    borderRadius: "4px", fontSize: "13px", boxSizing: "border-box",
});
export const 検索結果リスト = style({
    display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto", maxHeight: "220px",
});
export const 検索案内文 = style({ fontSize: "12px", color: "#888", padding: "8px 0", textAlign: "center" });
export const 検索結果行 = style({
    display: "flex", flexDirection: "column", gap: "4px", padding: "8px",
    border: "1px solid #eee", borderRadius: "6px", cursor: "pointer",
    ":hover": { backgroundColor: "#f5f5f5", borderColor: "#ccc" },
});
export const 検索結果行タイトル = style({
    fontSize: "13px", fontWeight: "600", color: "#333", wordBreak: "break-word",
});
export const 検索結果行バッジ行 = style({ display: "flex", flexWrap: "wrap", gap: "4px" });
