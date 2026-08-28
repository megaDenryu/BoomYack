import { RequestAPI } from "TypeScriptBenriKakuchou/Web/RequestApi";
import { Toast } from "OneONetUIComponents/Toast/Toast";

// サーバーの /BoomYack/events (SSE) を購読し、開いているボードが外部 (MCP・別ウィンドウ) で
// 保存・削除されたことを利用者へ知らせる。自動再読込はしない (未保存の編集を勝手に
// 破棄しないため)。再読込の導線は既存のセーブパネルのロード。通知を取り逃しても、
// 保存時のrevision照合が上書き事故を防ぐ。

interface ボード変更通知JSON {
    readonly boardId: string;
    readonly revision: number;
    readonly 種別: "保存" | "削除";
    readonly source: string; // "ui" | "mcp"。自分 (ui) の保存の折り返し表示を避けるためだけに使い、整合性判断には使わない
}

function isボード変更通知JSON(value: unknown): value is ボード変更通知JSON {
    if (typeof value !== "object" || value === null) return false;
    const 通知 = value as Record<string, unknown>;
    return typeof 通知.boardId === "string" && typeof 通知.revision === "number"
        && (通知.種別 === "保存" || 通知.種別 === "削除")
        && typeof 通知.source === "string";
}

export interface ボード外部更新監視依存 {
    現在のボードIDを得る(): string | null;
    既知のrevisionを得る(canvasId: string): number | null;
}

export class ボード外部更新監視 {
    private eventSource: EventSource | null = null;

    public constructor(private readonly 依存: ボード外部更新監視依存) {}

    public 開始する(): void {
        if (this.eventSource !== null) return;
        this.eventSource = new EventSource(`${RequestAPI.origin}/BoomYack/events`);
        this.eventSource.onmessage = event => this.通知を処理する(event.data);
        // 切断時はEventSourceが自動再接続する。エラーは接続断の通常経過なのでログだけに留める
        this.eventSource.onerror = () => console.log("ボード外部更新監視: 接続が切れました (自動再接続します)");
    }

    private 通知を処理する(生データ: string): void {
        let parsed: unknown;
        try { parsed = JSON.parse(生データ); } catch { return; }
        if (!isボード変更通知JSON(parsed)) return;
        if (parsed.source === "ui") return; // 自分の保存経路からの通知
        const 現在のボードID = this.依存.現在のボードIDを得る();
        if (現在のボードID === null || parsed.boardId !== 現在のボードID) return;
        if (parsed.種別 === "削除") {
            Toast.error("表示中のボードが外部で削除されました");
            return;
        }
        const 既知 = this.依存.既知のrevisionを得る(現在のボードID);
        if (既知 !== null && parsed.revision <= 既知) return; // 自分の保存の折り返し通知は無視する
        Toast.success(`ボードが外部で更新されました (revision ${parsed.revision})。セーブパネルから読み込み直してください`);
    }
}
