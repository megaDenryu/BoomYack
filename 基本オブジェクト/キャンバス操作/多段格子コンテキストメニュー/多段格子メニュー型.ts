import { IGridCellToggleSeed, IGridMenuItemStyle } from "./GridCell型";

export type 格子メニュー配置位置 = "left" | "right" | "top" | "bottom" | "lt" | "rt" | "lb" | "rb";
export interface 格子メニュー1層オプション extends IGridMenuItemStyle {
  id: string;
  Position: 格子メニュー配置位置;
  onClick?: (event: MouseEvent) => void;
}
export interface 格子メニュー2層共通オプション { id?: string; parentId: string; }
export interface 格子メニュー2層通常オプション extends 格子メニュー2層共通オプション, IGridMenuItemStyle {
  type?: "normal";
  onClick: (event: MouseEvent) => void;
}
export interface 格子メニュー2層トグルオプション extends 格子メニュー2層共通オプション {
  type: "toggle";
  toggleSeed: IGridCellToggleSeed;
  onClick: (event: MouseEvent) => void;
}
export type 格子メニュー2層オプション = 格子メニュー2層通常オプション | 格子メニュー2層トグルオプション;
export interface 多段格子メニューオプション {
  layer1Items: 格子メニュー1層オプション[];
  layer2Items: 格子メニュー2層オプション[];
  mode?: "static" | "clickable";
  opacity?: number;
  showCenterButton?: boolean;
}
export interface 正規化済み多段格子メニューオプション extends 多段格子メニューオプション {
  mode: "static" | "clickable";
  opacity: number;
  showCenterButton: boolean;
}
