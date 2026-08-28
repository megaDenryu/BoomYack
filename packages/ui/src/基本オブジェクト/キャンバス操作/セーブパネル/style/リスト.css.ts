import { style } from "@vanilla-extract/css";

export const saveListContainer = style({
  display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto",
});
export const saveListItem = style({
  display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px",
  borderRadius: "8px", backgroundColor: "#3d3d3d", border: "2px solid #555",
  cursor: "pointer", transition: "all 0.2s ease",
  ":hover": { borderColor: "#6abe6e", backgroundColor: "#454545" },
});
export const saveListItemSelected = style({
  borderColor: "#4CAF50", borderWidth: "2px", backgroundColor: "#1e3a21",
  boxShadow: "0 0 8px rgba(76, 175, 80, 0.4), inset 0 0 0 1px rgba(76, 175, 80, 0.3)",
  ":hover": { borderColor: "#5bc95f", backgroundColor: "#254528" },
});
export const saveItemName = style({ fontSize: "14px", fontWeight: "500", color: "#fff" });
export const saveItemDate = style({ fontSize: "12px", color: "#888" });
const roundItemButton = {
  width: "28px", height: "28px", borderRadius: "50%", border: "none",
  backgroundColor: "transparent", color: "#f44336", fontSize: "16px", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease",
} as const;
export const jsonFileOutputButton = style({
  ...roundItemButton, ":hover": { backgroundColor: "rgba(244, 67, 54, 0.2)" },
});
export const deleteItemButton = style({
  ...roundItemButton, ":hover": { backgroundColor: "rgba(244, 67, 54, 0.2)" },
});
export const emptyMessage = style({ padding: "24px", textAlign: "center", color: "#888", fontSize: "14px" });
