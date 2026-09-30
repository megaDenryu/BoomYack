import { Toast } from "OneONetUIComponents/Toast/Toast";
import { ボード購読台帳 } from "../ボード購読台帳";
import { 開始と停止のできる購読 } from "../開始と停止のできる購読";
import { ボード変更通知, ボード変更通知の受け手, ボード外部更新の受信 } from "./ボード外部更新の受信";

// 開いているボードが外部 (MCP・別ウィンドウ) で保存・削除されたことを知らせる。自動再読込はしない (未保存の編集を
// 勝手に破棄しないため)。通知はボードがある間ずっと受け、知らせるのは操作対象の間だけ。裏で受けた知らせは操作対象に戻ったときに出す。

type 外部更新の知らせ = { readonly kind: "削除された" } | { readonly kind: "更新された"; readonly revision: number };
type 保留中の知らせ = { readonly kind: "無し" } | { readonly kind: "有り"; readonly 知らせ: 外部更新の知らせ };

export interface ボード外部更新監視依存 {
    現在のボードIDを得る(): string | null;
    既知のrevisionを得る(canvasId: string): number | null;
}

export class ボード外部更新監視 implements ボード変更通知の受け手, 開始と停止のできる購読 {
    private 知らせてよいか = false;
    private 保留中: 保留中の知らせ = { kind: "無し" };

    public constructor(private readonly 依存: ボード外部更新監視依存, 受信: ボード外部更新の受信, 購読台帳: ボード購読台帳) {
        購読台帳.常に動くものとして登録する(受信.受け手の登録を作る(this));
        購読台帳.操作対象の間だけ動くものとして登録する(this);
    }

    public 始める(): void {
        this.知らせてよいか = true;
        if (this.保留中.kind === "有り") this.知らせを出す(this.保留中.知らせ);
        this.保留中 = { kind: "無し" };
    }

    public 止める(): void { this.知らせてよいか = false; }

    public 通知を受ける(通知: ボード変更通知): void {
        if (通知.source === "ui") return; // 自分の保存経路からの通知
        const 現在のボードID = this.依存.現在のボードIDを得る();
        if (現在のボードID === null || 通知.boardId !== 現在のボードID) return;
        const 既知 = this.依存.既知のrevisionを得る(現在のボードID);
        if (通知.種別 === "保存" && 既知 !== null && 通知.revision <= 既知) return; // 自分の保存の折り返し通知は無視する
        const 知らせ: 外部更新の知らせ = 通知.種別 === "削除" ? { kind: "削除された" } : { kind: "更新された", revision: 通知.revision };
        if (this.知らせてよいか) this.知らせを出す(知らせ);
        else this.保留中 = { kind: "有り", 知らせ };
    }

    private 知らせを出す(知らせ: 外部更新の知らせ): void {
        switch (知らせ.kind) {
            case "削除された": Toast.error("表示中のボードが外部で削除されました"); return;
            case "更新された":
                Toast.success(`ボードが外部で更新されました (revision ${知らせ.revision})。セーブパネルから読み込み直してください`);
                return;
            default: { const 網羅の確認: never = 知らせ; return 網羅の確認; }
        }
    }
}
