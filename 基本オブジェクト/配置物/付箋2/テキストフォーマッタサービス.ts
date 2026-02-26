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
 * @param element 対象のHTMLTextAreaElement
 * @returns クリーンアップ関数（イベントリスナーの解除）
 */
export function テキストフォーマット適用(element: HTMLTextAreaElement): () => void {
    const handler = (e: KeyboardEvent): void => {
        if (e.key === "Tab") {
            _handleTab(element, e);
        } else if (e.key === "Enter") {
            _handleEnter(element, e);
        } else if (括弧ペアマップ.has(e.key)) {
            _handle括弧開き(element, e);
        } else if (閉じ括弧セット.has(e.key)) {
            _handle閉じ括弧スキップ(element, e);
        } else if (e.key === "Backspace") {
            _handleBackspace括弧削除(element, e);
        }
    };

    element.addEventListener("keydown", handler);

    // クリーンアップ関数を返す
    return () => {
        element.removeEventListener("keydown", handler);
    };
}


// ============================================
// Tab インデント
// ============================================

function _handleTab(el: HTMLTextAreaElement, e: KeyboardEvent): void {
    e.preventDefault();
    debugger;
    const { selectionStart, selectionEnd, value } = el;

    if (selectionStart === selectionEnd) {
        // 単一カーソル位置: タブ文字（スペース4つ）を挿入
        const indent = "    ";
        el.value = value.slice(0, selectionStart) + indent + value.slice(selectionEnd);
        el.selectionStart = el.selectionEnd = selectionStart + indent.length;
    } else {
        // 範囲選択中: 選択行の先頭にインデント追加/削除
        const before = value.slice(0, selectionStart);
        const selected = value.slice(selectionStart, selectionEnd);
        const after = value.slice(selectionEnd);

        if (e.shiftKey) {
            // Shift+Tab: インデント削除
            const deindented = selected.replace(/^( {1,4}|\t)/gm, "");
            el.value = before + deindented + after;
            el.selectionStart = selectionStart;
            el.selectionEnd = selectionStart + deindented.length;
        } else {
            // Tab: インデント追加
            const indented = selected.replace(/^/gm, "    ");
            el.value = before + indented + after;
            el.selectionStart = selectionStart;
            el.selectionEnd = selectionStart + indented.length;
        }
    }

    // inputイベントを発火してViewに反映
    el.dispatchEvent(new Event("input", { bubbles: true }));
}


// ============================================
// Enter 自動インデント
// ============================================

function _handleEnter(el: HTMLTextAreaElement, e: KeyboardEvent): void {
    if (e.isComposing) return; // IME変換中は無視

    const { selectionStart, value } = el;

    // 現在行のインデントを取得
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const currentLine = value.slice(lineStart, selectionStart);
    const indentMatch = currentLine.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : "";

    if (indent.length === 0) return; // インデントなしなら通常Enter

    e.preventDefault();
    const before = value.slice(0, selectionStart);
    const after = value.slice(el.selectionEnd);

    el.value = before + "\n" + indent + after;
    el.selectionStart = el.selectionEnd = selectionStart + 1 + indent.length;

    el.dispatchEvent(new Event("input", { bubbles: true }));
}


// ============================================
// 括弧ペアリング
// ============================================

function _handle括弧開き(el: HTMLTextAreaElement, e: KeyboardEvent): void {
    const 閉じ括弧 = 括弧ペアマップ.get(e.key);
    if (!閉じ括弧) return;

    const { selectionStart, selectionEnd, value } = el;

    // 同一文字ペア（"" や ''）で既に閉じ括弧の直前にいるならスキップ
    if (e.key === 閉じ括弧 && value[selectionStart] === 閉じ括弧) {
        e.preventDefault();
        el.selectionStart = el.selectionEnd = selectionStart + 1;
        return;
    }

    e.preventDefault();

    if (selectionStart === selectionEnd) {
        // カーソル位置に括弧ペアを挿入、カーソルを括弧の間に配置
        el.value = value.slice(0, selectionStart) + e.key + 閉じ括弧 + value.slice(selectionEnd);
        el.selectionStart = el.selectionEnd = selectionStart + 1;
    } else {
        // 選択範囲を括弧で囲む
        const selected = value.slice(selectionStart, selectionEnd);
        el.value = value.slice(0, selectionStart) + e.key + selected + 閉じ括弧 + value.slice(selectionEnd);
        el.selectionStart = selectionStart + 1;
        el.selectionEnd = selectionEnd + 1;
    }

    el.dispatchEvent(new Event("input", { bubbles: true }));
}

function _handle閉じ括弧スキップ(el: HTMLTextAreaElement, e: KeyboardEvent): void {
    const { selectionStart, value } = el;

    // カーソルの直後が同じ閉じ括弧ならスキップ
    if (value[selectionStart] === e.key) {
        e.preventDefault();
        el.selectionStart = el.selectionEnd = selectionStart + 1;
    }
}

function _handleBackspace括弧削除(el: HTMLTextAreaElement, e: KeyboardEvent): void {
    const { selectionStart, selectionEnd, value } = el;

    if (selectionStart !== selectionEnd) return; // 範囲選択中は通常動作
    if (selectionStart === 0) return;

    const 前の文字 = value[selectionStart - 1];
    const 後の文字 = value[selectionStart];

    // 開き括弧の直後にカーソルがあり、直後が対応する閉じ括弧ならペア削除
    const 対応する閉じ括弧 = 括弧ペアマップ.get(前の文字);
    if (対応する閉じ括弧 && 後の文字 === 対応する閉じ括弧) {
        e.preventDefault();
        el.value = value.slice(0, selectionStart - 1) + value.slice(selectionStart + 1);
        el.selectionStart = el.selectionEnd = selectionStart - 1;
        el.dispatchEvent(new Event("input", { bubbles: true }));
    }
}
