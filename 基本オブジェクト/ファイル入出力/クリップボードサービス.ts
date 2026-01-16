/**
 * クリップボードへのデータ転送を抽象化するインターフェース
 * 外部システムへの副作用を伴うため、DIによる差し替えを可能にする。
 * ドメインロジックが直接 `navigator` オブジェクトに依存しないようにする。
 */
export interface IClipboardCopier {
    copy(text: string): Promise<void>;
    read(): Promise<string>;
}

/**
 * ブラウザ標準のClipboard APIを使用した実装
 * 
 * 失敗時のフォールバック処理などはここにカプセル化する。
 */
export class BrowserClipboardCopier implements IClipboardCopier {
    public async copy(text: string): Promise<void> {
        // 最新のClipboard APIを使用
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            // レガシーな環境や非セキュアコンテキスト（http）向けのフォールバック
            // textAreaを作ってselectしてexecCommand('copy')
            const textArea = document.createElement("textarea");
            textArea.value = text;
            
            // 画面外に配置
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (!successful) {
                    throw new Error("execCommand('copy') failed");
                }
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }

    public async read(): Promise<string> {
        if (navigator.clipboard && navigator.clipboard.readText) {
            return await navigator.clipboard.readText();
        } else {
            throw new Error("Clipboard reading is not supported (requires secure context and user permission).");
        }
    }
}

/**
 * クリップボード操作サービス
 * 
 * 任意の文字列をシステムクリップボードに転送する責務を持つドメインサービス。
 */
export class クリップボードサービス {
    private readonly copier: IClipboardCopier;

    private constructor(copier: IClipboardCopier) {
        this.copier = copier;
    }

    /**
     * デフォルト設定（ブラウザ依存）でサービスを生成
     */
    public static create(): クリップボードサービス {
        return new クリップボードサービス(new BrowserClipboardCopier());
    }

    /**
     * カスタムコピー実装を指定してサービスを生成（テスト用）
     */
    public static createWith(copier: IClipboardCopier): クリップボードサービス {
        return new クリップボードサービス(copier);
    }

    /**
     * 文字列をクリップボードにコピーする
     * 
     * @param text - コピー対象の文字列
     * @returns 処理の完了を待機するPromise
     */
    public async コピー(text: string): Promise<void> {
        try {
            await this.copier.copy(text);
        } catch (error) {
            console.error("クリップボードへのコピーに失敗しました:", error);
            // 呼び出し元がエラーハンドリングしたい場合のために再スロー
            throw error;
        }
    }

    /**
     * クリップボードから文字列を読み取る
     */
    public async 貼り付け(): Promise<string> {
        try {
            return await this.copier.read();
        } catch (error) {
            console.error("クリップボードからの読み取りに失敗しました:", error);
            throw error;
        }
    }
}
