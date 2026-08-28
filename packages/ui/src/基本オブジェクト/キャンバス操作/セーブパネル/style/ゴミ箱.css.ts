import { style } from "@vanilla-extract/css";

export const trashToggleButton = style({
  position: "absolute", bottom: "12px", right: "12px", padding: "6px 10px",
  fontSize: "12px", borderRadius: "6px", border: "1px solid #f44336",
  backgroundColor: "rgba(244, 67, 54, 0.15)", color: "#f44336", cursor: "pointer",
  display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s ease",
  ":hover": { backgroundColor: "rgba(244, 67, 54, 0.25)" },
});
export const trashBadge = style({
  backgroundColor: "#f44336", color: "#fff", borderRadius: "10px", padding: "2px 6px",
  fontSize: "10px", fontWeight: "bold",
});
export const trashedItem = style({
  opacity: 0.6, backgroundColor: "#3a2a2a", border: "1px dashed #f44336",
  ":hover": { backgroundColor: "#3f2f2f", borderColor: "#ff6659" },
});
export const restoreButton = style({
  width: "28px", height: "28px", borderRadius: "50%", border: "none",
  backgroundColor: "transparent", color: "#4CAF50", fontSize: "16px", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease",
  ":hover": { backgroundColor: "rgba(76, 175, 80, 0.2)" },
});
