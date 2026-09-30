import { 開始と停止のできる購読 } from "./開始と停止のできる購読";

type 台帳の状態 =
    | { readonly kind: "操作対象" }
    | { readonly kind: "操作対象外" }
    | { readonly kind: "解除済み" };

/**
 * 1枚のボードが張った購読をすべて持つ台帳。操作対象の間だけ動くもの(キー操作・ホイール等)は操作対象のときだけ張る。
 * 作った直後は操作対象である(ボード1枚で使うため)。すべて解除する()の後の登録と切り替えは例外にする(到達したらバグ)。
 */
export class ボード購読台帳 {
    private readonly 常に動く購読: 開始と停止のできる購読[] = [];
    private readonly 操作対象の間だけ動く購読: 開始と停止のできる購読[] = [];
    private 状態: 台帳の状態 = { kind: "操作対象" };

    public get 操作対象か(): boolean { return this.状態.kind === "操作対象"; }

    public 常に動くものとして登録する(購読: 開始と停止のできる購読): void {
        this.解除済みなら例外を投げる("常に動くものとして登録する");
        this.常に動く購読.push(購読);
        購読.始める();
    }

    public 操作対象の間だけ動くものとして登録する(購読: 開始と停止のできる購読): void {
        this.解除済みなら例外を投げる("操作対象の間だけ動くものとして登録する");
        this.操作対象の間だけ動く購読.push(購読);
        if (this.状態.kind === "操作対象") 購読.始める();
    }

    public 操作対象にする(): void {
        this.解除済みなら例外を投げる("操作対象にする");
        if (this.状態.kind === "操作対象") return;
        this.状態 = { kind: "操作対象" };
        this.操作対象の間だけ動く購読.forEach(購読 => 購読.始める());
    }

    public 操作対象から外す(): void {
        this.解除済みなら例外を投げる("操作対象から外す");
        if (this.状態.kind === "操作対象外") return;
        this.状態 = { kind: "操作対象外" };
        this.操作対象の間だけ動く購読.forEach(購読 => 購読.止める());
    }

    public すべて解除する(): void {
        if (this.状態.kind === "解除済み") return;
        this.状態 = { kind: "解除済み" };
        [...this.常に動く購読, ...this.操作対象の間だけ動く購読].forEach(購読 => 購読.止める());
        this.常に動く購読.length = 0;
        this.操作対象の間だけ動く購読.length = 0;
    }

    private 解除済みなら例外を投げる(操作: string): void {
        if (this.状態.kind === "解除済み") throw new Error(`後始末の済んだボードの購読台帳に「${操作}」が呼ばれました`);
    }
}
