import { DivC } from "SengenUI/index";
import { GridCell } from "./GridCell";
import { GridCellOptions, IGridCellToggleSeed, IGridMenuItemStyle } from "./GridCell型";

export class SelectableGridCell {
  private readonly cell: GridCell;
  private selected = false;
  constructor(options: GridCellOptions, private seed?: IGridCellToggleSeed) {
    this.cell = new GridCell(options);
    if (seed) this.select(false);
  }
  public getRoot(): DivC { return this.cell.getRoot(); }
  public get isSelected(): boolean { return this.selected; }
  public setSeed(seed: IGridCellToggleSeed): void { this.seed = seed; }
  public select(selected: boolean): this {
    this.selected = selected;
    if (this.seed) this.cell.applyStyle(selected ? this.seed.stateTrue : this.seed.stateFalse);
    return this;
  }
  public toggle(): this { return this.select(!this.selected); }
  public onClick(listener: (event: MouseEvent) => void): this { this.cell.onClick(listener); return this; }
  public applyStyle(style: IGridMenuItemStyle): void { this.cell.applyStyle(style); }
  public setStyleCSS(style: Record<string, string>): this { this.cell.setStyleCSS(style); return this; }
}
