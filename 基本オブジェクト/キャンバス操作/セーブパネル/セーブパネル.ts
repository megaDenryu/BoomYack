import { Toast } from "OneONetUIComponents/index";
import { ButtonC, DivC, InputC, LV2HtmlComponentBase, SpanC } from "SengenUI/index";
import {
    modeButton,
    modeButtonActive,
    overlayBackdrop,
    overlayBackdropVisible,
    panelFadeIn,
    panelFadeOut,
} from "./style.css";

import { SaveMode, ISavePanelEvents } from "./セーブパネル型定義";
import { セーブパネル仮ゴミ箱 } from "./セーブパネル仮ゴミ箱";
import { セーブパネルリスト } from "BoomYack/基本オブジェクト/キャンバス操作/セーブパネル/セーブパネルリスト";
import { 描画キャンバスデータ } from "BoomYack/基本オブジェクト/描画キャンバス/データクラス";
import { グローバルイベントを購読する } from "BoomYack/基本オブジェクト/グローバルイベント購読";
import ゴミ箱Icon from "../../../SVGImg/ゴミ箱.svg?url";

import { キャンバスJSON出力サービス } from "BoomYack/基本オブジェクト/ファイル入出力/キャンバスJSON出力サービス";
import { セーブパネル外枠 } from "./セーブパネル外枠UI";
import { I保存欄イベント, I保存欄参照, 新規保存欄, 現在名欄 } from "./セーブパネル保存欄UI";
import { ゴミ箱欄, モード欄, リスト欄, 読込欄 } from "./セーブパネル操作欄UI";

// 型定義を再エクスポート
export type { SaveMode, ISavePanelEvents } from "./セーブパネル型定義";

/**
 * セーブパネルコンポーネント
 * キャンバスのセーブ/ロード機能を提供するフローティングパネル
 */
export class セーブパネル extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private _backdrop!: DivC;
    private _panel!: DivC;
    private _isVisible: boolean = false;
    private _currentMode: SaveMode = "local";
    private _events: ISavePanelEvents;
    private _currentCanvasName: string|null = null;

    // 子コンポーネント
    private _trash!: セーブパネル仮ゴミ箱;
    private _list!: セーブパネルリスト;
    private _json出力サービス!: キャンバスJSON出力サービス

    // UI要素参照
    private _localModeBtn!: ButtonC;
    private _serverModeBtn!: ButtonC;
    private _currentCanvasNameSpan!: SpanC;
    private _currentCanvasNameInput!: InputC;
    private _isRenaming: boolean = false;
    private _overwriteSaveButton!: ButtonC;
    private _newSaveNameInput!: InputC;
    private _newSaveButton!: ButtonC;
    private _loadButton!: ButtonC;
    private _trashToggleBtn: ButtonC | null = null;
    private _trashBadgeSpan: SpanC | null = null;

    constructor(events: ISavePanelEvents) {
        super();
        this._events = events;
        this.initializeSubComponents();
        this._componentRoot = this._ルートを構築する();
    }

    private initializeSubComponents(): void {
        // 仮ゴミ箱を初期化
        this._trash = new セーブパネル仮ゴミ箱({
            onDelete: (id, mode) => this._events.onDelete(id, mode),
            onUpdate: () => {
                this.updateTrashButton();
                this._list.render();
            }
        });

        // リストを初期化
        this._list = new セーブパネルリスト(this._trash, {
            onSelect: (id, name) => {
                // 選択状態のみ管理（保存には使用しない）
            },
            onMoveToTrash: (item) => {
                this._trash.moveToTrash(item, this._currentMode);
            },
            onRestoreFromTrash: (id) => {
                this._trash.restore(id);
            },
            onJsonOutput: async (item) => {
                await this.保存済みデータをJSON出力(item.id.id, this._currentMode);
            }
         });

         this._json出力サービス = キャンバスJSON出力サービス.create()
    }

    /**
     * 現在編集中のキャンバスデータをJSON出力
     */
    private CurrentCanvasDataJsonOutput(): void {
        const 現在のキャンバスデータ = this._events.onGetCurrentCanvasData();
        this._json出力サービス.出力(現在のキャンバスデータ);
    }

    /**
     * 保存済みキャンバスデータをJSON出力
     * @param id 出力するキャンバスのID
     * @param mode 取得元（ローカル/サーバー）
     */
    private async 保存済みデータをJSON出力(id: string, mode: SaveMode): Promise<void> {
        try {
            const キャンバスデータ = await this._events.onGetCanvasDataById(id, mode);
            if (!キャンバスデータ) {
                Toast.error("キャンバスデータが見つかりませんでした");
                return;
            }
            this._json出力サービス.出力(キャンバスデータ);
            Toast.success("JSONファイルをダウンロードしました");
        } catch (error) {
            console.error("JSON出力エラー:", error);
            Toast.error("JSON出力に失敗しました");
        }
    }

    protected _ルートを構築する(): DivC {
        グローバルイベントを購読する(window, 'keydown', (e) => {
                if (e.key === "s" && e.ctrlKey == true) {
                    e.preventDefault();
                    if (this._currentCanvasName == null) {
                        this.開く();
                    } else {
                        this._events.onSave(this._currentCanvasName, this._currentMode);
                        Toast.success(`${this._currentCanvasName}を上書き保存しました`, { type: "success" });
                    }
                    
                }
            });
        const refs: I保存欄参照 = {
            currentNameSpan: value => this._currentCanvasNameSpan = value,
            currentNameInput: value => this._currentCanvasNameInput = value,
            overwriteButton: value => this._overwriteSaveButton = value,
            newNameInput: value => this._newSaveNameInput = value,
            newSaveButton: value => this._newSaveButton = value,
        };
        const events: I保存欄イベント = {
            startRenaming: () => this.startRenaming(), renameKeydown: event => this.handleRenameKeydown(event),
            confirmRenaming: () => this.confirmRenaming(), overwriteSave: () => this.handleOverwriteSave(),
            newSave: () => this.handleNewSave(),
        };
        return セーブパネル外枠([
            モード欄(this._events.onIsServerModeAvailable(), mode => this.switchMode(mode),
                value => this._localModeBtn = value, value => this._serverModeBtn = value),
            現在名欄(this._currentCanvasName, refs, events), 新規保存欄(refs, events), リスト欄(this._list),
            読込欄(() => this.handleLoad(), value => this._loadButton = value),
            ゴミ箱欄(() => this.toggleTrashView(), value => this._trashToggleBtn = value,
                value => this._trashBadgeSpan = value),
        ], () => this.閉じる(), value => this._backdrop = value, value => this._panel = value);
    }

    // ====== パネル表示制御 ======

    public async 開く(): Promise<this> {
        this._isVisible = true;
        this._componentRoot.setStyleCSS({ display: 'block' });
        this._backdrop.addClass([overlayBackdrop, overlayBackdropVisible]);
        this._panel.setStyleCSS({ animation: `${panelFadeIn} 0.2s ease-out forwards` });
        await this.refreshList();
        return this;
    }

    public async 閉じる(): Promise<this> {
        this._isVisible = false;
        this._backdrop.addClass(overlayBackdrop);
        this._panel.setStyleCSS({ animation: `${panelFadeOut} 0.2s ease-in forwards` });
        this._list.resetTrashView();
        
        await new Promise<void>(resolve => {
            setTimeout(() => {
                if (!this._isVisible) {
                    this._componentRoot.setStyleCSS({ display: 'none' });
                }
                resolve();
            }, 200);
        });
        return this;
    }

    public async 表示切替(): Promise<this> {
        return this._isVisible ? this.閉じる() : this.開く();
    }

    public get isVisible(): boolean {
        return this._isVisible;
    }

    // ====== 状態切り替え ======

    private switchMode(mode: SaveMode): void {
        this._currentMode = mode;
        this._localModeBtn.removeClass(modeButtonActive);
        this._serverModeBtn.removeClass(modeButtonActive);
        (mode === "local" ? this._localModeBtn : this._serverModeBtn).addClass(modeButtonActive);
        this.refreshList();
    }

    private async refreshList(): Promise<void> {
        try {
            const list = await this._events.onRefreshList(this._currentMode);
            this._list.setList(list, this._currentMode);
        } catch (error) {
            console.error("リスト取得エラー:", error);
            this._list.setList([], this._currentMode);
        }
    }

    // ====== 保存・読込処理 ======

    private async handleOverwriteSave(): Promise<void> {
        if (!this._currentCanvasName) {
            Toast.warning("上書き保存できるキャンバスがありません");
            return;
        }
        
        try {
            await this._events.onSave(this._currentCanvasName, this._currentMode);
            await this.refreshList();
            Toast.success(`${this._currentCanvasName}を上書き保存しました`);
        } catch (error) {
            console.error("上書き保存エラー:", error);
            Toast.error("上書き保存に失敗しました");
        }
    }

    private async handleNewSave(): Promise<void> {
        const name = this._newSaveNameInput.getValue().trim();
        if (!name) {
            Toast.warning("保存名を入力してください");
            return;
        }
        
        const existingItem = this._list.findItemByName(name);
        if (existingItem && !this._trash.has(existingItem.id.id)) {
            Toast.warning("同名のキャンバスが既に存在します");
            return;
        }
        
        try {
            await this._events.onSave(name, this._currentMode);
            this._list.clearSelection();
            await this.refreshList();
            Toast.success("保存しました");
            this.updateCurrentCanvasName(name);
            this._newSaveNameInput.setValue("");
        } catch (error) {
            console.error("新規保存エラー:", error);
            Toast.error("新規保存に失敗しました");
        }
    }

    private async handleLoad(): Promise<void> {
        const selectedId = this._list.selectedItemId;
        if (!selectedId) {
            Toast.warning("読み込むデータを選択してください");
            return;
        }
        
        if (this._trash.has(selectedId)) {
            Toast.warning("削除予定のデータです。復元してから読み込んでください");
            return;
        }
        
        try {
            await this._events.onLoad(selectedId, this._currentMode);
            const loadedName = this._list.getCanvasNameById(selectedId);
            this.updateCurrentCanvasName(loadedName);
            await this.閉じる();
            Toast.success("読み込みました");
        } catch (error) {
            console.error("読み込みエラー:", error);
            Toast.error("読み込みに失敗しました");
        }
    }

    private updateCurrentCanvasName(name: string | null): void {
        this._currentCanvasName = name;
        if (this._currentCanvasNameSpan) {
            this._currentCanvasNameSpan.setTextContent(name ?? "（未保存）");
            this._currentCanvasNameSpan.setStyleCSS({ cursor: name ? 'pointer' : 'default' });
        }
        if (this._overwriteSaveButton) {
            this._overwriteSaveButton.setStyleCSS({ display: name ? 'block' : 'none' });
        }
    }

    private startRenaming(): void {
        if (!this._currentCanvasName) return;
        
        this._isRenaming = true;
        this._currentCanvasNameInput.setValue(this._currentCanvasName);
        this._currentCanvasNameSpan.setStyleCSS({ display: 'none' });
        this._currentCanvasNameInput.setStyleCSS({ display: 'block' });
        
        // フォーカスして全選択
        setTimeout(() => {
            this._currentCanvasNameInput.focus().selectAll();
        }, 0);
    }

    private handleRenameKeydown(e: KeyboardEvent): void {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.confirmRenaming();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.cancelRenaming();
        }
    }

    private async confirmRenaming(): Promise<void> {
        if (!this._isRenaming) return;
        
        const newName = this._currentCanvasNameInput.getValue().trim();
        if (!newName) {
            this.cancelRenaming();
            return;
        }
        
        if (newName === this._currentCanvasName) {
            this.cancelRenaming();
            return;
        }
        
        // 同名チェック
        const existingItem = this._list.findItemByName(newName);
        if (existingItem && !this._trash.has(existingItem.id.id)) {
            Toast.warning("同名のキャンバスが既に存在します");
            this.cancelRenaming();
            return;
        }
        
        try {
            // 旧名前のデータをロード → 新名前で保存 → 旧名前を削除
            const oldName = this._currentCanvasName;
            if (!oldName) return;
            
            // リネーム処理（実際には新規保存+削除）
            await this._events.onSave(newName, this._currentMode);
            
            // 旧データを削除リストに追加
            const oldItem = this._list.findItemByName(oldName);
            if (oldItem) {
                this._trash.moveToTrash(oldItem, this._currentMode);
            }
            
            this.updateCurrentCanvasName(newName);
            await this.refreshList();
            Toast.success(`"${oldName}"を"${newName}"にリネームしました`);
        } catch (error) {
            console.error("リネームエラー:", error);
            Toast.error("リネームに失敗しました");
        } finally {
            this._isRenaming = false;
            this._currentCanvasNameInput.setStyleCSS({ display: 'none' });
            this._currentCanvasNameSpan.setStyleCSS({ display: 'block' });
        }
    }

    private cancelRenaming(): void {
        this._isRenaming = false;
        this._currentCanvasNameInput.setStyleCSS({ display: 'none' });
        this._currentCanvasNameSpan.setStyleCSS({ display: 'block' });
    }

    public async importLocalRepository(data: 描画キャンバスデータ): Promise<void> {
        try {
            Toast.success(`${data.metadata.name}をローカルに保存しました`);

            // セーブパネルを開き、保存した名前をセット
            this.switchMode("local");
            await this.開く();
            
            // リストを更新して保存したデータを表示
            await this.refreshList();
            
        } catch (error) {
            console.error("ローカル保存エラー:", error);
            Toast.error("ローカル保存に失敗しました");
        }
    }

    // ====== ゴミ箱UI ======

    private toggleTrashView(): void {
        const isShowing = this._list.toggleTrashView();
        if (this._trashToggleBtn) {
            if (isShowing) {
                this._trashToggleBtn.setTextContent("← 戻る");
                this._trashToggleBtn.setStyleCSS({ backgroundImage: 'none' });
            } else {
                this._trashToggleBtn.setTextContent("");
                this._trashToggleBtn.setStyleCSS({ backgroundImage: `url(${ゴミ箱Icon})` });
            }
        }
    }

    private updateTrashButton(): void {
        if (!this._trashToggleBtn) return;
        const count = this._trash.size;
        
        if (count > 0) {
            this._trashToggleBtn.setStyleCSS({ display: 'flex' });
            if (this._trashBadgeSpan) {
                this._trashBadgeSpan.setTextContent(String(count));
            }
        } else {
            this._trashToggleBtn.setStyleCSS({ display: 'none' });
        }
    }
}

