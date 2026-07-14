import { style } from '@vanilla-extract/css';

// 背景色は種別・状態ごとに動的なため、色そのものはsetStyleCSSで与える(Fudaba札バッジ)
export const fudaba札バッジ = style({
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#fff"
});

// 札参照コンテンツ全体のレイアウト(タイトル+バッジ行+担当者を縦積み)。本文全文は表示しない
export const 札参照カード = style({
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
    padding: "10px",
    boxSizing: "border-box"
});

export const 札参照タイトル = style({
    fontWeight: "600",
    fontSize: "14px",
    color: "#333",
    wordBreak: "break-word"
});

export const 札参照バッジ行 = style({
    display: "flex",
    flexWrap: "wrap",
    gap: "6px"
});

export const 札参照担当者 = style({
    fontSize: "12px",
    color: "#666"
});

// 読込中・参照解決不可はどちらも「実データではない」ことを示すため、控えめな配色に統一する
export const 札参照案内文 = style({
    fontSize: "12px",
    color: "#888",
    fontStyle: "italic"
});

// 検索ダイアログ本体。付箋設定パネルと同系統の見た目(白背景・角丸・影)で揃える
export const 検索ダイアログコンテナ = style({
    position: "absolute",
    width: "280px",
    maxHeight: "360px",
    backgroundColor: "#ffffff",
    border: "2px solid #333",
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    zIndex: "1000"
});

export const 検索ダイアログヘッダー = style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "8px",
    borderBottom: "1px solid #ddd",
    cursor: "grab"
});

export const 検索ダイアログタイトル = style({
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333"
});

export const 検索ダイアログ閉じるボタン = style({
    width: "24px",
    height: "24px",
    border: "none",
    backgroundColor: "#ff4444",
    color: "white",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
});

export const 検索入力欄 = style({
    width: "100%",
    height: "32px",
    padding: "0 8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "13px",
    boxSizing: "border-box"
});

export const 検索結果リスト = style({
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    overflowY: "auto",
    maxHeight: "220px"
});

export const 検索案内文 = style({
    fontSize: "12px",
    color: "#888",
    padding: "8px 0",
    textAlign: "center"
});

export const 検索結果行 = style({
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "8px",
    border: "1px solid #eee",
    borderRadius: "6px",
    cursor: "pointer",
    ':hover': {
        backgroundColor: "#f5f5f5",
        borderColor: "#ccc"
    }
});

export const 検索結果行タイトル = style({
    fontSize: "13px",
    fontWeight: "600",
    color: "#333",
    wordBreak: "break-word"
});

export const 検索結果行バッジ行 = style({
    display: "flex",
    flexWrap: "wrap",
    gap: "4px"
});
