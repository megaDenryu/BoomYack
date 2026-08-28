import { keyframes, style } from "@vanilla-extract/css";

export const panelFadeIn = keyframes({
  "0%": { opacity: 0, transform: "translate(-50%, -50%) scale(0.9)" },
  "100%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
});
export const panelFadeOut = keyframes({
  "0%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
  "100%": { opacity: 0, transform: "translate(-50%, -50%) scale(0.9)" },
});
export const savePanelWrapper = style({});
export const overlayBackdrop = style({
  position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 998, opacity: 0,
  pointerEvents: "none", transition: "opacity 0.2s ease",
});
export const overlayBackdropVisible = style({ opacity: 1, pointerEvents: "auto" });
export const savePanelContainer = style({
  position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
  zIndex: 999, width: "400px", maxHeight: "80vh", backgroundColor: "#2d2d2d",
  borderRadius: "12px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  display: "flex", flexDirection: "column", overflow: "hidden", color: "#fff",
});
export const panelHeader = style({
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "16px 20px", borderBottom: "1px solid #444", backgroundColor: "#363636",
});
export const panelTitle = style({ fontSize: "18px", fontWeight: "bold", margin: 0 });
export const closeButton = style({
  width: "32px", height: "32px", borderRadius: "50%", border: "none",
  backgroundColor: "transparent", color: "#aaa", fontSize: "20px", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  transition: "all 0.2s ease", ":hover": { backgroundColor: "#555", color: "#fff" },
});
export const panelContent = style({
  padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto",
});
