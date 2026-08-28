import { Toast } from "OneONetUIComponents/index";
import { 描画キャンバスデータ } from "../../描画キャンバス/データクラス";
import { セーブパネル共有状態 } from "./セーブパネル共有状態";

export class セーブパネル保存処理 {
  constructor(private state: セーブパネル共有状態, private close: () => Promise<void>) {}
  public async overwrite(): Promise<void> {
    const name = this.state.currentName;
    if (!name) { Toast.warning("上書き保存できるキャンバスがありません"); return; }
    try {
      await this.state.events.onSave(name, this.state.mode);
      await this.state.refreshList();
      Toast.success(`${name}を上書き保存しました`);
    } catch (error) {
      console.error("上書き保存エラー:", error);
      Toast.error("上書き保存に失敗しました");
    }
  }
  public async saveNew(): Promise<void> {
    const name = this.state.newNameInput.getValue().trim();
    if (!name) { Toast.warning("保存名を入力してください"); return; }
    const existing = this.state.list.findItemByName(name);
    if (existing && !this.state.trash.has(existing.id.id)) {
      Toast.warning("同名のキャンバスが既に存在します"); return;
    }
    try {
      await this.state.events.onSave(name, this.state.mode);
      this.state.list.clearSelection();
      await this.state.refreshList();
      Toast.success("保存しました");
      this.state.updateName(name);
      this.state.newNameInput.setValue("");
    } catch (error) {
      console.error("新規保存エラー:", error);
      Toast.error("新規保存に失敗しました");
    }
  }
  public async load(): Promise<void> {
    const id = this.state.list.selectedItemId;
    if (!id) { Toast.warning("読み込むデータを選択してください"); return; }
    if (this.state.trash.has(id)) {
      Toast.warning("削除予定のデータです。復元してから読み込んでください"); return;
    }
    try {
      await this.state.events.onLoad(id, this.state.mode);
      this.state.updateName(this.state.list.getCanvasNameById(id));
      await this.close();
      Toast.success("読み込みました");
    } catch (error) {
      console.error("読み込みエラー:", error);
      Toast.error("読み込みに失敗しました");
    }
  }
  public async importLocal(data: 描画キャンバスデータ, open: () => Promise<void>): Promise<void> {
    try {
      Toast.success(`${data.metadata.name}をローカルに保存しました`);
      this.state.switchMode("local");
      await open();
      await this.state.refreshList();
    } catch (error) {
      console.error("ローカル保存エラー:", error);
      Toast.error("ローカル保存に失敗しました");
    }
  }
}
