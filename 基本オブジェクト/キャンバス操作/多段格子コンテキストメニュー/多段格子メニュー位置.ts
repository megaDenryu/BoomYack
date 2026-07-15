import { 格子メニュー配置位置 } from "./多段格子メニュー型";

export const 階層1位置マップ: Record<格子メニュー配置位置, { col: number; row: number }> = {
  top: { col: 4, row: 3 }, bottom: { col: 4, row: 5 },
  left: { col: 3, row: 4 }, right: { col: 5, row: 4 },
  lt: { col: 3, row: 3 }, rt: { col: 5, row: 3 },
  lb: { col: 3, row: 5 }, rb: { col: 5, row: 5 },
};
export const 階層2位置マップ: Record<格子メニュー配置位置, { col: string | number; rowOffset: number }> = {
  top: { col: "3 / span 3", rowOffset: -1 }, bottom: { col: "3 / span 3", rowOffset: 1 },
  left: { col: "1 / span 2", rowOffset: -1 }, right: { col: "6 / span 2", rowOffset: -1 },
  lt: { col: "1 / span 2", rowOffset: -1 }, rt: { col: "6 / span 2", rowOffset: -1 },
  lb: { col: "1 / span 2", rowOffset: 1 }, rb: { col: "6 / span 2", rowOffset: 1 },
};
