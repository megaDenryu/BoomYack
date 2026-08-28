import { TextAreaC } from "SengenUI/index";

export function Tabインデント(ta: TextAreaC, e: KeyboardEvent): void {
    e.preventDefault();
    const start = ta.getSelectionStart();
    const end = ta.getSelectionEnd();
    const value = ta.getValue();
    if (start === end) {
        const indent = "    ";
        ta.値と選択範囲を書き換えて通知する(value.slice(0, start) + indent + value.slice(end), start + indent.length);
        return;
    }
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);
    const changed = e.shiftKey ? selected.replace(/^( {1,4}|\t)/gm, "") : selected.replace(/^/gm, "    ");
    ta.値と選択範囲を書き換えて通知する(before + changed + after, start, start + changed.length);
}

export function Enterインデント(ta: TextAreaC, e: KeyboardEvent): void {
    if (e.isComposing) return;
    const start = ta.getSelectionStart();
    const value = ta.getValue();
    const line = value.slice(value.lastIndexOf("\n", start - 1) + 1, start);
    const indent = line.match(/^(\s*)/)?.[1] ?? "";
    if (indent.length === 0) return;
    e.preventDefault();
    const changed = value.slice(0, start) + "\n" + indent + value.slice(ta.getSelectionEnd());
    ta.値と選択範囲を書き換えて通知する(changed, start + 1 + indent.length);
}
