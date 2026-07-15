import { button, div, span, ButtonC, DivC, HtmlComponentBase, SpanC } from "SengenUI/index";
import ゴミ箱Icon from "../../../SVGImg/ゴミ箱.svg?url";
import { SaveMode } from "./セーブパネル型定義";
import {
  actionButtonGroup, inputGroup, inputLabel, modeButton, modeButtonActive, modeSelector,
  secondaryButton, trashBadge, trashToggleButton,
} from "./style.css";

export const モード欄 = (
  serverAvailable: boolean, switchMode: (mode: SaveMode) => void,
  setLocal: (button: ButtonC) => void, setServer: (button: ButtonC) => void,
): DivC => div({ class: inputGroup }).childs([
  span({ text: "保存先", class: inputLabel }),
  div({ class: modeSelector })
    .child(button({ text: "ローカル", class: [modeButton, modeButtonActive] })
      .tap(setLocal).addTypedEventListener("click", () => switchMode("local")))
    .childIf({ If: serverAvailable, True: () => button({ text: "サーバー", class: modeButton })
      .tap(setServer).addTypedEventListener("click", () => switchMode("server")) }),
]);

export const リスト欄 = (list: HtmlComponentBase): DivC => div({ class: inputGroup }).childs([
  span({ text: "保存データ一覧", class: inputLabel }), list,
]);

export const 読込欄 = (load: () => void, setButton: (button: ButtonC) => void): DivC =>
  div({ class: actionButtonGroup }).child(
    button({ text: "読込", class: secondaryButton }).tap(setButton)
      .addTypedEventListener("click", load),
  );

export const ゴミ箱欄 = (
  toggle: () => void, setButton: (button: ButtonC) => void, setBadge: (span: SpanC) => void,
): HtmlComponentBase => button({ text: "", class: trashToggleButton }).setStyleCSS({
  display: "none", backgroundImage: `url(${ゴミ箱Icon})`, backgroundSize: "contain",
  backgroundRepeat: "no-repeat", backgroundPosition: "center", width: "48px", height: "48px",
}).tap(setButton).addTypedEventListener("click", toggle)
  .child(span({ text: "0", class: trashBadge }).tap(setBadge));
