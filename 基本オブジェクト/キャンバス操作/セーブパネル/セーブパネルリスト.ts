import { ButtonC, DivC, LV2HtmlComponentBase, SpanC } from "SengenUI/index";




import { セーブパネル仮ゴミ箱 } from "./セーブパネル仮ゴミ箱";
import {
    saveListContainer,
    saveListItem,
    saveListItemSelected,
    saveItemName,
    saveItemDate,
    deleteItemButton,
    emptyMessage,
    trashedItem,
    restoreButton,
    jsonFileOutputButton
} from "./style.css";
import { キャンバスメタデータ } from "../../描画キャンバス/データクラス";
import ゴミ箱Icon from "../../../SVGImg/ゴミ箱.svg?url";

/** リスト選択イベント */
export interface ISaveListEvents {
    onSelect: (id: string, name: string) => void;
    onMoveToTrash: (item: キャンバスメタデータ) => void;
    onRestoreFromTrash: (id: string) => void;
    onJsonOutput: (item: キャンバスメタデータ) => void;
}

/**
 * セーブデータリストの表示を管理するコンポーネント
 */
export class セーブパネルリスト extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private _saveList: キャンバスメタデータ[] = [];
    private _selectedItemId: string | null = null;
    private _showingTrash: boolean = false;
    private _trash: セーブパネル仮ゴミ箱;
    private _events: ISaveListEvents;
    private _currentMode: "local" | "server" = "local";

    constructor(trash: セーブパネル仮ゴミ箱, events: ISaveListEvents) {
        super();
        this._trash = trash;
        this._events = events;
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): DivC {
        return new DivC({ class: saveListContainer })
            .child(
                new DivC({ class: emptyMessage })
                    .child(new SpanC({ text: "保存データがありません" }))
            );
    }

    /** リストデータを設定 */
    public setList(list: キャンバスメタデータ[], mode: "local" | "server"): void {
        this._saveList = list;
        this._currentMode = mode;
        this.render();
    }

    /** 選択中のアイテムID */
    public get selectedItemId(): string | null {
        return this._selectedItemId;
    }

    /** 選択をクリア */
    public clearSelection(): void {
        this._selectedItemId = null;
        this.render();
    }

    /** ゴミ箱表示モードを切り替え */
    public toggleTrashView(): boolean {
        this._showingTrash = !this._showingTrash;
        this.render();
        return this._showingTrash;
    }

    /** ゴミ箱表示モードをリセット */
    public resetTrashView(): void {
        this._showingTrash = false;
    }

    /** 再描画 */
    public render(): void {
        this._componentRoot.clearChildren();
        
        if (this._showingTrash) {
            this.renderTrashList();
        } else {
            this.renderSaveList();
        }
    }

    private renderSaveList(): void {
        const visibleItems = this._saveList.filter(item => !this._trash.has(item.id.id));
        
        if (visibleItems.length === 0) {
            this._componentRoot.child(
                new DivC({ class: emptyMessage })
                    .child(new SpanC({ text: "保存データがありません" }))
            );
            return;
        }
        
        for (const item of visibleItems) {
            const isSelected = this._selectedItemId === item.id.id;
            const itemClasses = isSelected ? [saveListItem, saveListItemSelected] : [saveListItem];
            
            this._componentRoot.child(
                new DivC({ class: itemClasses })
                    .addDivEventListener('click', () => this.selectItem(item))
                    .childs([
                        new DivC().childs([
                            new SpanC({ text: item.name, class: saveItemName }),
                            new SpanC({ 
                                text: new Date(item.updatedAt).toLocaleString(), 
                                class: saveItemDate 
                            }).setStyleCSS({ display: 'block' })
                        ]),
                        new ButtonC({ text: "json", class: jsonFileOutputButton})
                            .addTypedEventListener("click", (e) => {
                                e.stopPropagation();
                                this._events.onJsonOutput(item)
                            }),
                        new ButtonC({ text: "", class: deleteItemButton })
                            .setStyleCSS({
                                backgroundImage: `url(${ゴミ箱Icon})`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                width: '32px',
                                height: '32px'
                            })
                            .addTypedEventListener('click', (e) => {
                                e.stopPropagation();
                                this._events.onMoveToTrash(item);
                            })
                    ])
            );
        }
    }

    private renderTrashList(): void {
        const trashItems = this._trash.getItemsByMode(this._currentMode);
        
        if (trashItems.length === 0) {
            this._componentRoot.child(
                new DivC({ class: emptyMessage })
                    .child(new SpanC({ text: "ゴミ箱は空です" }))
            );
            return;
        }
        
        for (const { item } of trashItems) {
            this._componentRoot.child(
                new DivC({ class: [saveListItem, trashedItem] })
                    .childs([
                        new DivC().childs([
                            new SpanC({ text: item.name, class: saveItemName }),
                            new SpanC({ 
                                text: new Date(item.updatedAt).toLocaleString(), 
                                class: saveItemDate 
                            }).setStyleCSS({ display: 'block' })
                        ]),
                        new ButtonC({ text: "↩", class: restoreButton })
                            .addTypedEventListener('click', (e) => {
                                e.stopPropagation();
                                this._events.onRestoreFromTrash(item.id.id);
                            })
                    ])
            );
        }
    }

    private selectItem(item: キャンバスメタデータ): void {
        this._selectedItemId = item.id.id;
        this.render();
        this._events.onSelect(item.id.id, item.name);
    }

    /** 名前から既存アイテムを検索 */
    public findItemByName(name: string): キャンバスメタデータ | null {
        if (!name) return null;
        return this._saveList.find(item => item.name === name) ?? null;
    }

    public getCanvasNameById(id: string): string | null {
        const item = this._saveList.find(item => item.id.id === id);
        return item ? item.name : null;
    }
}

