import { button, div, input, span, ButtonC, DivC, InputC, SpanC } from "SengenUI/index";
import { inputGroup, inputLabel, primaryButton, textInput } from "./style.css";

export interface I保存欄参照 {
  currentNameSpan: (value: SpanC) => void;
  currentNameInput: (value: InputC) => void;
  overwriteButton: (value: ButtonC) => void;
  newNameInput: (value: InputC) => void;
  newSaveButton: (value: ButtonC) => void;
}
export interface I保存欄イベント {
  startRenaming: () => void;
  renameKeydown: (event: KeyboardEvent) => void;
  confirmRenaming: () => void;
  overwriteSave: () => void;
  newSave: () => void;
}

export const 現在名欄 = (
  name: string | null, refs: I保存欄参照, events: I保存欄イベント,
): DivC => div({ class: inputGroup }).childs([
  span({ text: "現在のキャンバス名", class: inputLabel }),
  div().setStyleCSS({ display: "flex", gap: "8px", alignItems: "center" }).childs([
    div().setStyleCSS({ flex: "1", position: "relative" }).childs([
      span({ text: name ?? "（未保存）" }).tap(refs.currentNameSpan).setStyleCSS({
        display: "block", padding: "8px", backgroundColor: "#f5f5f5", borderRadius: "4px",
        color: "#333", fontSize: "14px", cursor: name ? "pointer" : "default", userSelect: "none",
      }).addTypedEventListener("dblclick", events.startRenaming),
      input({ type: "text", class: textInput }).tap(refs.currentNameInput).setStyleCSS({
        display: "none", width: "100%", padding: "8px", fontSize: "14px",
      }).addTypedEventListener("keydown", events.renameKeydown)
        .addTypedEventListener("blur", events.confirmRenaming),
    ]),
    button({ text: "上書き保存", class: primaryButton }).tap(refs.overwriteButton)
      .setStyleCSS({ display: name ? "block" : "none" })
      .addTypedEventListener("click", events.overwriteSave),
  ]),
]);

export const 新規保存欄 = (refs: I保存欄参照, events: I保存欄イベント): DivC =>
  div({ class: inputGroup }).childs([
    span({ text: "新規保存", class: inputLabel }),
    div().setStyleCSS({ display: "flex", gap: "8px" }).childs([
      input({ type: "text", placeholder: "キャンバスの名前を入力...", class: textInput })
        .tap(refs.newNameInput).setStyleCSS({ flex: "1" }),
      button({ text: "新規保存", class: primaryButton }).tap(refs.newSaveButton)
        .addTypedEventListener("click", events.newSave),
    ]),
  ]);
