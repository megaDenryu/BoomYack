import { Toast } from "OneONetUIComponents/index";
import { キャンバスメタデータ } from "../../描画キャンバス/データクラス";
import { グローバルイベント購読 } from "../../グローバルイベント購読";
import { ゴミ箱を同期削除する } from "./セーブパネルゴミ箱終了処理";
import { SaveMode } from "./セーブパネル型定義";
import { ボード購読台帳 } from "../../ボード購読台帳";

export interface ITrashItem {
  item: キャンバスメタデータ;
  mode: SaveMode;
}
export interface ITrashEvents {
  onDelete: (id: string, mode: SaveMode) => Promise<void>;
  onUpdate: () => void;
}

export class セーブパネル仮ゴミ箱 {
  private _trash = new Map<string, ITrashItem>();

  constructor(private _events: ITrashEvents, 購読台帳: ボード購読台帳) {
    this.ページを閉じるときにゴミ箱を空にする購読を登録する(購読台帳);
  }
  public get size(): number { return this._trash.size; }
  public get isEmpty(): boolean { return this._trash.size === 0; }
  public has(id: string): boolean { return this._trash.has(id); }
  public getItemsByMode(mode: SaveMode): ITrashItem[] {
    return Array.from(this._trash.values()).filter(item => item.mode === mode);
  }
  public moveToTrash(item: キャンバスメタデータ, mode: SaveMode): void {
    this._trash.set(item.id.id, { item, mode });
    Toast.withUndo(`「${item.name}」を削除しました`, () => this.restore(item.id.id), "info");
    this._events.onUpdate();
  }
  public restore(id: string): void {
    const trashItem = this._trash.get(id);
    if (!trashItem) return;
    this._trash.delete(id);
    Toast.success(`「${trashItem.item.name}」を復元しました`);
    this._events.onUpdate();
  }
  public async emptyTrash(): Promise<void> {
    for (const [id, { mode }] of this._trash) {
      try { await this._events.onDelete(id, mode); }
      catch (error) { console.error(`削除エラー [${id}]:`, error); }
    }
    this._trash.clear();
  }
  // ウインドウが隠れたとき(最小化を含む)には空にしない。別のボードで開いている保存データまで消えるため。
  private ページを閉じるときにゴミ箱を空にする購読を登録する(購読台帳: ボード購読台帳): void {
    購読台帳.常に動くものとして登録する(グローバルイベント購読.作成する(window, "beforeunload", () => this.emptyTrashSync()));
  }
  private emptyTrashSync(): void {
    ゴミ箱を同期削除する(this._trash);
    this._trash.clear();
  }
}
