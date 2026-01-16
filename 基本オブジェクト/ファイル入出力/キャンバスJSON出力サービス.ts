import { 描画キャンバスデータ, I描画キャンバスJSON } from "../描画キャンバス/データクラス";

/**
 * ブラウザでのファイルダウンロードを抽象化したインターフェース
 */
interface IファイルDownloader {
    download(content: string, fileName: string, mimeType: string): void;
}

/**
 * ブラウザネイティブのダウンロード機能実装
 * Blob + <a>タグによる標準的なダウンロード処理
 */
class BrowserファイルDownloader implements IファイルDownloader {
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
 * キャンバスJSON出力サービス - 描画キャンバスデータをJSONファイルとしてダウンロード
 * 
 * 責務：
 * - 描画キャンバスデータをJSON文字列に変換
 * - ファイル名の生成（デフォルト命名規則の提供）
 * - ブラウザでのダウンロード処理の実行
 */
export class キャンバスJSON出力サービス {
    private readonly downloader: IファイルDownloader;

    private constructor(downloader: IファイルDownloader) {
        this.downloader = downloader;
    }

    /**
     * デフォルト設定でサービスを生成
     */
    public static create(): キャンバスJSON出力サービス {
        return new キャンバスJSON出力サービス(new BrowserファイルDownloader());
    }

    /**
     * カスタムダウンローダーを指定してサービスを生成（テスト用）
     */
    public static createWith(downloader: IファイルDownloader): キャンバスJSON出力サービス {
        return new キャンバスJSON出力サービス(downloader);
    }

    /**
     * 描画キャンバスデータをJSONファイルとしてダウンロード
     * 
     * @param data - 出力する描画キャンバスデータ
     * @param fileName - ファイル名（省略時は自動生成）
     */
    public 出力(data: 描画キャンバスデータ, fileName?: string): void {
        // JSON文字列に変換（整形あり）
        const jsonString = this.toJSONString(data);
        
        // ファイル名の決定
        const finalFileName = fileName ?? this.generateDefaultFileName(data);
        
        // ダウンロード実行
        this.downloader.download(jsonString, finalFileName, "application/json");
    }

    /**
     * 描画キャンバスデータを整形されたJSON文字列に変換
     */
    private toJSONString(data: 描画キャンバスデータ): string {
        const jsonObject: I描画キャンバスJSON = data.toJSON();
        return JSON.stringify(jsonObject, null, 2); // インデント2スペースで整形
    }

    /**
     * デフォルトのファイル名を生成
     * 形式: canvas_{キャンバス名}_{タイムスタンプ}.json
     */
    private generateDefaultFileName(data: 描画キャンバスデータ): string {
        const canvasName = this.sanitizeFileName(data.metadata.name);
        const timestamp = this.formatTimestamp(new Date());
        return `canvas_${canvasName}_${timestamp}.json`;
    }

    /**
     * ファイル名として使用できない文字をサニタイズ
     */
    private sanitizeFileName(name: string): string {
        // ファイル名に使用できない文字を置換
        return name
            .replace(/[<>:"/\\|?*]/g, "_")  // 禁止文字を_に置換
            .replace(/\s+/g, "_")            // 空白を_に置換
            .slice(0, 50);                   // 長さ制限（拡張子抜きで50文字）
    }

    /**
     * タイムスタンプをファイル名用にフォーマット
     * 形式: YYYYMMDD_HHMMSS
     */
    private formatTimestamp(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        
        return `${year}${month}${day}_${hours}${minutes}${seconds}`;
    }
}
