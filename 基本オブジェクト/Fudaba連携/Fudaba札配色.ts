/**
 * Fudaba側の`--fudaba-kind-*`(テーマ.ts)と同系統の配色をボード側に踏襲し、
 * 初見でも種別が識別できるようにする(設計2026-07-14_付箋コンテンツ設計.md 7.2節)。
 * 種別はFudaba側で拡張されうるため、未知の値は中立色にフォールバックせず
 * 「未分類として扱っている」ことが分かる灰色で表す。
 */
const 種別配色: Readonly<Record<string, string>> = {
    タスク: "#5b4a96",
    バグ: "#c9403a",
    決定: "#2f7d5a",
    メモ: "#8078a4",
};

const 状態配色: Readonly<Record<string, string>> = {
    未着手: "#9e9e9e",
    進行中: "#1e88e5",
    完了: "#43a047",
    ブロック: "#e53935",
};

const 未知種別配色 = "#757575";

export function 種別に対応する配色を取得する(種別: string): string {
    return 種別配色[種別] ?? 未知種別配色;
}

export function 状態に対応する配色を取得する(状態: string): string {
    return 状態配色[状態] ?? 未知種別配色;
}
