/**
 * ブラウザでのファイルダウンロードを抽象化したインターフェース
 * 永続化層やUI層の詳細をドメインロジックから切り離すために定義
 */
export interface IファイルDownloader {
    download(content: string, fileName: string, mimeType: string): void;
}

/**
 * ブラウザネイティブのダウンロード機能実装
 * Blob + <a>タグによる標準的なダウンロード処理 副作用をここに封じ込める
 */
export class BrowserファイルDownloader implements IファイルDownloader {
    public download(content: string, fileName: string, mimeType: string): void {
        // Blobを作成してダウンロード用URLを生成
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        // 一時的なaタグを作成してクリックイベントをトリガー
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = fileName;
        anchor.style.display = "none";

        document.body.appendChild(anchor);
        anchor.click();

        // クリーンアップ（メモリリークを防ぐため）
        setTimeout(() => {
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);
        }, 100);
    }
}

/**
 * 汎用JSONファイル出力サービス
 * 
 * 任意のオブジェクトをJSONファイルとしてダウンロードする責務を持つ。
 * 特定のデータ型には依存せず、Genericsとシリアライザに委譲する。
 */
export class JSONファイル出力サービス {
    private readonly downloader: IファイルDownloader;

    private constructor(downloader: IファイルDownloader) {
        this.downloader = downloader;
    }

    /**
     * デフォルト設定（ブラウザ依存）でサービスを生成
     */
    public static create(): JSONファイル出力サービス {
        return new JSONファイル出力サービス(new BrowserファイルDownloader());
    }

    /**
     * カスタムダウンローダーを指定してサービスを生成（テスト、あるいはElectron環境用）
     */
    public static createWith(downloader: IファイルDownloader): JSONファイル出力サービス {
        return new JSONファイル出力サービス(downloader);
    }

    /**
     * 任意のデータをJSONファイルとしてダウンロード
     * 
     * @param data - 出力するデータオブジェクト (JSON.stringify可能なもの)
     * @param fileName - 出力ファイル名 (拡張子.jsonを含むことを推奨)
     * @param replacer - (Optional) JSON.stringifyのreplacer引数と同様
     * @param space - (Optional) インデント数。デフォルトは2
     */
    public 出力<T>(data: T, fileName: string, replacer?: (this: any, key: string, value: any) => any, space: number = 2): void {
        const jsonString = JSON.stringify(data, replacer, space);
        this.downloader.download(jsonString, fileName, "application/json");
    }
}
