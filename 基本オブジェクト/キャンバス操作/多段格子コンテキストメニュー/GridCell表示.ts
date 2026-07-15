import { div, span, DivC } from "SengenUI/index";
import { 多段格子メニューセル } from "../style.css";
import { GridCellOptions } from "./GridCell型";

export interface IGridCell表示結果 { root: DivC; icon?: DivC; base: string; hover: string; }

export const GridCellを構築する = (
  options: GridCellOptions, baseOpacity: number, hoverOpacity: number,
  getCurrentBackground: () => string,
): IGridCell表示結果 => {
  const base = options.backgroundColor || (options.isLayer2
    ? `rgba(41, 128, 185, ${baseOpacity})` : `rgba(52, 73, 94, ${baseOpacity})`);
  const hover = options.isLayer2
    ? `rgba(52, 152, 219, ${hoverOpacity})` : `rgba(44, 62, 80, ${hoverOpacity})`;
  const root = div({ class: 多段格子メニューセル }).setStyleCSS({
    gridColumn: String(options.col), gridRow: String(options.row), backgroundColor: base,
    backdropFilter: "blur(4px)", color: "white", borderRadius: "6px",
    padding: options.label ? "4px 8px" : "2px", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "bold",
    cursor: "pointer", boxShadow: "0 4px 6px rgba(0,0,0,0.3)", userSelect: "none",
    transition: "background-color 0.2s, transform 0.2s", whiteSpace: "nowrap",
    overflow: "hidden", textOverflow: "ellipsis",
  }).addDivEventListener("mouseenter", () => {
    if (options.isCenter) return;
    root.setStyleCSS({ backgroundColor: getCurrentBackground() !== base || options.backgroundColor
      ? "rgba(255, 255, 255, 0.8)" : hover });
  }).addDivEventListener("mouseleave", () => {
    if (!options.isCenter) root.setStyleCSS({ backgroundColor: getCurrentBackground() });
  }).addDivEventListener("mousedown", () => root.setStyleCSS({ transform: "scale(0.95)" }))
    .addDivEventListener("mouseup", () => root.setStyleCSS({ transform: "scale(1)" }));
  let icon: DivC | undefined;
  if (options.iconUrl) {
    icon = div().setStyleCSS({
      width: "48px", height: "48px", marginBottom: options.label ? "4px" : "0",
      backgroundImage: `url("${options.iconUrl}")`, backgroundSize: "contain",
      backgroundRepeat: "no-repeat", backgroundPosition: "center", pointerEvents: "none",
    });
    root.child(icon);
  }
  if (options.label && !options.iconUrl && (Array.isArray(options.label) || options.label.length > 0)) {
    const texts = Array.isArray(options.label) ? options.label : [options.label];
    root.childs(texts.map(text => span({ text }).setStyleCSS({ pointerEvents: "none", lineHeight: "1.2" })));
  }
  return { root, icon, base, hover };
};
