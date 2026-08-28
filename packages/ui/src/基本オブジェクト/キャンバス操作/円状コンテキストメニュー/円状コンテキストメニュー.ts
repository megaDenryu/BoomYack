import { div, DivC, LV2HtmlComponentBase, MousePosition, Px長さ } from "SengenUI/index";
import { Action, AsyncAction } from "TypeScriptBenriKakuchou/アーキテクチャBase";
import {
  fadeInKeyframes, fadeOutKeyframes, 円状メニューアニメーション時間,
  円状メニューコンテナ, 円状メニュー中央エリア,
} from "../style.css";
import { Iコンテキストメニュー, 円状メニューアイテムオプション } from "./コンテキストメニュー型";
import { 円状メニューアイテムボタン } from "./円状メニューアイテムボタン";

export type { Iコンテキストメニュー, 円状メニューアイテムオプション } from "./コンテキストメニュー型";
export { 円状メニューアイテムボタン } from "./円状メニューアイテムボタン";

export class 円状コンテキストメニュー extends LV2HtmlComponentBase implements Iコンテキストメニュー {
  protected _componentRoot: DivC;
  private visible = false;
  private readonly radius = new Px長さ(80);
  public 他のコンテキストメニューを全て非表示にする?: AsyncAction;
  public onDestroy?: Action;

  constructor(items: 円状メニューアイテムオプション[]) {
    super();
    this._componentRoot = div({ class: 円状メニューコンテナ }).setStyleCSS({ display: "none" })
      .childs([div({ class: 円状メニュー中央エリア }), ...this.createItems(items)]);
  }
  protected _ルートを構築する(): DivC { return this._componentRoot; }
  private *createItems(items: 円状メニューアイテムオプション[]): Iterable<円状メニューアイテムボタン> {
    for (let index = 0; index < items.length; index++) {
      const angle = (index / items.length) * Math.PI * 2 - Math.PI / 2;
      const x = new Px長さ(Math.cos(angle) * this.radius.値);
      const y = new Px長さ(Math.sin(angle) * this.radius.値);
      yield new 円状メニューアイテムボタン(items[index]).setStyleCSS({
        left: `calc(50% + ${x.toCssValue()})`, top: `calc(50% + ${y.toCssValue()})`,
      });
    }
  }
  public async 表示(pos: MousePosition): Promise<this> {
    if (this.他のコンテキストメニューを全て非表示にする === undefined) await this.非表示(10);
    else await this.他のコンテキストメニューを全て非表示にする();
    this.visible = true;
    this._componentRoot.setStyleCSS({
      display: "block", left: `${pos.x}px`, top: `${pos.y}px`, opacity: "1",
      animation: `${fadeInKeyframes} ${円状メニューアニメーション時間}ms ease-out forwards`,
    });
    return this;
  }
  public async 非表示(閉じ時間 = 円状メニューアニメーション時間): Promise<this> {
    if (!this.visible) return this;
    this.visible = false;
    this._componentRoot.setStyleCSS({ animation: `${fadeOutKeyframes} ${閉じ時間}ms ease-in forwards` });
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
  public updateItem(): void {}
  public delete(): void { super.delete(); this.onDestroy?.(); }
}
