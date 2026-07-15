import { TextAreaC } from "SengenUI/index";
import { Enterインデント, Tabインデント } from "./テキストインデント";
import { 括弧ペア, 括弧ペアを削除する, 閉じ括弧, 閉じ括弧をスキップする, 開き括弧を入力する } from "./テキスト括弧編集";

/** 付箋入力にインデントと括弧ペア編集を追加する。 */
export function テキストフォーマット適用(textArea: TextAreaC): () => void {
    const handler = (e: KeyboardEvent): void => {
        if (e.key === "Tab") Tabインデント(textArea, e);
        else if (e.key === "Enter") Enterインデント(textArea, e);
        else if (括弧ペア.has(e.key)) 開き括弧を入力する(textArea, e);
        else if (閉じ括弧.has(e.key)) 閉じ括弧をスキップする(textArea, e);
        else if (e.key === "Backspace") 括弧ペアを削除する(textArea, e);
    };
    textArea.addTypedEventListener("keydown", handler);
    return () => textArea.removeTypedEventListener("keydown", handler);
}
