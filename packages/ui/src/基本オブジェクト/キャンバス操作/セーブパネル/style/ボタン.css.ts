import { style } from "@vanilla-extract/css";

export const actionButtonGroup = style({ display: "flex", gap: "12px", marginTop: "8px" });
export const primaryButton = style({
  flex: 1, padding: "14px 20px", fontSize: "14px", fontWeight: "bold",
  borderRadius: "8px", border: "none", backgroundColor: "#4CAF50", color: "#fff",
  cursor: "pointer", transition: "all 0.2s ease",
  ":hover": { backgroundColor: "#45a049" }, ":active": { backgroundColor: "#3d8b40" },
  ":disabled": { backgroundColor: "#555", color: "#888", cursor: "not-allowed" },
});
export const secondaryButton = style({
  flex: 1, padding: "14px 20px", fontSize: "14px", fontWeight: "bold",
  borderRadius: "8px", border: "2px solid #555", backgroundColor: "transparent",
  color: "#aaa", cursor: "pointer", transition: "all 0.2s ease",
  ":hover": { borderColor: "#666", color: "#fff" },
});
export const tabContainer = style({ display: "flex", borderBottom: "1px solid #444" });
export const tab = style({
  flex: 1, padding: "12px", fontSize: "14px", fontWeight: "500", border: "none",
  backgroundColor: "transparent", color: "#888", cursor: "pointer",
  transition: "all 0.2s ease", borderBottom: "2px solid transparent",
  ":hover": { color: "#fff", backgroundColor: "#3a3a3a" },
});
export const tabActive = style({
  color: "#6abe6e", borderBottomColor: "#4CAF50", borderBottomWidth: "3px",
  backgroundColor: "rgba(76, 175, 80, 0.1)",
  ":hover": { color: "#7dce81", backgroundColor: "rgba(76, 175, 80, 0.15)" },
});
