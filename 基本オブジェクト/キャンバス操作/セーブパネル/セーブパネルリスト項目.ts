import { button, div, span, DivC } from "SengenUI/index";
import { キャンバスメタデータ } from "../../描画キャンバス/データクラス";
import ゴミ箱Icon from "../../../SVGImg/ゴミ箱.svg?url";
import {
  deleteItemButton, emptyMessage, jsonFileOutputButton, restoreButton,
  saveItemDate, saveItemName, saveListItem, saveListItemSelected, trashedItem,
} from "./style.css";

const itemDetails = (item: キャンバスメタデータ): DivC => div().childs([
  span({ text: item.name, class: saveItemName }),
  span({ text: new Date(item.updatedAt).toLocaleString(), class: saveItemDate })
    .setStyleCSS({ display: "block" }),
]);

export const 空メッセージ = (text: string): DivC =>
  div({ class: emptyMessage }).child(span({ text }));

export const 保存項目 = (
  item: キャンバスメタデータ,
  selected: boolean,
  onSelect: () => void,
  onJsonOutput: () => void,
  onMoveToTrash: () => void,
): DivC => div({ class: selected ? [saveListItem, saveListItemSelected] : [saveListItem] })
  .addDivEventListener("click", onSelect)
  .childs([
    itemDetails(item),
    button({ text: "json", class: jsonFileOutputButton }).addTypedEventListener("click", event => {
      event.stopPropagation();
      onJsonOutput();
    }),
    button({ text: "", class: deleteItemButton })
      .setStyleCSS({
        backgroundImage: `url(${ゴミ箱Icon})`, backgroundSize: "contain",
        backgroundRepeat: "no-repeat", backgroundPosition: "center", width: "32px", height: "32px",
      })
      .addTypedEventListener("click", event => {
        event.stopPropagation();
        onMoveToTrash();
      }),
  ]);

export const ゴミ箱項目 = (item: キャンバスメタデータ, onRestore: () => void): DivC =>
  div({ class: [saveListItem, trashedItem] }).childs([
    itemDetails(item),
    button({ text: "↩", class: restoreButton }).addTypedEventListener("click", event => {
      event.stopPropagation();
      onRestore();
    }),
  ]);
