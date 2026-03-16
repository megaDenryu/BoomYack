import { div, DivC, LV2HtmlComponentBase, MousePosition } from "SengenUI/index";
import { Action, AsyncAction } from "TypeScriptBenriKakuchou/アーキテクチャBase";
import { 多段格子メニューコンテナ } from "../style.css";
import { Iコンテキストメニュー } from "../円状コンテキストメニュー/円状コンテキストメニュー";
import { GridCell, IGridMenuItemStyle, IGridCellToggleSeed, SelectableGridCell } from "./GridCell";

export type 格子メニュー配置位置 = 'left' | 'right' | 'top' | 'bottom' | 'lt' | 'rt' | 'lb' | 'rb';

export interface 格子メニュー1層オプション extends IGridMenuItemStyle {
    id: string;
    Position: 格子メニュー配置位置;
    onClick?: (e: MouseEvent) => void;
}

export interface 格子メニュー2層共通オプション {
    id?: string;
    parentId: string;
}

export interface 格子メニュー2層通常オプション extends 格子メニュー2層共通オプション, IGridMenuItemStyle {
    type?: 'normal';
    onClick: (e: MouseEvent) => void;
}

export interface 格子メニュー2層トグルオプション extends 格子メニュー2層共通オプション {
    type: 'toggle';
    toggleSeed: IGridCellToggleSeed;
    onClick: (e: MouseEvent) => void;
}

export type 格子メニュー2層オプション = 格子メニュー2層通常オプション | 格子メニュー2層トグルオプション;

export interface 多段格子メニューオプション {
    layer1Items: 格子メニュー1層オプション[];
    layer2Items: 格子メニュー2層オプション[];
    mode?: "static" | "clickable";
    opacity?: number;
    showCenterButton?: boolean;
}

const 階層1位置マップ: Record<格子メニュー配置位置, { col: number, row: number }> = {
    top: { col: 4, row: 3 },
    bottom: { col: 4, row: 5 },
    left: { col: 3, row: 4 },
    right: { col: 5, row: 4 },
    lt: { col: 3, row: 3 },
    rt: { col: 5, row: 3 },
    lb: { col: 3, row: 5 },
    rb: { col: 5, row: 5 },
};

const 階層2位置マップ: Record<格子メニュー配置位置, { col: string | number, rowOffset: number }> = {
    top: { col: "3 / span 3", rowOffset: -1 },
    bottom: { col: "3 / span 3", rowOffset: 1 },
    left: { col: "1 / span 2", rowOffset: -1 },
    right: { col: "6 / span 2", rowOffset: -1 },
    lt: { col: "1 / span 2", rowOffset: -1 },
    rt: { col: "6 / span 2", rowOffset: -1 },
    lb: { col: "1 / span 2", rowOffset: 1 },
    rb: { col: "6 / span 2", rowOffset: 1 },
};

export class 多段格子コンテキストメニュー extends LV2HtmlComponentBase implements Iコンテキストメニュー {
    protected _componentRoot: DivC;
    private _isVisible: boolean = false;
    public 他のコンテキストメニューを全て非表示にする?: AsyncAction;
    public onDestroy?: Action;

    private _options: 多段格子メニューオプション;
    private _layer1Elements: {id: string, el: GridCell | SelectableGridCell}[] = [];
    private _layer2Elements: {id: string, itemId: string | undefined, el: GridCell | SelectableGridCell}[] = [];
    private _activeCategoryId: string | null = null;

    constructor(options: 多段格子メニューオプション) {
        super();
        this._options = {
            ...options,
            mode: options.mode ?? "clickable",
            opacity: options.opacity ?? 0.85,
            showCenterButton: options.showCenterButton ?? false
        };
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): DivC {
        const gridContainer = div({class: 多段格子メニューコンテナ})
            .setStyleCSS({
                display: "none",
                position: "absolute",
                gridTemplateColumns: "repeat(7, 64px)",
                gridTemplateRows: "repeat(7, 64px)",
                gap: "6px",
                zIndex: "300",
                pointerEvents: "none",
                transform: "translate(-242px, -242px)", 
                opacity: "0",
                transition: "opacity 0.2s ease-out",
            });

        const layer1List = this._options.layer1Items;
        const layer2List = this._options.layer2Items;
        const layer2CountCounter: Record<string, number> = {};

        layer2List.forEach((item) => {
            const parent = layer1List.find(l1 => l1.id === item.parentId);
            if (!parent) return;

            const posConf = 階層1位置マップ[parent.Position];
            const expandConf = 階層2位置マップ[parent.Position];
            
            const count = layer2CountCounter[item.parentId] || 0;
            layer2CountCounter[item.parentId] = count + 1;
            
            const col = expandConf.col;
            const row = posConf.row + count + expandConf.rowOffset;

            let cell: GridCell | SelectableGridCell;
            if (item.type === 'toggle') {
                const toggleItem = item as 格子メニュー2層トグルオプション;
                cell = new SelectableGridCell({
                    col, row, isLayer2: true, opacity: this._options.opacity,
                    label: toggleItem.toggleSeed.stateFalse.label,
                    iconUrl: toggleItem.toggleSeed.stateFalse.iconUrl,
                    backgroundColor: toggleItem.toggleSeed.stateFalse.backgroundColor,
                }, toggleItem.toggleSeed);
            } else {
                const normalItem = item as 格子メニュー2層通常オプション;
                cell = new GridCell({
                    col, row, isLayer2: true, opacity: this._options.opacity,
                    label: normalItem.label, iconUrl: normalItem.iconUrl, backgroundColor: normalItem.backgroundColor
                });
            }
            
            cell.onClick((e) => {
                item.onClick(e);
                if (item.type !== 'toggle') {
                    this.非表示();
                }
            });

            if (this._options.mode === "static") {
                cell.setStyleCSS({ opacity: "1", pointerEvents: "auto" });
            } else {
                cell.setStyleCSS({ opacity: "0", transition: "all 0.2s", pointerEvents: "none", transform: "scale(0.95)" });
            }
            
            this._layer2Elements.push({ id: item.parentId, itemId: item.id, el: cell });
            gridContainer.child(cell.getRoot());
        });

        layer1List.forEach(item => {
            const pos = 階層1位置マップ[item.Position];
            const cell = new GridCell({
                col: pos.col, row: pos.row, label: item.label, iconUrl: item.iconUrl, 
                backgroundColor: item.backgroundColor, isLayer2: false, opacity: this._options.opacity
            });
            cell.setStyleCSS({ pointerEvents: "auto" });
            
            cell.onClick((e) => {
                if (item.onClick) {
                    item.onClick(e);
                    this.非表示();
                    return;
                }

                if (this._options.mode === "clickable") {
                    if (this._activeCategoryId === item.id) {
                        this._activeCategoryId = null;
                        this.hideAllSubmenus();
                        return;
                    }

                    this._activeCategoryId = item.id;
                    this.hideAllSubmenus();
                    this.showSubmenu(item.id);
                }
            });
            this._layer1Elements.push({ id: item.id, el: cell });
            gridContainer.child(cell.getRoot());
        });

        if (this._options.showCenterButton) {
            const centerCell = new GridCell({
                col: 4, row: 4, label: "閉じる", isLayer2: false, isCenter: true, opacity: this._options.opacity
            });
            centerCell.setStyleCSS({ 
                pointerEvents: "auto", 
                backgroundColor: `rgba(192, 57, 43, ${this._options.opacity})` 
            });
            centerCell.onMouseEnter(() => centerCell.getRoot().setStyleCSS({ backgroundColor: `rgba(231, 76, 60, ${Math.min(1, (this._options.opacity??0.85) + 0.15)})` }));
            centerCell.onMouseLeave(() => centerCell.getRoot().setStyleCSS({ backgroundColor: `rgba(192, 57, 43, ${this._options.opacity})` }));
            centerCell.onClick((e) => this.非表示());
            gridContainer.child(centerCell.getRoot());
        }

        return gridContainer;
    }

    private hideAllSubmenus() {
        this._layer2Elements.forEach(l2 => {
            l2.el.getRoot().setStyleCSS({ opacity: "0", pointerEvents: "none", transform: "scale(0.95)" });
        });
    }

    private showSubmenu(targetId: string) {
        this._layer2Elements.filter(l2 => l2.id === targetId).forEach(l2 => {
            l2.el.getRoot().setStyleCSS({ opacity: "1", pointerEvents: "auto", transform: "scale(1)" });
        });
    }

    public selectItem(id: string, isSelected: boolean) {
        const cellInfo = this._layer2Elements.find(l => l.itemId === id) || this._layer1Elements.find(l => l.id === id);
        if (cellInfo && cellInfo.el instanceof SelectableGridCell) {
            cellInfo.el.select(isSelected);
        }
    }

    public updateItem(id: string, opts: { label?: string|string[], iconUrl?: string, backgroundColor?: string }) {
        const cellInfo = this._layer2Elements.find(l => l.itemId === id) || this._layer1Elements.find(l => l.id === id);
        if (cellInfo) {
            cellInfo.el.applyStyle(opts);
        }
    }

    public async 表示(pos: MousePosition): Promise<this> {
        if (this.他のコンテキストメニューを全て非表示にする) {
            await this.他のコンテキストメニューを全て非表示にする();
        }

        this._isVisible = true;
        this._activeCategoryId = null;
        if (this._options.mode === "clickable") {
            this.hideAllSubmenus();
        }

        this._componentRoot
            .setStyleCSS({
                display: 'grid',
                left: `${pos.x}px`,
                top: `${pos.y}px`
            });
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this._componentRoot.setStyleCSS({ opacity: '1' });
            });
        });

        return this;
    }

    public async 非表示(閉じ時間: number = 200): Promise<this> {
        if (!this._isVisible) { return this; }
        this._isVisible = false;
        
        this._componentRoot.setStyleCSS({ opacity: '0' });
        
        await new Promise<void>(resolve => {
            setTimeout(() => {
                if (!this._isVisible) {
                    this._componentRoot.setStyleCSS({ display: 'none' });
                }
                resolve();
            }, 閉じ時間);
        });
        return this;
    }

    public async 表示トグル(pos: MousePosition): Promise<this> {
        if (this._isVisible) {
            return await this.非表示();
        } else {
            return await this.表示(pos);
        }
    }

    public get isVisible(): boolean {
        return this._isVisible;
    }

    public delete(): void {
        super.delete();
        this.onDestroy?.();
    }
}
