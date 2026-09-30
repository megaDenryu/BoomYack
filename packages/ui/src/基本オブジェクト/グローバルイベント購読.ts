import { 開始と停止のできる購読 } from "./開始と停止のできる購読";

/**
 * document/windowへのイベント購読を1件ぶん表す型。window/documentへのaddEventListenerはこのファイルだけが呼ぶ
 * (グローバル購読の経路.test.tsが検査する)。作った購読はボード購読台帳へ登録し、台帳が張る時期と外す時期を決める。
 */
export class グローバルイベント購読 implements 開始と停止のできる購読 {
    private 張っているか = false;

    private constructor(
        private readonly イベントの発生元: Document | Window,
        private readonly 種類: string,
        private readonly 受けたときの処理: EventListener,
        private readonly オプション: boolean | AddEventListenerOptions | undefined
    ) {}

    public static 作成する<K extends keyof DocumentEventMap>(
        イベントの発生元: Document, 種類: K, 受けたときの処理: (event: DocumentEventMap[K]) => void,
        オプション?: boolean | AddEventListenerOptions
    ): グローバルイベント購読;
    public static 作成する<K extends keyof WindowEventMap>(
        イベントの発生元: Window, 種類: K, 受けたときの処理: (event: WindowEventMap[K]) => void,
        オプション?: boolean | AddEventListenerOptions
    ): グローバルイベント購読;
    public static 作成する(
        イベントの発生元: Document | Window, 種類: string, 受けたときの処理: EventListener,
        オプション?: boolean | AddEventListenerOptions
    ): グローバルイベント購読 {
        return new グローバルイベント購読(イベントの発生元, 種類, 受けたときの処理, オプション);
    }

    public 始める(): void {
        if (this.張っているか) return;
        this.イベントの発生元.addEventListener(this.種類, this.受けたときの処理, this.オプション);
        this.張っているか = true;
    }

    public 止める(): void {
        if (!this.張っているか) return;
        this.イベントの発生元.removeEventListener(this.種類, this.受けたときの処理, this.オプション);
        this.張っているか = false;
    }
}
