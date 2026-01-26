import { Toast } from "OneONetUIComponents/index";
import { ButtonC, DivC, HtmlComponentBase, InputC, LV2HtmlComponentBase, SpanC } from "SengenUI/index";
import {
    savePanelContainer,
    panelHeader,
    panelTitle,
    closeButton,
    panelContent,
    inputGroup,
    inputLabel,
    textInput,
    modeSelector,
    modeButton,
    modeButtonActive,
    actionButtonGroup,
    primaryButton,
    secondaryButton,
    tabContainer,
    tab,
    tabActive,
    overlayBackdrop,
    overlayBackdropVisible,
    panelFadeIn,
    panelFadeOut,
    trashToggleButton,
    trashBadge
} from "./style.css";

import { SaveMode, ISavePanelEvents } from "./セーブパネル型定義";
import { セーブパネル仮ゴミ箱 } from "./セーブパネル仮ゴミ箱";
import { セーブパネルリスト } from "BoomYack/基本オブジェクト/キャンバス操作/セーブパネル/セーブパネルリスト";
import { 描画キャンバスデータ } from "BoomYack/基本オブジェクト/描画キャンバス/データクラス";
import ゴミ箱Icon from "../../../SVGImg/ゴミ箱.svg?url";

import { キャンバスJSON出力サービス } from "BoomYack/基本オブジェクト/ファイル入出力/キャンバスJSON出力サービス";

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
        this._componentRoot = this.createComponentRoot();
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

    protected createComponentRoot(): DivC {
        window.addEventListener('keydown', (e) => {
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
        return new DivC({ class: "save-panel-wrapper" })
            .setStyleCSS({ display: 'none' })
            .childs([
                new DivC({ class: overlayBackdrop })
                    .bind(self => this._backdrop = self)
                    .addDivEventListener('click', () => this.閉じる()),
                new DivC({ class: savePanelContainer })
                    .bind(self => this._panel = self)
                    .childs([
                        this.Header(),
                        this.Content()
                    ])
            ]);
    }

    private Header(): DivC {
        return new DivC({ class: panelHeader })
            .childs([
                new SpanC({ text: "セーブ/ロード", class: panelTitle }),
                new ButtonC({ text: "×", class: closeButton })
                    .addTypedEventListener('click', () => this.閉じる())
            ]);
    }

    private Content(): DivC {
        return new DivC({ class: panelContent })
            .setStyleCSS({ position: 'relative' })
            .childs([
                this.モード選択(),
                this.現在のキャンバス名と上書き保存(),
                this.新規保存入力(),
                this.セーブリスト(),
                this.読み込みボタン(),
                this.仮ゴミ箱ボタン()
            ]);
    }

    private モード選択(): DivC {
        return new DivC({ class: inputGroup })
            .childs([
                new SpanC({ text: "保存先", class: inputLabel }),
                new DivC({ class: modeSelector })
                    .childs([
                        new ButtonC({ text: "ローカル", class: [modeButton, modeButtonActive] })
                            .bind(self => this._localModeBtn = self)
                            .addTypedEventListener('click', () => this.switchMode("local")),
                        new ButtonC({ text: "サーバー", class: modeButton })
                            .bind(self => this._serverModeBtn = self)
                            .addTypedEventListener('click', () => this.switchMode("server"))
                    ])
            ]);
    }

    private 現在のキャンバス名と上書き保存(): DivC {
        return new DivC({ class: inputGroup })
            .childs([
                new SpanC({ text: "現在のキャンバス名", class: inputLabel }),
                new DivC().setStyleCSS({ display: 'flex', gap: '8px', alignItems: 'center' })
                    .childs([
                        new DivC().setStyleCSS({ flex: '1', position: 'relative' })
                            .childs([
                                new SpanC({ text: this._currentCanvasName ?? "（未保存）" })
                                    .bind(self => this._currentCanvasNameSpan = self)
                                    .setStyleCSS({ 
                                        display: 'block',
                                        padding: '8px', 
                                        backgroundColor: '#f5f5f5', 
                                        borderRadius: '4px', 
                                        color: '#333', 
                                        fontSize: '14px',
                                        cursor: this._currentCanvasName ? 'pointer' : 'default',
                                        userSelect: 'none'
                                    })
                                    .addTypedEventListener('dblclick', () => this.startRenaming()),
                                new InputC({ type: 'text', class: textInput })
                                    .bind(self => this._currentCanvasNameInput = self)
                                    .setStyleCSS({ 
                                        display: 'none',
                                        width: '100%',
                                        padding: '8px',
                                        fontSize: '14px'
                                    })
                                    .addTypedEventListener('keydown', (e) => this.handleRenameKeydown(e))
                                    .addTypedEventListener('blur', () => this.confirmRenaming())
                            ]),
                        new ButtonC({ text: "上書き保存", class: primaryButton })
                            .bind(self => this._overwriteSaveButton = self)
                            .setStyleCSS({ display: this._currentCanvasName ? 'block' : 'none' })
                            .addTypedEventListener('click', () => this.handleOverwriteSave())
                    ])
            ]);
    }

    private 新規保存入力(): DivC {
        return new DivC({ class: inputGroup })
            .childs([
                new SpanC({ text: "新規保存", class: inputLabel }),
                new DivC().setStyleCSS({ display: 'flex', gap: '8px' })
                    .childs([
                        new InputC({ type: 'text', placeholder: 'キャンバスの名前を入力...', class: textInput })
                            .bind(self => this._newSaveNameInput = self)
                            .setStyleCSS({ flex: '1' }),
                        new ButtonC({ text: "新規保存", class: primaryButton })
                            .bind(self => this._newSaveButton = self)
                            .addTypedEventListener('click', () => this.handleNewSave())
                    ])
            ]);
    }

    private セーブリスト(): HtmlComponentBase {
        return new DivC({ class: inputGroup })
            .childs([
                new SpanC({ text: "保存データ一覧", class: inputLabel }),
                this._list
            ]);
    }

    private 読み込みボタン(): HtmlComponentBase {
        return new DivC({ class: actionButtonGroup })
            .childs([
                new ButtonC({ text: "読込", class: secondaryButton })
                    .bind(self => this._loadButton = self)
                    .addTypedEventListener('click', () => this.handleLoad())
            ]);
    }

    private 仮ゴミ箱ボタン(): HtmlComponentBase {
        return new ButtonC({ text: "", class: trashToggleButton })
            .setStyleCSS({ 
                display: 'none',
                backgroundImage: `url(${ゴミ箱Icon})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                width: '48px',
                height: '48px'
            })
            .bind(self => this._trashToggleBtn = self)
            .addTypedEventListener('click', () => this.toggleTrashView())
            .child(
                new SpanC({ text: "0", class: trashBadge })
                    .bind(self => this._trashBadgeSpan = self)
            );
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

