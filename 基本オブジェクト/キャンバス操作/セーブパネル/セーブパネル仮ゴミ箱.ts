import { Toast } from "OneONetUIComponents/index";
import { SaveMode } from "./セーブパネル型定義";

import { キャンバスメタデータ } from "../../描画キャンバス/データクラス";

/** ゴミ箱アイテム */
export interface ITrashItem {
    item: キャンバスメタデータ;
    mode: SaveMode;
}

/** 仮ゴミ箱のイベント */
export interface ITrashEvents {
    onDelete: (id: string, mode: SaveMode) => Promise<void>;
    onUpdate: () => void;
}

/**
 * セーブパネルの仮ゴミ箱機能を管理するクラス
 * セッション中のみ保持され、アプリ終了時に完全削除される
 */
export class セーブパネル仮ゴミ箱 {
    private _trash: Map<string, ITrashItem> = new Map();
    private _events: ITrashEvents;

    constructor(events: ITrashEvents) {
        this._events = events;
        this.registerBeforeUnloadHandler();
    }

    /** ゴミ箱のサイズ */
    public get size(): number {
        return this._trash.size;
    }

    /** ゴミ箱が空かどうか */
    public get isEmpty(): boolean {
        return this._trash.size === 0;
    }

    /** アイテムがゴミ箱に入っているか */
    public has(id: string): boolean {
        return this._trash.has(id);
    }

    /** 特定モードのゴミ箱アイテムを取得 */
    public getItemsByMode(mode: SaveMode): ITrashItem[] {
        return Array.from(this._trash.values()).filter(t => t.mode === mode);
    }

    /** アイテムを仮ゴミ箱に移動 */
    public moveToTrash(item: キャンバスメタデータ, mode: SaveMode): void {
        this._trash.set(item.id.id, { item, mode });
        
        Toast.withUndo(
            `「${item.name}」を削除しました`,
            () => this.restore(item.id.id),
            "info"
        );
        
        this._events.onUpdate();
    }

    /** 仮ゴミ箱から復元 */
    public restore(id: string): void {
        const trashItem = this._trash.get(id);
        if (!trashItem) return;
        
        this._trash.delete(id);
        Toast.success(`「${trashItem.item.name}」を復元しました`);
        
        this._events.onUpdate();
    }

    /** 仮ゴミ箱を完全に空にする（実際にサーバー/ローカルから削除） */
    public async emptyTrash(): Promise<void> {
        for (const [id, { mode }] of this._trash) {
            try {
                await this._events.onDelete(id, mode);
            } catch (error) {
                console.error(`削除エラー [${id}]:`, error);
            }
        }
        this._trash.clear();
    }

    /** ページ離脱時に仮ゴミ箱を完全削除するハンドラーを登録 */
    private registerBeforeUnloadHandler(): void {
        window.addEventListener('beforeunload', () => {
            this.emptyTrashSync();
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.emptyTrashSync();
            }
        });
    }

    /** 同期的に仮ゴミ箱を空にする（ページ離脱時用） */
    private emptyTrashSync(): void {
        for (const [id, { mode }] of this._trash) {
            try {
                if (mode === "local") {
                    localStorage.removeItem(`canvas_data_${id}`);
                } else {
                    const data = JSON.stringify({ canvasId: id });
                    navigator.sendBeacon(`/canvas/delete`, data);
                }
            } catch (error) {
                console.error(`削除エラー [${id}]:`, error);
            }
        }
        this._trash.clear();
    }
}
