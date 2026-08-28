import { style } from "@vanilla-extract/css";

export const inputGroup = style({ display: "flex", flexDirection: "column", gap: "8px" });
export const inputLabel = style({ fontSize: "14px", fontWeight: "500", color: "#bbb" });
export const textInput = style({
  padding: "12px 16px", fontSize: "14px", borderRadius: "8px", border: "1px solid #555",
  backgroundColor: "#3d3d3d", color: "#fff", outline: "none",
  transition: "border-color 0.2s ease", ":focus": { borderColor: "#4CAF50" },
  "::placeholder": { color: "#888" },
});
export const modeSelector = style({ display: "flex", gap: "12px" });
export const modeButton = style({
  flex: 1, padding: "12px 16px", fontSize: "14px", fontWeight: "500",
  borderRadius: "8px", border: "2px solid #555", backgroundColor: "#3d3d3d",
  color: "#aaa", cursor: "pointer", transition: "all 0.2s ease",
  ":hover": { borderColor: "#666", color: "#fff" },
});
export const modeButtonActive = style({
  borderColor: "#4CAF50", backgroundColor: "#1e3a21", color: "#6abe6e",
  boxShadow: "0 0 8px rgba(76, 175, 80, 0.3)",
  ":hover": { borderColor: "#5bc95f", backgroundColor: "#254528", color: "#7dce81" },
});
