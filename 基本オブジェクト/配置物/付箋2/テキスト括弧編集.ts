import { TextAreaC } from "SengenUI/index";

export const 括弧ペア: ReadonlyMap<string, string> = new Map([
    ["(", ")"], ["[", "]"], ["{", "}"], ["「", "」"], ["『", "』"], ["【", "】"], ["\"", "\""], ["'", "'"],
]);
export const 閉じ括弧 = new Set(括弧ペア.values());

export function 開き括弧を入力する(ta: TextAreaC, e: KeyboardEvent): void {
    const close = 括弧ペア.get(e.key);
    if (!close) return;
    const start = ta.getSelectionStart();
    const end = ta.getSelectionEnd();
    const value = ta.getValue();
    if (e.key === close && value[start] === close) {
        e.preventDefault();
        ta.setSelectionRange(start + 1, start + 1);
        return;
    }
    e.preventDefault();
    const selected = value.slice(start, end);
    const changed = value.slice(0, start) + e.key + selected + close + value.slice(end);
    ta.値と選択範囲を書き換えて通知する(changed, start + 1, end === start ? start + 1 : end + 1);
}

export function 閉じ括弧をスキップする(ta: TextAreaC, e: KeyboardEvent): void {
    const start = ta.getSelectionStart();
    if (ta.getValue()[start] !== e.key) return;
    e.preventDefault();
    ta.setSelectionRange(start + 1, start + 1);
}

export function 括弧ペアを削除する(ta: TextAreaC, e: KeyboardEvent): void {
    const start = ta.getSelectionStart();
    if (start !== ta.getSelectionEnd() || start === 0) return;
    const value = ta.getValue();
    if (括弧ペア.get(value[start - 1]) !== value[start]) return;
    e.preventDefault();
    ta.値と選択範囲を書き換えて通知する(value.slice(0, start - 1) + value.slice(start + 1), start - 1);
}
