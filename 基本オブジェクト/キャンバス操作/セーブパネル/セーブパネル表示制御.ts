import { DivC } from "SengenUI/index";
import { セーブパネル共有状態 } from "./セーブパネル共有状態";
import { overlayBackdrop, overlayBackdropVisible, panelFadeIn, panelFadeOut } from "./style.css";

export class セーブパネル表示制御 {
  private visible = false;
  public root!: DivC;
  public backdrop!: DivC;
  public panel!: DivC;

  constructor(private state: セーブパネル共有状態) {}
  public get isVisible(): boolean { return this.visible; }
  public async open(): Promise<void> {
    this.visible = true;
    this.root.setStyleCSS({ display: "block" });
    this.backdrop.addClass([overlayBackdrop, overlayBackdropVisible]);
    this.panel.setStyleCSS({ animation: `${panelFadeIn} 0.2s ease-out forwards` });
    await this.state.refreshList();
  }
  public async close(): Promise<void> {
    this.visible = false;
    this.backdrop.addClass(overlayBackdrop);
    this.panel.setStyleCSS({ animation: `${panelFadeOut} 0.2s ease-in forwards` });
    this.state.list.resetTrashView();
    await new Promise<void>(resolve => setTimeout(() => {
      if (!this.visible) this.root.setStyleCSS({ display: "none" });
      resolve();
    }, 200));
  }
  public async toggle(): Promise<void> { return this.visible ? this.close() : this.open(); }
}
