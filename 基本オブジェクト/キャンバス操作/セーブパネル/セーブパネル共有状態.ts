import { Toast } from "OneONetUIComponents/index";
import { ButtonC, InputC, SpanC } from "SengenUI/index";
import { キャンバスJSON出力サービス } from "../../ファイル入出力/キャンバスJSON出力サービス";
import { ISavePanelEvents, SaveMode } from "./セーブパネル型定義";
import { セーブパネルリスト } from "./セーブパネルリスト";
import { セーブパネル仮ゴミ箱 } from "./セーブパネル仮ゴミ箱";
import { modeButtonActive } from "./style.css";

export class セーブパネル共有状態 {
  public mode: SaveMode = "local";
  public currentName: string | null = null;
  public localModeButton!: ButtonC;
  public serverModeButton!: ButtonC;
  public currentNameSpan!: SpanC;
  public currentNameInput!: InputC;
  public overwriteButton!: ButtonC;
  public newNameInput!: InputC;
  public newSaveButton!: ButtonC;
  public loadButton!: ButtonC;
  public trashButton: ButtonC | null = null;
  public trashBadge: SpanC | null = null;
  public readonly trash: セーブパネル仮ゴミ箱;
  public readonly list: セーブパネルリスト;
  public onTrashUpdate = (): void => {};
  private readonly json = キャンバスJSON出力サービス.create();

  constructor(public readonly events: ISavePanelEvents) {
    this.trash = new セーブパネル仮ゴミ箱({
      onDelete: (id, mode) => events.onDelete(id, mode),
      onUpdate: () => { this.onTrashUpdate(); this.list.render(); },
    });
    this.list = new セーブパネルリスト(this.trash, {
      onSelect: () => {},
      onMoveToTrash: item => this.trash.moveToTrash(item, this.mode),
      onRestoreFromTrash: id => this.trash.restore(id),
      onJsonOutput: item => this.outputSavedJson(item.id.id),
    });
  }

  public async refreshList(): Promise<void> {
    try { this.list.setList(await this.events.onRefreshList(this.mode), this.mode); }
    catch (error) {
      console.error("リスト取得エラー:", error);
      this.list.setList([], this.mode);
    }
  }
  public switchMode(mode: SaveMode): void {
    this.mode = mode;
    this.localModeButton.removeClass(modeButtonActive);
    this.serverModeButton.removeClass(modeButtonActive);
    (mode === "local" ? this.localModeButton : this.serverModeButton).addClass(modeButtonActive);
    this.refreshList();
  }
  public updateName(name: string | null): void {
    this.currentName = name;
    this.currentNameSpan?.setTextContent(name ?? "（未保存）");
    this.currentNameSpan?.setStyleCSS({ cursor: name ? "pointer" : "default" });
    this.overwriteButton?.setStyleCSS({ display: name ? "block" : "none" });
  }
  private async outputSavedJson(id: string): Promise<void> {
    try {
      const data = await this.events.onGetCanvasDataById(id, this.mode);
      if (!data) { Toast.error("キャンバスデータが見つかりませんでした"); return; }
      this.json.出力(data);
      Toast.success("JSONファイルをダウンロードしました");
    } catch (error) {
      console.error("JSON出力エラー:", error);
      Toast.error("JSON出力に失敗しました");
    }
  }
}
