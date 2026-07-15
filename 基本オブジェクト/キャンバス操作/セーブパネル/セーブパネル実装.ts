import { Toast } from "OneONetUIComponents/index";
import { DivC } from "SengenUI/index";
import { 描画キャンバスデータ } from "../../描画キャンバス/データクラス";
import { グローバルイベントを購読する } from "../../グローバルイベント購読";
import { セーブパネル外枠 } from "./セーブパネル外枠UI";
import { セーブパネル改名処理 } from "./セーブパネル改名処理";
import { セーブパネル共有状態 } from "./セーブパネル共有状態";
import { セーブパネルゴミ箱UI制御 } from "./セーブパネルゴミ箱UI制御";
import { セーブパネル保存処理 } from "./セーブパネル保存処理";
import { I保存欄イベント, I保存欄参照, 新規保存欄, 現在名欄 } from "./セーブパネル保存欄UI";
import { セーブパネル表示制御 } from "./セーブパネル表示制御";
import { ゴミ箱欄, モード欄, リスト欄, 読込欄 } from "./セーブパネル操作欄UI";
import { ISavePanelEvents } from "./セーブパネル型定義";

export class セーブパネル実装 {
  public readonly root: DivC;
  private readonly state: セーブパネル共有状態;
  private readonly visibility: セーブパネル表示制御;
  private readonly save: セーブパネル保存処理;
  private readonly rename: セーブパネル改名処理;
  private readonly trashUi: セーブパネルゴミ箱UI制御;

  constructor(events: ISavePanelEvents) {
    this.state = new セーブパネル共有状態(events);
    this.visibility = new セーブパネル表示制御(this.state);
    this.save = new セーブパネル保存処理(this.state, () => this.visibility.close());
    this.rename = new セーブパネル改名処理(this.state);
    this.trashUi = new セーブパネルゴミ箱UI制御(this.state);
    this.state.onTrashUpdate = () => this.trashUi.update();
    this.root = this.buildRoot();
    this.visibility.root = this.root;
    this.registerSaveShortcut();
  }
  public get isVisible(): boolean { return this.visibility.isVisible; }
  public async open(): Promise<void> { await this.visibility.open(); }
  public async close(): Promise<void> { await this.visibility.close(); }
  public async toggle(): Promise<void> { await this.visibility.toggle(); }
  public async importLocal(data: 描画キャンバスデータ): Promise<void> {
    await this.save.importLocal(data, () => this.visibility.open());
  }

  private buildRoot(): DivC {
    const refs: I保存欄参照 = {
      currentNameSpan: value => this.state.currentNameSpan = value,
      currentNameInput: value => this.state.currentNameInput = value,
      overwriteButton: value => this.state.overwriteButton = value,
      newNameInput: value => this.state.newNameInput = value,
      newSaveButton: value => this.state.newSaveButton = value,
    };
    const actions: I保存欄イベント = {
      startRenaming: () => this.rename.start(),
      renameKeydown: event => this.rename.keydown(event),
      confirmRenaming: () => this.rename.confirm(),
      overwriteSave: () => this.save.overwrite(),
      newSave: () => this.save.saveNew(),
    };
    return セーブパネル外枠([
      モード欄(this.state.events.onIsServerModeAvailable(), mode => this.state.switchMode(mode),
        value => this.state.localModeButton = value, value => this.state.serverModeButton = value),
      現在名欄(this.state.currentName, refs, actions), 新規保存欄(refs, actions),
      リスト欄(this.state.list),
      読込欄(() => this.save.load(), value => this.state.loadButton = value),
      ゴミ箱欄(() => this.trashUi.toggle(), value => this.state.trashButton = value,
        value => this.state.trashBadge = value),
    ], () => this.visibility.close(), value => this.visibility.backdrop = value,
      value => this.visibility.panel = value);
  }
  private registerSaveShortcut(): void {
    グローバルイベントを購読する(window, "keydown", event => {
      if (event.key !== "s" || !event.ctrlKey) return;
      event.preventDefault();
      if (this.state.currentName === null) this.visibility.open();
      else {
        this.state.events.onSave(this.state.currentName, this.state.mode);
        Toast.success(`${this.state.currentName}を上書き保存しました`, { type: "success" });
      }
    });
  }
}
