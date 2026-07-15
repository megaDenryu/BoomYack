import { DivC } from "SengenUI/index";
import { GridCell } from "./GridCell";
import { SelectableGridCell } from "./SelectableGridCell";
import { 正規化済み多段格子メニューオプション } from "./多段格子メニュー型";
import { 階層1位置マップ, 階層2位置マップ } from "./多段格子メニュー位置";
import { 多段格子階層制御, 格子セル } from "./多段格子階層制御";

export const 第2層を構築する = (
  root: DivC, options: 正規化済み多段格子メニューオプション,
  hierarchy: 多段格子階層制御, close: () => void,
): void => {
  const counts: Record<string, number> = {};
  for (const item of options.layer2Items) {
    const parent = options.layer1Items.find(value => value.id === item.parentId);
    if (!parent) continue;
    const parentPosition = 階層1位置マップ[parent.Position];
    const expansion = 階層2位置マップ[parent.Position];
    const count = counts[item.parentId] || 0;
    counts[item.parentId] = count + 1;
    const placement = { col: expansion.col, row: parentPosition.row + count + expansion.rowOffset };
    let cell: 格子セル;
    if (item.type === "toggle") {
      cell = new SelectableGridCell({
        ...placement, isLayer2: true, opacity: options.opacity,
        label: item.toggleSeed.stateFalse.label, iconUrl: item.toggleSeed.stateFalse.iconUrl,
        backgroundColor: item.toggleSeed.stateFalse.backgroundColor,
      }, item.toggleSeed);
    } else {
      cell = new GridCell({
        ...placement, isLayer2: true, opacity: options.opacity,
        label: item.label, iconUrl: item.iconUrl, backgroundColor: item.backgroundColor,
      });
    }
    cell.onClick(event => {
      item.onClick(event);
      if (item.type !== "toggle") close();
    });
    cell.setStyleCSS(options.mode === "static"
      ? { opacity: "1", pointerEvents: "auto" }
      : { opacity: "0", transition: "all 0.2s", pointerEvents: "none", transform: "scale(0.95)" });
    hierarchy.layer2.push({ id: item.parentId, itemId: item.id, el: cell });
    root.child(cell.getRoot());
  }
};
