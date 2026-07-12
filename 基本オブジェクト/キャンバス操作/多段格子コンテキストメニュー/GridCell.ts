import { div, span, DivC, LV2HtmlComponentBase } from "SengenUI/index";
import { 多段格子メニューセル } from "../style.css";

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

export class GridCell extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    protected _baseOpacity: number;
    protected _hoverOpacity: number;
    protected _iconContainer?: DivC;
    protected _originalBaseBg!: string;
    protected _currentBaseBg!: string;

    constructor(options: GridCellOptions) {
        super();
        this._baseOpacity = options.opacity ?? 0.85;
        this._hoverOpacity = Math.min(1, this._baseOpacity + 0.15); 
        this._componentRoot = this._ルートを構築する(options);
    }

    public getRoot(): DivC {
        return this._componentRoot;
    }

    protected _ルートを構築する(options: GridCellOptions): DivC {
        const bgColors = {
            layer1: { base: options.backgroundColor || `rgba(52, 73, 94, ${this._baseOpacity})`, hover: `rgba(44, 62, 80, ${this._hoverOpacity})` },
            layer2: { base: options.backgroundColor || `rgba(41, 128, 185, ${this._baseOpacity})`, hover: `rgba(52, 152, 219, ${this._hoverOpacity})` }
        };

        const activeBg = options.isLayer2 ? bgColors.layer2 : bgColors.layer1;
        this._originalBaseBg = activeBg.base;
        this._currentBaseBg = activeBg.base;

        const root = div({class: 多段格子メニューセル})
            .setStyleCSS({
                gridColumn: typeof options.col === "number" ? options.col.toString() : options.col,
                gridRow: typeof options.row === "number" ? options.row.toString() : options.row,
                backgroundColor: this._currentBaseBg,
                backdropFilter: "blur(4px)",
                color: "white",
                borderRadius: "6px",
                padding: options.label ? "4px 8px" : "2px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                userSelect: "none",
                transition: "background-color 0.2s, transform 0.2s",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
            })
            .addDivEventListener("mouseenter", () => {
                if (!options.isCenter) {
                    if (this._currentBaseBg !== this._originalBaseBg || options.backgroundColor) {
                        this._componentRoot.setStyleCSS({ backgroundColor: "rgba(255, 255, 255, 0.8)" });
                    } else {
                        this._componentRoot.setStyleCSS({ backgroundColor: activeBg.hover });
                    }
                }
            })
            .addDivEventListener("mouseleave", () => {
                if (!options.isCenter) {
                    this._componentRoot.setStyleCSS({ backgroundColor: this._currentBaseBg });
                }
            })
            .addDivEventListener("mousedown", () => {
                this._componentRoot.setStyleCSS({ transform: "scale(0.95)" });
            })
            .addDivEventListener("mouseup", () => {
                this._componentRoot.setStyleCSS({ transform: "scale(1)" });
            });
            
        if (options.iconUrl) {
           this._iconContainer = div()
               .setStyleCSS({
                   width: '48px',
                   height: '48px',
                   marginBottom: options.label ? '4px' : '0',
                   backgroundImage: `url("${options.iconUrl}")`,
                   backgroundSize: 'contain',
                   backgroundRepeat: 'no-repeat',
                   backgroundPosition: 'center',
                   pointerEvents: 'none'
               });
           root.child(this._iconContainer);
        }

        if (options.label && (!options.iconUrl || Array.isArray(options.label) || options.label.length > 0)) {
            if (!options.iconUrl) {
                const texts = Array.isArray(options.label) ? options.label : [options.label];
                texts.forEach(t => {
                    root.child(span({text: t}).setStyleCSS({ pointerEvents: 'none', lineHeight: '1.2' }));
                });
            }
        }
        
        return root;
    }

    public applyStyle(style: IGridMenuItemStyle) {
        if (style.backgroundColor) {
            this._currentBaseBg = style.backgroundColor;
        } else {
            this._currentBaseBg = this._originalBaseBg;
        }
        this._componentRoot.setStyleCSS({ backgroundColor: this._currentBaseBg });

        if (style.iconUrl && this._iconContainer) {
             this._iconContainer.setStyleCSS({
                 backgroundImage: `url("${style.iconUrl}")`
             });
        }
    }

    public onClick(listener: (e: MouseEvent) => void): this {
        this._componentRoot.addDivEventListener("click", listener as any);
        return this;
    }

    public onMouseEnter(listener: (e: MouseEvent) => void): this {
        this._componentRoot.addDivEventListener("mouseenter", listener as any);
        return this;
    }
    
    public onMouseLeave(listener: (e: MouseEvent) => void): this {
        this._componentRoot.addDivEventListener("mouseleave", listener as any);
        return this;
    }

    public setStyleCSS(style: Record<string, string>): this {
        this._componentRoot.setStyleCSS(style);
        return this;
    }
}

export class SelectableGridCell {
    private _cell: GridCell;
    private _seed?: IGridCellToggleSeed;
    private _isSelected: boolean = false;

    constructor(options: GridCellOptions, seed?: IGridCellToggleSeed) {
        this._cell = new GridCell(options);
        this._seed = seed;
        if (seed) {
            this.select(false); // 初期状態
        }
    }

    public getRoot(): DivC {
        return this._cell.getRoot();
    }

    public get isSelected(): boolean { return this._isSelected; }

    public setSeed(seed: IGridCellToggleSeed): void {
        this._seed = seed;
    }

    public select(isSelected: boolean): this {
        this._isSelected = isSelected;
        if (!this._seed) return this;

        const targetStyle = isSelected ? this._seed.stateTrue : this._seed.stateFalse;
        this._cell.applyStyle(targetStyle);
        return this;
    }

    public toggle(): this {
        this.select(!this._isSelected);
        return this;
    }

    public onClick(listener: (e: MouseEvent) => void): this {
        this._cell.onClick(listener);
        return this;
    }

    public applyStyle(style: IGridMenuItemStyle) {
        this._cell.applyStyle(style);
    }

    public setStyleCSS(style: Record<string, string>): this {
        this._cell.setStyleCSS(style);
        return this;
    }
}
