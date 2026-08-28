/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest";
import { 第2層セル配置を求める } from "./多段格子第2層構築";
import { 階層1位置マップ, 階層2位置マップ } from "./多段格子メニュー位置";

// Fudaba札185: 付箋ボタン(top)の3モードが親や隣接ボタンと同じ行に重なり押せなかった
// 不具合の回帰テスト。中央3x3(row3-5, col3-5)は8個の第1層ボタンで埋まっているため、
// top/bottom方向の子要素はその行帯(row3-5)を避けられていることを検証する。
describe("第2層セル配置を求める", () => {
  it("topは3つの子要素を親より上の1行へ横並びに配置する", () => {
    const 親位置 = 階層1位置マップ.top;
    const 展開 = 階層2位置マップ.top;
    const 配置一覧 = [0, 1, 2].map(count => 第2層セル配置を求める(親位置, 展開, count));

    expect(配置一覧).toEqual([
      { col: 3, row: 2 },
      { col: 4, row: 2 },
      { col: 5, row: 2 },
    ]);
    for (const 配置 of 配置一覧) expect(配置.row).toBeLessThan(親位置.row);
  });

  it("topの子要素が4個以上になったら親からさらに離れた行へ折り返す", () => {
    const 親位置 = 階層1位置マップ.top;
    const 展開 = 階層2位置マップ.top;

    expect(第2層セル配置を求める(親位置, 展開, 3)).toEqual({ col: 3, row: 1 });
  });

  it("bottomは3つの子要素を親より下の1行へ横並びに配置する", () => {
    const 親位置 = 階層1位置マップ.bottom;
    const 展開 = 階層2位置マップ.bottom;
    const 配置一覧 = [0, 1, 2].map(count => 第2層セル配置を求める(親位置, 展開, count));

    expect(配置一覧).toEqual([
      { col: 3, row: 6 },
      { col: 4, row: 6 },
      { col: 5, row: 6 },
    ]);
    for (const 配置 of 配置一覧) expect(配置.row).toBeGreaterThan(親位置.row);
  });

  it("topの子要素は中央3x3(row3-5)を一切使わない", () => {
    const 親位置 = 階層1位置マップ.top;
    const 展開 = 階層2位置マップ.top;
    const 占有中の行一覧 = new Set([3, 4, 5]);

    for (const count of [0, 1, 2, 3, 4, 5]) {
      const 配置 = 第2層セル配置を求める(親位置, 展開, count);
      expect(占有中の行一覧.has(配置.row)).toBe(false);
    }
  });

  it("left(縦積み展開)は従来通り親の列幅のまま行を1つずつ積む", () => {
    const 親位置 = 階層1位置マップ.left;
    const 展開 = 階層2位置マップ.left;

    expect(第2層セル配置を求める(親位置, 展開, 0)).toEqual({ col: "1 / span 2", row: 3 });
    expect(第2層セル配置を求める(親位置, 展開, 1)).toEqual({ col: "1 / span 2", row: 4 });
  });
});
