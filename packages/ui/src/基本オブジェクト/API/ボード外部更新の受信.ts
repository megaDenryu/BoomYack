import { RequestAPI } from "TypeScriptBenriKakuchou/Web/RequestApi";
import { 開始と停止のできる購読 } from "../開始と停止のできる購読";

export interface ボード変更通知 {
    readonly boardId: string;
    readonly revision: number;
    readonly 種別: "保存" | "削除";
    readonly source: string; // "ui" | "mcp"。自分 (ui) の保存の折り返し表示を避けるためだけに使い、整合性判断には使わない
}

export interface ボード変更通知の受け手 {
    通知を受ける(通知: ボード変更通知): void;
}

function isボード変更通知(value: unknown): value is ボード変更通知 {
    return typeof value === "object" && value !== null
        && "boardId" in value && typeof value.boardId === "string"
        && "revision" in value && typeof value.revision === "number"
        && "種別" in value && (value.種別 === "保存" || value.種別 === "削除")
        && "source" in value && typeof value.source === "string";
}

/**
 * サーバーの /BoomYack/events (SSE) を1本だけ開き、届いた通知をすべての受け手(ボード)へ配る。受け手がいる間だけ接続を開く。
 * ボードを何枚開いても接続は1本で済み(同一オリジンの同時接続数に上限がある)、裏のタブのボードも通知を受け取る。
 */
export class ボード外部更新の受信 {
    private readonly 受け手一覧 = new Set<ボード変更通知の受け手>();
    private 接続: EventSource | null = null;

    /** 受け手を加える購読を作る。ボード購読台帳へ常に動くものとして登録する。 */
    public 受け手の登録を作る(受け手: ボード変更通知の受け手): 開始と停止のできる購読 {
        return new 受け手の登録(this, 受け手);
    }

    public 受け手を加える(受け手: ボード変更通知の受け手): void {
        this.受け手一覧.add(受け手);
        if (this.接続 !== null) return;
        this.接続 = new EventSource(`${RequestAPI.origin}/BoomYack/events`);
        this.接続.onmessage = event => this.通知を配る(event.data);
        // 切断時はEventSourceが自動再接続する。エラーは接続断の通常経過なのでログだけに留める
        this.接続.onerror = () => console.log("ボード外部更新の受信: 接続が切れました (自動再接続します)");
    }

    public 受け手を外す(受け手: ボード変更通知の受け手): void {
        this.受け手一覧.delete(受け手);
        if (this.受け手一覧.size > 0 || this.接続 === null) return;
        this.接続.close();
        this.接続 = null;
    }

    private 通知を配る(生データ: string): void {
        let parsed: unknown;
        try { parsed = JSON.parse(生データ); } catch { return; }
        if (!isボード変更通知(parsed)) return;
        const 通知 = parsed;
        [...this.受け手一覧].forEach(受け手 => 受け手.通知を受ける(通知));
    }
}

class 受け手の登録 implements 開始と停止のできる購読 {
    public constructor(private readonly 受信: ボード外部更新の受信, private readonly 受け手: ボード変更通知の受け手) {}
    public 始める(): void { this.受信.受け手を加える(this.受け手); }
    public 止める(): void { this.受信.受け手を外す(this.受け手); }
}
