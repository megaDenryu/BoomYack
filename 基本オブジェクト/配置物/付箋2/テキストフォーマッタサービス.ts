import { TextAreaC } from "SengenUI/index";

/**
 * テキストフォーマッタサービス
 *
 * BoomYack付箋のテキスト入力を補完・整形するサービス。
 * - 括弧ペアリング（自動閉じ括弧挿入）
 * - Tab/Shift+Tabインデント
 * - Enter時の自動インデント継続
 *
 * 提案-011: テキスト入力補完・フォーマッタ
 */

/** 括弧ペアの定義 */
const 括弧ペアマップ: ReadonlyMap<string, string> = new Map([
    ["(", ")"],
    ["[", "]"],
    ["{", "}"],
    ["「", "」"],
    ["『", "』"],
    ["【", "】"],
    ["\"", "\""],
    ["'", "'"],
]);

/** 閉じ括弧セット（閉じ括弧の入力スキップ判定用） */
const 閉じ括弧セット: ReadonlySet<string> = new Set(
    Array.from(括弧ペアマップ.values())
);

/**
 * テキストエリアにフォーマット機能を適用する
 * @param textArea 対象のSengenUI TextAreaC(生DOM要素は扱わない)
 * @returns クリーンアップ関数（イベントリスナーの解除）
 */
export function テキストフォーマット適用(textArea: TextAreaC): () => void {
    const handler = (e: KeyboardEvent): void => {
        if (e.key === "Tab") {
            _handleTab(textArea, e);
        } else if (e.key === "Enter") {
            _handleEnter(textArea, e);
        } else if (括弧ペアマップ.has(e.key)) {
            _handle括弧開き(textArea, e);
        } else if (閉じ括弧セット.has(e.key)) {
            _handle閉じ括弧スキップ(textArea, e);
        } else if (e.key === "Backspace") {
            _handleBackspace括弧削除(textArea, e);
        }
    };

    textArea.addTypedEventListener("keydown", handler);

    // クリーンアップ関数を返す
    return () => {
        textArea.removeTypedEventListener("keydown", handler);
    };
}


// ============================================
// Tab インデント
// ============================================

function _handleTab(ta: TextAreaC, e: KeyboardEvent): void {
    e.preventDefault();
    const selectionStart = ta.getSelectionStart();
    const selectionEnd = ta.getSelectionEnd();
    const value = ta.getValue();

    if (selectionStart === selectionEnd) {
        // 単一カーソル位置: タブ文字（スペース4つ）を挿入
        const indent = "    ";
        const newValue = value.slice(0, selectionStart) + indent + value.slice(selectionEnd);
        ta.値と選択範囲を書き換えて通知する(newValue, selectionStart + indent.length);
    } else {
        // 範囲選択中: 選択行の先頭にインデント追加/削除
        const before = value.slice(0, selectionStart);
        const selected = value.slice(selectionStart, selectionEnd);
        const after = value.slice(selectionEnd);

        if (e.shiftKey) {
            // Shift+Tab: インデント削除
            const deindented = selected.replace(/^( {1,4}|\t)/gm, "");
            ta.値と選択範囲を書き換えて通知する(before + deindented + after, selectionStart, selectionStart + deindented.length);
        } else {
            // Tab: インデント追加
            const indented = selected.replace(/^/gm, "    ");
            ta.値と選択範囲を書き換えて通知する(before + indented + after, selectionStart, selectionStart + indented.length);
        }
    }
}


// ============================================
// Enter 自動インデント
// ============================================

function _handleEnter(ta: TextAreaC, e: KeyboardEvent): void {
    if (e.isComposing) return; // IME変換中は無視

    const selectionStart = ta.getSelectionStart();
    const value = ta.getValue();

    // 現在行のインデントを取得
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const currentLine = value.slice(lineStart, selectionStart);
    const indentMatch = currentLine.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : "";

    if (indent.length === 0) return; // インデントなしなら通常Enter

    e.preventDefault();
    const before = value.slice(0, selectionStart);
    const after = value.slice(ta.getSelectionEnd());

    const newValue = before + "\n" + indent + after;
    ta.値と選択範囲を書き換えて通知する(newValue, selectionStart + 1 + indent.length);
}


// ============================================
// 括弧ペアリング
// ============================================

function _handle括弧開き(ta: TextAreaC, e: KeyboardEvent): void {
    const 閉じ括弧 = 括弧ペアマップ.get(e.key);
    if (!閉じ括弧) return;

    const selectionStart = ta.getSelectionStart();
    const selectionEnd = ta.getSelectionEnd();
    const value = ta.getValue();

    // 同一文字ペア（"" や ''）で既に閉じ括弧の直前にいるならスキップ
    if (e.key === 閉じ括弧 && value[selectionStart] === 閉じ括弧) {
        e.preventDefault();
        ta.setSelectionRange(selectionStart + 1, selectionStart + 1);
        return;
    }

    e.preventDefault();

    if (selectionStart === selectionEnd) {
        // カーソル位置に括弧ペアを挿入、カーソルを括弧の間に配置
        const newValue = value.slice(0, selectionStart) + e.key + 閉じ括弧 + value.slice(selectionEnd);
        ta.値と選択範囲を書き換えて通知する(newValue, selectionStart + 1);
    } else {
        // 選択範囲を括弧で囲む
        const selected = value.slice(selectionStart, selectionEnd);
        const newValue = value.slice(0, selectionStart) + e.key + selected + 閉じ括弧 + value.slice(selectionEnd);
        ta.値と選択範囲を書き換えて通知する(newValue, selectionStart + 1, selectionEnd + 1);
    }
}

function _handle閉じ括弧スキップ(ta: TextAreaC, e: KeyboardEvent): void {
    const selectionStart = ta.getSelectionStart();
    const value = ta.getValue();

    // カーソルの直後が同じ閉じ括弧ならスキップ
    if (value[selectionStart] === e.key) {
        e.preventDefault();
        ta.setSelectionRange(selectionStart + 1, selectionStart + 1);
    }
}

function _handleBackspace括弧削除(ta: TextAreaC, e: KeyboardEvent): void {
    const selectionStart = ta.getSelectionStart();
    const selectionEnd = ta.getSelectionEnd();
    const value = ta.getValue();

    if (selectionStart !== selectionEnd) return; // 範囲選択中は通常動作
    if (selectionStart === 0) return;

    const 前の文字 = value[selectionStart - 1];
    const 後の文字 = value[selectionStart];

    // 開き括弧の直後にカーソルがあり、直後が対応する閉じ括弧ならペア削除
    const 対応する閉じ括弧 = 括弧ペアマップ.get(前の文字);
    if (対応する閉じ括弧 && 後の文字 === 対応する閉じ括弧) {
        e.preventDefault();
        const newValue = value.slice(0, selectionStart - 1) + value.slice(selectionStart + 1);
        ta.値と選択範囲を書き換えて通知する(newValue, selectionStart - 1);
    }
}
