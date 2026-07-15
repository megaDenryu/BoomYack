import { DivC, LV2HtmlComponentBase } from "SengenUI/index";
import { GridCellを構築する } from "./GridCell表示";
import { GridCellOptions, IGridMenuItemStyle } from "./GridCell型";

export type { GridCellOptions, IGridCellToggleSeed, IGridMenuItemStyle } from "./GridCell型";
export { SelectableGridCell } from "./SelectableGridCell";

export class GridCell extends LV2HtmlComponentBase {
  protected _componentRoot: DivC;
  private icon?: DivC;
  private originalBackground!: string;
  private currentBackground!: string;

  constructor(options: GridCellOptions) {
    super();
    const baseOpacity = options.opacity ?? 0.85;
    const result = GridCellを構築する(
      options, baseOpacity, Math.min(1, baseOpacity + 0.15), () => this.currentBackground,
    );
    this._componentRoot = result.root;
    this.icon = result.icon;
    this.originalBackground = result.base;
    this.currentBackground = result.base;
  }
  protected _ルートを構築する(): DivC { return this._componentRoot; }
  public getRoot(): DivC { return this._componentRoot; }
  public applyStyle(style: IGridMenuItemStyle): void {
    this.currentBackground = style.backgroundColor || this.originalBackground;
    this._componentRoot.setStyleCSS({ backgroundColor: this.currentBackground });
    if (style.iconUrl && this.icon) this.icon.setStyleCSS({ backgroundImage: `url("${style.iconUrl}")` });
  }
  public onClick(listener: (event: MouseEvent) => void): this {
    this._componentRoot.addDivEventListener("click", listener); return this;
  }
  public onMouseEnter(listener: (event: MouseEvent) => void): this {
    this._componentRoot.addDivEventListener("mouseenter", listener); return this;
  }
  public onMouseLeave(listener: (event: MouseEvent) => void): this {
    this._componentRoot.addDivEventListener("mouseleave", listener); return this;
  }
  public setStyleCSS(style: Record<string, string>): this {
    this._componentRoot.setStyleCSS(style); return this;
  }
}
