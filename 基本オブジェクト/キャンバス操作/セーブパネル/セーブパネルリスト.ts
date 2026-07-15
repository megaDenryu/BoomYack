import { div, DivC, LV2HtmlComponentBase } from "SengenUI/index";
import { キャンバスメタデータ } from "../../描画キャンバス/データクラス";
import { SaveMode } from "./セーブパネル型定義";
import { セーブパネル仮ゴミ箱 } from "./セーブパネル仮ゴミ箱";
import { ゴミ箱項目, 空メッセージ, 保存項目 } from "./セーブパネルリスト項目";
import { saveListContainer } from "./style.css";

export interface ISaveListEvents {
  onSelect: (id: string, name: string) => void;
  onMoveToTrash: (item: キャンバスメタデータ) => void;
  onRestoreFromTrash: (id: string) => void;
  onJsonOutput: (item: キャンバスメタデータ) => void;
}

export class セーブパネルリスト extends LV2HtmlComponentBase {
  protected _componentRoot: DivC;
  private _saveList: キャンバスメタデータ[] = [];
  private _selectedItemId: string | null = null;
  private _showingTrash = false;
  private _currentMode: SaveMode = "local";

  constructor(private _trash: セーブパネル仮ゴミ箱, private _events: ISaveListEvents) {
    super();
    this._componentRoot = div({ class: saveListContainer });
    this.render();
  }

  public setList(list: キャンバスメタデータ[], mode: SaveMode): void {
    this._saveList = list;
    this._currentMode = mode;
    this.render();
  }
  public get selectedItemId(): string | null { return this._selectedItemId; }
  public clearSelection(): void { this._selectedItemId = null; this.render(); }
  public toggleTrashView(): boolean {
    this._showingTrash = !this._showingTrash;
    this.render();
    return this._showingTrash;
  }
  public resetTrashView(): void { this._showingTrash = false; }
  public render(): void {
    this._componentRoot.clearChildren();
    if (this._showingTrash) this.renderTrashList();
    else this.renderSaveList();
  }

  private renderSaveList(): void {
    const items = this._saveList.filter(item => !this._trash.has(item.id.id));
    if (items.length === 0) { this._componentRoot.child(空メッセージ("保存データがありません")); return; }
    for (const item of items) this._componentRoot.child(保存項目(
      item, this._selectedItemId === item.id.id,
      () => this.selectItem(item),
      () => this._events.onJsonOutput(item),
      () => this._events.onMoveToTrash(item),
    ));
  }

  private renderTrashList(): void {
    const items = this._trash.getItemsByMode(this._currentMode);
    if (items.length === 0) { this._componentRoot.child(空メッセージ("ゴミ箱は空です")); return; }
    for (const { item } of items) this._componentRoot.child(
      ゴミ箱項目(item, () => this._events.onRestoreFromTrash(item.id.id)),
    );
  }

  private selectItem(item: キャンバスメタデータ): void {
    this._selectedItemId = item.id.id;
    this.render();
    this._events.onSelect(item.id.id, item.name);
  }
  public findItemByName(name: string): キャンバスメタデータ | null {
    return name ? this._saveList.find(item => item.name === name) ?? null : null;
  }
  public getCanvasNameById(id: string): string | null {
    return this._saveList.find(item => item.id.id === id)?.name ?? null;
  }
}
