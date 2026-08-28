import { Toast } from "OneONetUIComponents/index";
import { セーブパネル共有状態 } from "./セーブパネル共有状態";

export class セーブパネル改名処理 {
  private renaming = false;
  constructor(private state: セーブパネル共有状態) {}
  public start(): void {
    if (!this.state.currentName) return;
    this.renaming = true;
    this.state.currentNameInput.setValue(this.state.currentName);
    this.state.currentNameSpan.setStyleCSS({ display: "none" });
    this.state.currentNameInput.setStyleCSS({ display: "block" });
    setTimeout(() => this.state.currentNameInput.focus().selectAll(), 0);
  }
  public keydown(event: KeyboardEvent): void {
    if (event.key === "Enter") { event.preventDefault(); this.confirm(); }
    else if (event.key === "Escape") { event.preventDefault(); this.cancel(); }
  }
  public async confirm(): Promise<void> {
    if (!this.renaming) return;
    const newName = this.state.currentNameInput.getValue().trim();
    if (!newName || newName === this.state.currentName) { this.cancel(); return; }
    const existing = this.state.list.findItemByName(newName);
    if (existing && !this.state.trash.has(existing.id.id)) {
      Toast.warning("同名のキャンバスが既に存在します");
      this.cancel();
      return;
    }
    try {
      const oldName = this.state.currentName;
      if (!oldName) return;
      await this.state.events.onSave(newName, this.state.mode);
      const oldItem = this.state.list.findItemByName(oldName);
      if (oldItem) this.state.trash.moveToTrash(oldItem, this.state.mode);
      this.state.updateName(newName);
      await this.state.refreshList();
      Toast.success(`"${oldName}"を"${newName}"にリネームしました`);
    } catch (error) {
      console.error("リネームエラー:", error);
      Toast.error("リネームに失敗しました");
    } finally { this.finish(); }
  }
  public cancel(): void { this.finish(); }
  private finish(): void {
    this.renaming = false;
    this.state.currentNameInput.setStyleCSS({ display: "none" });
    this.state.currentNameSpan.setStyleCSS({ display: "block" });
  }
}
