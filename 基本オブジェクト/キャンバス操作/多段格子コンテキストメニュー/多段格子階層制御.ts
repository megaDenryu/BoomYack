import { GridCell } from "./GridCell";
import { SelectableGridCell } from "./SelectableGridCell";
import { IGridMenuItemStyle } from "./GridCell型";

export type 格子セル = GridCell | SelectableGridCell;
export interface I階層1セル { id: string; el: 格子セル; }
export interface I階層2セル { id: string; itemId: string | undefined; el: 格子セル; }

export class 多段格子階層制御 {
  public readonly layer1: I階層1セル[] = [];
  public readonly layer2: I階層2セル[] = [];
  private activeId: string | null = null;
  public reset(): void { this.activeId = null; }
  public toggle(id: string): void {
    if (this.activeId === id) { this.activeId = null; this.hideAll(); return; }
    this.activeId = id;
    this.hideAll();
    this.show(id);
  }
  public hideAll(): void {
    for (const item of this.layer2) item.el.getRoot().setStyleCSS({
      opacity: "0", pointerEvents: "none", transform: "scale(0.95)",
    });
  }
  private show(id: string): void {
    for (const item of this.layer2.filter(value => value.id === id)) item.el.getRoot().setStyleCSS({
      opacity: "1", pointerEvents: "auto", transform: "scale(1)",
    });
  }
  public select(id: string, selected: boolean): void {
    const item = this.layer2.find(value => value.itemId === id) ?? this.layer1.find(value => value.id === id);
    if (item?.el instanceof SelectableGridCell) item.el.select(selected);
  }
  public update(id: string, style: IGridMenuItemStyle): void {
    const item = this.layer2.find(value => value.itemId === id) ?? this.layer1.find(value => value.id === id);
    item?.el.applyStyle(style);
  }
}
