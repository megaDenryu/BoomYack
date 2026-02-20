import { DivC, LV2HtmlComponentBase, MousePosition, SpanC } from "SengenUI/index";
import { Action, AsyncAction } from "TypeScriptBenriKakuchou/アーキテクチャBase";
import { Iコンテキストメニュー } from "../円状コンテキストメニュー/円状コンテキストメニュー";

export type 格子メニュー配置位置 = 'left' | 'right' | 'top' | 'bottom' | 'lt' | 'rt' | 'lb' | 'rb';

export interface 格子メニュー1層オプション {
    id: string; // e.g. 'L1-left'
    label: string | string[];
    iconUrl?: string;
    Position: 格子メニュー配置位置;
    onClick?: (e: MouseEvent) => void;
}

export interface 格子メニュー2層オプション {
    parentId: string; // layer1 options id
    label: string | string[];
    iconUrl?: string;
    onClick: (e: MouseEvent) => void;
}

export interface 多段格子メニューオプション {
    layer1Items: 格子メニュー1層オプション[];
    layer2Items: 格子メニュー2層オプション[];
    mode?: "static" | "clickable"; // Defaults to clickable
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

// 階層2を展開する際のレイアウトロジック。
// 配置場所に応じて、外側に展開するようにする
const 階層2位置マップ: Record<格子メニュー配置位置, { col: string | number, rowOffset: number }> = {
    top: { col: "3 / span 3", rowOffset: -1 }, // 上に展開
    bottom: { col: "3 / span 3", rowOffset: 1 }, // 下に展開
    left: { col: "1 / span 2", rowOffset: -1 }, // 左に展開して幅広
    right: { col: "6 / span 2", rowOffset: -1 }, // 右に展開して幅広
    lt: { col: "1 / span 2", rowOffset: -1 },
    rt: { col: "6 / span 2", rowOffset: -1 },
    lb: { col: "1 / span 2", rowOffset: 1 },
    rb: { col: "6 / span 2", rowOffset: 1 },
};

/**
 * 提案-021: 7x7のグリッドベースで各レイヤーを表現したコンテキストメニュー
 */
export class 多段格子コンテキストメニュー extends LV2HtmlComponentBase implements Iコンテキストメニュー {
    protected _componentRoot: DivC;
    private _isVisible: boolean = false;
    public 他のコンテキストメニューを全て非表示にする?: AsyncAction;
    public onDestroy?: Action;

    private _options: 多段格子メニューオプション;
    private _layer2Elements: {id: string, el: GridCell}[] = [];
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
        // 重なりを避けるため、7x7のグリッドコンテナを作成
        // 中央(4,4)が対象ノードの中心点になるように配置する
        const gridContainer = new DivC({class: "grid-context-menu-container"})
            .setStyleCSS({
                display: "none", // 初期状態は非表示
                position: "absolute",
                gridTemplateColumns: "repeat(7, 64px)", // 正方形セルの幅
                gridTemplateRows: "repeat(7, 64px)",    // 正方形セルの高さ
                gap: "6px",
                zIndex: "300", // ZIndexは前面へ
                pointerEvents: "none", // 空白部分はイベントを透過
                // 中央セルの中心がマウスカーソルの位置に来るように、左上を調整
                // 3つのセル幅(64*3) + 3ギャップ(6*3) + 中央セルの半分(32) = 192 + 18 + 32 = 242px をマイナスする
                transform: "translate(-242px, -242px)", 
                opacity: "0",
                transition: "opacity 0.2s ease-out",
            });

        // ==========================================
        // 第1層：中央を囲む8マス
        // ==========================================
        const layer1List = this._options.layer1Items;

        // ==========================================
        // 第2層：第1層の外側に配置される展開ボタン
        // ==========================================
        const layer2List = this._options.layer2Items;

        // Layer 2 の描画
        // 親のPositionから配置場所を決定して整列する
        const layer2CountCounter: Record<string, number> = {};

        layer2List.forEach((item, index) => {
            const parent = layer1List.find(l1 => l1.id === item.parentId);
            if (!parent) return;

            const posConf = 階層1位置マップ[parent.Position];
            const expandConf = 階層2位置マップ[parent.Position];
            
            // 親カテゴリ内の何番目のアイテムかカウント
            const count = layer2CountCounter[item.parentId] || 0;
            layer2CountCounter[item.parentId] = count + 1;
            
            // 配置の計算
            const col = expandConf.col;
            // 親行(posConf.row)を中心に上下に並べるため、count分だけずらす（雑な配置ロジック）
            const row = posConf.row + count + expandConf.rowOffset;

            const cell = new GridCell(col, row, item.label, item.iconUrl, true, false, this._options.opacity);
            
            cell.onClick((e) => {
                item.onClick(e);
                this.非表示();
            });

            if (this._options.mode === "static") {
                cell.setStyleCSS({ opacity: "1", pointerEvents: "auto" });
            } else {
                cell.setStyleCSS({ opacity: "0", transition: "all 0.2s", pointerEvents: "none", transform: "scale(0.95)" });
            }
            
            this._layer2Elements.push({ id: item.parentId, el: cell });
            gridContainer.child(cell.getRoot());
        });

        // Layer 1 の描画
        layer1List.forEach(item => {
            const pos = 階層1位置マップ[item.Position];
            const cell = new GridCell(pos.col, pos.row, item.label, item.iconUrl, false, false, this._options.opacity);
            cell.setStyleCSS({ pointerEvents: "auto" });
            
            cell.onClick((e) => {
                if (item.onClick) {
                    item.onClick(e);
                    // 第一階層クリックでアクションが実行された場合はメニューを閉じる
                    this.非表示();
                    return;
                }

                if (this._options.mode === "clickable") {
                    // 同じボタンをもう一度押したら閉じる（トグル機能）
                    if (this._activeCategoryId === item.id) {
                        this._activeCategoryId = null;
                        this.hideAllSubmenus();
                        return;
                    }

                    // 違うボタンを押したら、他を閉じて該当項目を開く
                    this._activeCategoryId = item.id;
                    this.hideAllSubmenus();
                    this.showSubmenu(item.id);
                }
            });
            gridContainer.child(cell.getRoot());
        });

        // Center Button (オプション)
        if (this._options.showCenterButton) {
            const centerCell = new GridCell(4, 4, "閉じる", undefined, false, true, this._options.opacity);
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

    // ===============================================
    // Iコンテキストメニュー 実装
    // ===============================================

    public async 表示(pos: MousePosition): Promise<this> {
        if (this.他のコンテキストメニューを全て非表示にする) {
            await this.他のコンテキストメニューを全て非表示にする();
        }

        this._isVisible = true;
        this._activeCategoryId = null; // リセット
        if (this._options.mode === "clickable") {
            this.hideAllSubmenus();
        }

        this._componentRoot
            .setStyleCSS({
                display: 'grid',
                left: `${pos.x}px`,
                top: `${pos.y}px`
            });
        
        // 少しディレイを入れてからOpacityでフェードインさせることでアニメーションを適用
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
        
        // アニメーション終了まで待機してからdisplay:noneにする
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

class GridCell extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private _baseOpacity: number;
    private _hoverOpacity: number;

    constructor(col: number | string, row: number | string, text: string | string[], iconUrl: string | undefined, isLayer2: boolean, isCenter: boolean = false, opacity: number = 0.85) {
        super();
        this._baseOpacity = opacity ?? 0.85;
        this._hoverOpacity = Math.min(1, this._baseOpacity + 0.15); 
        this._componentRoot = this.createComponentRoot(col, row, text, iconUrl, isLayer2, isCenter);
    }

    public getRoot(): DivC {
        return this._componentRoot;
    }

    protected createComponentRoot(col: number | string, row: number | string, text: string | string[], iconUrl: string | undefined, isLayer2: boolean, isCenter: boolean): DivC {
        const bgColors = {
            layer1: { base: `rgba(52, 73, 94, ${this._baseOpacity})`, hover: `rgba(44, 62, 80, ${this._hoverOpacity})` },
            layer2: { base: `rgba(41, 128, 185, ${this._baseOpacity})`, hover: `rgba(52, 152, 219, ${this._hoverOpacity})` }
        };

        const activeBg = isLayer2 ? bgColors.layer2 : bgColors.layer1;

        const root = new DivC({class: `grid-cell`})
            .setStyleCSS({
                gridColumn: typeof col === "number" ? col.toString() : col,
                gridRow: typeof row === "number" ? row.toString() : row,
                backgroundColor: activeBg.base,
                backdropFilter: "blur(4px)",
                color: "white",
                borderRadius: "6px",
                padding: "4px 8px", // Padding adjusted to look better with multiple lines
                display: "flex",
                flexDirection: "column", // allow text to spawn on multiple lines
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
                if (!isCenter) {
                    this._componentRoot.setStyleCSS({ backgroundColor: activeBg.hover });
                }
            })
            .addDivEventListener("mouseleave", () => {
                if (!isCenter) {
                    this._componentRoot.setStyleCSS({ backgroundColor: activeBg.base });
                }
            })
            .addDivEventListener("mousedown", () => {
                this._componentRoot.setStyleCSS({ transform: "scale(0.95)" });
            })
            .addDivEventListener("mouseup", (e) => {
                this._componentRoot.setStyleCSS({ transform: "scale(1)" });
            });
            
        if (iconUrl) {
           root.child(
                new DivC()
                    .setStyleCSS({
                        width: '24px',
                        height: '24px',
                        marginBottom: text ? '4px' : '0',
                        backgroundImage: `url("${iconUrl}")`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        pointerEvents: 'none'
                    })
           );
        }

        if (text) {
            const texts = Array.isArray(text) ? text : [text];
            texts.forEach(t => {
                root.child(new SpanC({text: t}).setStyleCSS({ pointerEvents: 'none', lineHeight: '1.2' }));
            });
        }
        
        return root;
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
