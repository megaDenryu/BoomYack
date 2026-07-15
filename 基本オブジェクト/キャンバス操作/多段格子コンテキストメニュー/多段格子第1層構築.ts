import { DivC } from "SengenUI/index";
import { GridCell } from "./GridCell";
import { 正規化済み多段格子メニューオプション } from "./多段格子メニュー型";
import { 階層1位置マップ } from "./多段格子メニュー位置";
import { 多段格子階層制御 } from "./多段格子階層制御";

export const 第1層を構築する = (
  root: DivC, options: 正規化済み多段格子メニューオプション,
  hierarchy: 多段格子階層制御, close: () => void,
): void => {
  for (const item of options.layer1Items) {
    const position = 階層1位置マップ[item.Position];
    const cell = new GridCell({
      col: position.col, row: position.row, label: item.label, iconUrl: item.iconUrl,
      backgroundColor: item.backgroundColor, isLayer2: false, opacity: options.opacity,
    }).setStyleCSS({ pointerEvents: "auto" }).onClick(event => {
      if (item.onClick) { item.onClick(event); close(); return; }
      if (options.mode === "clickable") hierarchy.toggle(item.id);
    });
    hierarchy.layer1.push({ id: item.id, el: cell });
    root.child(cell.getRoot());
  }
};

export const 中央セルを構築する = (
  root: DivC, options: 正規化済み多段格子メニューオプション, close: () => void,
): void => {
  if (!options.showCenterButton) return;
  const normal = `rgba(192, 57, 43, ${options.opacity})`;
  const hover = `rgba(231, 76, 60, ${Math.min(1, options.opacity + 0.15)})`;
  const cell = new GridCell({
    col: 4, row: 4, label: "閉じる", isLayer2: false, isCenter: true, opacity: options.opacity,
  }).setStyleCSS({ pointerEvents: "auto", backgroundColor: normal })
    .onMouseEnter(() => cell.getRoot().setStyleCSS({ backgroundColor: hover }))
    .onMouseLeave(() => cell.getRoot().setStyleCSS({ backgroundColor: normal }))
    .onClick(close);
  root.child(cell.getRoot());
};
