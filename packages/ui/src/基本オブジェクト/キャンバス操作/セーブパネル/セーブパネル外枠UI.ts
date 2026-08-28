import { button, div, span, DivC, HtmlComponentBase } from "SengenUI/index";
import {
  closeButton, overlayBackdrop, panelContent, panelHeader, panelTitle,
  savePanelContainer, savePanelWrapper,
} from "./style.css";

export const セーブパネル外枠 = (
  contents: HtmlComponentBase[],
  close: () => void,
  setBackdrop: (value: DivC) => void,
  setPanel: (value: DivC) => void,
): DivC => div({ class: savePanelWrapper }).setStyleCSS({ display: "none" }).childs([
  div({ class: overlayBackdrop }).tap(setBackdrop).addDivEventListener("click", close),
  div({ class: savePanelContainer }).tap(setPanel).childs([
    div({ class: panelHeader }).childs([
      span({ text: "セーブ/ロード", class: panelTitle }),
      button({ text: "×", class: closeButton }).addTypedEventListener("click", close),
    ]),
    div({ class: panelContent }).setStyleCSS({ position: "relative" }).childs(contents),
  ]),
]);
