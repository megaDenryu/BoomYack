import { MousePosition } from "SengenUI/index";
import { Action, AsyncAction } from "TypeScriptBenriKakuchou/アーキテクチャBase";

export interface 円状メニューアイテムオプション {
  label?: string;
  iconUrl?: string;
  backgroundColor?: string;
  borderColor?: string;
  onClick: (event: MouseEvent) => void;
}
export interface Iコンテキストメニュー {
  表示(pos: MousePosition): Promise<this>;
  非表示(閉じ時間?: number): Promise<this>;
  表示トグル(pos: MousePosition): Promise<this>;
  isVisible: boolean;
  delete(): void;
  他のコンテキストメニューを全て非表示にする?: AsyncAction;
  onDestroy?: Action;
  updateItem?(id: string, opts: { label?: string | string[]; iconUrl?: string; backgroundColor?: string }): void;
  selectItem?(id: string, isSelected: boolean): void;
}
