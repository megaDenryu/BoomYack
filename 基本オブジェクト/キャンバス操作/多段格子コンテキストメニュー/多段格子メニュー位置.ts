import { 格子メニュー配置位置 } from "./多段格子メニュー型";

export const 階層1位置マップ: Record<格子メニュー配置位置, { col: number; row: number }> = {
  top: { col: 4, row: 3 }, bottom: { col: 4, row: 5 },
  left: { col: 3, row: 4 }, right: { col: 5, row: 4 },
  lt: { col: 3, row: 3 }, rt: { col: 5, row: 3 },
  lb: { col: 3, row: 5 }, rb: { col: 5, row: 5 },
};

// top/bottom は7x7格子の中央3x3(lt/top/rt, left/中央/right, lb/bottom/rb)と
// 同じ列帯(col3-5)を親から見た展開方向に使うため、子要素を縦に積むと親自身や
// 隣接する第1層ボタンと同じ行に重なる(Fudaba札185)。この2方向だけは子要素を
// 列一覧へ横並びに配置し、列一覧を使い切ったら親から離れる行へ折り返す。
// left/right/lt/rt/lb/rb は空いている列帯(col1-2, col6-7)を使うため、
// 子要素を縦に積んでも他の第1層ボタンと重ならず、従来通りの配置を維持する。
export type 縦積み展開 = { 軸: "縦"; col: string | number; rowOffset: number };
export type 横並び展開 = { 軸: "横"; 列一覧: number[]; rowOffset: number };
export type 階層2展開 = 縦積み展開 | 横並び展開;

export const 階層2位置マップ: Record<格子メニュー配置位置, 階層2展開> = {
  top: { 軸: "横", 列一覧: [3, 4, 5], rowOffset: -1 },
  bottom: { 軸: "横", 列一覧: [3, 4, 5], rowOffset: 1 },
  left: { 軸: "縦", col: "1 / span 2", rowOffset: -1 }, right: { 軸: "縦", col: "6 / span 2", rowOffset: -1 },
  lt: { 軸: "縦", col: "1 / span 2", rowOffset: -1 }, rt: { 軸: "縦", col: "6 / span 2", rowOffset: -1 },
  lb: { 軸: "縦", col: "1 / span 2", rowOffset: 1 }, rb: { 軸: "縦", col: "6 / span 2", rowOffset: 1 },
};
