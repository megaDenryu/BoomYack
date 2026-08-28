import { 付箋ドラッグ枠線 } from "./付箋操作仕様";

export enum 付箋選択状態 {
    なし = "none",
    ホバー = "hover",
    矢印選択 = "arrowSelect",
    選択 = "selected",
}

export function 付箋アウトライン(状態: 付箋選択状態): string {
    switch (状態) {
        case 付箋選択状態.選択: return 付箋ドラッグ枠線.選択;
        case 付箋選択状態.ホバー: return 付箋ドラッグ枠線.ホバー;
        case 付箋選択状態.矢印選択: return 付箋ドラッグ枠線.矢印選択;
        case 付箋選択状態.なし: return "";
    }
}
