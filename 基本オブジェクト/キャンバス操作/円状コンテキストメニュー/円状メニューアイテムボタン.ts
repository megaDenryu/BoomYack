import { button, ButtonC, LV2HtmlComponentBase } from "SengenUI/index";
import { 円状メニューアイテム } from "../style.css";
import { 円状メニューアイテムオプション } from "./コンテキストメニュー型";

export class 円状メニューアイテムボタン extends LV2HtmlComponentBase {
  protected _componentRoot: ButtonC;
  constructor(private option: 円状メニューアイテムオプション) {
    super();
    this._componentRoot = this._ルートを構築する();
  }
  protected _ルートを構築する(): ButtonC {
    const result = button({ text: this.option.label ?? "", class: 円状メニューアイテム })
      .addTypedEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        this.option.onClick(event);
      });
    if (this.option.iconUrl) result.setStyleCSS({
      backgroundImage: `url("${this.option.iconUrl}")`, backgroundSize: "contain",
      backgroundRepeat: "no-repeat", backgroundPosition: "center", fontSize: "0",
    });
    if (this.option.backgroundColor || this.option.borderColor) result.setStyleCSS({
      ...(this.option.backgroundColor ? { backgroundColor: this.option.backgroundColor } : {}),
      ...(this.option.borderColor ? { borderColor: this.option.borderColor } : {}),
    });
    return result;
  }
}
