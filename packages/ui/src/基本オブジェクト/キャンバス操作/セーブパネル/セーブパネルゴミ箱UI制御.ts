import ゴミ箱Icon from "../../../SVGImg/ゴミ箱.svg?url";
import { セーブパネル共有状態 } from "./セーブパネル共有状態";

export class セーブパネルゴミ箱UI制御 {
  constructor(private state: セーブパネル共有状態) {}
  public toggle(): void {
    const showing = this.state.list.toggleTrashView();
    if (!this.state.trashButton) return;
    this.state.trashButton.setTextContent(showing ? "← 戻る" : "");
    this.state.trashButton.setStyleCSS({
      backgroundImage: showing ? "none" : `url(${ゴミ箱Icon})`,
    });
  }
  public update(): void {
    if (!this.state.trashButton) return;
    const count = this.state.trash.size;
    this.state.trashButton.setStyleCSS({ display: count > 0 ? "flex" : "none" });
    if (count > 0) this.state.trashBadge?.setTextContent(String(count));
  }
}
