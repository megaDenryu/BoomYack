export interface IGridMenuItemStyle {
  label?: string | string[];
  iconUrl?: string;
  backgroundColor?: string;
}
export interface IGridCellToggleSeed {
  stateTrue: IGridMenuItemStyle;
  stateFalse: IGridMenuItemStyle;
}
export interface GridCellOptions extends IGridMenuItemStyle {
  col: number | string;
  row: number | string;
  isLayer2: boolean;
  isCenter?: boolean;
  opacity?: number;
}
