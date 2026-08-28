import { div, DivC, LV2HtmlComponentBase, MousePosition } from "SengenUI/index";
import { Action, AsyncAction } from "TypeScriptBenriKakuchou/アーキテクチャBase";
import { 多段格子メニューコンテナ } from "../style.css";
import { Iコンテキストメニュー } from "../円状コンテキストメニュー/コンテキストメニュー型";
import { IGridMenuItemStyle } from "./GridCell型";
import { 中央セルを構築する, 第1層を構築する } from "./多段格子第1層構築";
import { 第2層を構築する } from "./多段格子第2層構築";
import { 多段格子階層制御 } from "./多段格子階層制御";
import { 多段格子メニューオプション, 正規化済み多段格子メニューオプション } from "./多段格子メニュー型";

export type {
  格子メニュー配置位置, 格子メニュー1層オプション, 格子メニュー2層共通オプション,
  格子メニュー2層通常オプション, 格子メニュー2層トグルオプション,
  格子メニュー2層オプション, 多段格子メニューオプション,
} from "./多段格子メニュー型";

export class 多段格子コンテキストメニュー extends LV2HtmlComponentBase implements Iコンテキストメニュー {
  protected _componentRoot: DivC;
  private visible = false;
  private readonly options: 正規化済み多段格子メニューオプション;
  private readonly hierarchy = new 多段格子階層制御();
  public 他のコンテキストメニューを全て非表示にする?: AsyncAction;
  public onDestroy?: Action;

  constructor(options: 多段格子メニューオプション) {
    super();
    this.options = {
      ...options, mode: options.mode ?? "clickable", opacity: options.opacity ?? 0.85,
      showCenterButton: options.showCenterButton ?? false,
    };
    this._componentRoot = this.buildRoot();
  }
  protected _ルートを構築する(): DivC { return this._componentRoot; }
  private buildRoot(): DivC {
    const root = div({ class: 多段格子メニューコンテナ }).setStyleCSS({
      display: "none", position: "absolute", gridTemplateColumns: "repeat(7, 64px)",
      gridTemplateRows: "repeat(7, 64px)", gap: "6px", zIndex: "300", pointerEvents: "none",
      transform: "translate(-242px, -242px)", opacity: "0", transition: "opacity 0.2s ease-out",
    });
    第2層を構築する(root, this.options, this.hierarchy, () => this.非表示());
    第1層を構築する(root, this.options, this.hierarchy, () => this.非表示());
    中央セルを構築する(root, this.options, () => this.非表示());
    return root;
  }
  public selectItem(id: string, selected: boolean): void { this.hierarchy.select(id, selected); }
  public updateItem(id: string, style: IGridMenuItemStyle): void { this.hierarchy.update(id, style); }
  public async 表示(pos: MousePosition): Promise<this> {
    if (this.他のコンテキストメニューを全て非表示にする) {
      await this.他のコンテキストメニューを全て非表示にする();
    }
    this.visible = true;
    this.hierarchy.reset();
    if (this.options.mode === "clickable") this.hierarchy.hideAll();
    this._componentRoot.setStyleCSS({ display: "grid", left: `${pos.x}px`, top: `${pos.y}px` });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this._componentRoot.setStyleCSS({ opacity: "1" });
    }));
    return this;
  }
  public async 非表示(閉じ時間 = 200): Promise<this> {
    if (!this.visible) return this;
    this.visible = false;
    this._componentRoot.setStyleCSS({ opacity: "0" });
    await new Promise<void>(resolve => setTimeout(() => {
      if (!this.visible) this._componentRoot.setStyleCSS({ display: "none" });
      resolve();
    }, 閉じ時間));
    return this;
  }
  public async 表示トグル(pos: MousePosition): Promise<this> {
    return this.visible ? this.非表示() : this.表示(pos);
  }
  public get isVisible(): boolean { return this.visible; }
  public delete(): void { super.delete(); this.onDestroy?.(); }
}
