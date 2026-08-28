import { 描画キャンバスデータ } from "../描画キャンバス/データクラス";
import { BrowserファイルDownloader, IファイルDownloader } from "./BrowserファイルDownloader";
import { キャンバスJSONファイル名を作る } from "./キャンバスJSONファイル名";

export class キャンバスJSON出力サービス {
    private constructor(private readonly downloader: IファイルDownloader) { }

    public static create(): キャンバスJSON出力サービス {
        return new キャンバスJSON出力サービス(new BrowserファイルDownloader());
    }

    public static createWith(downloader: IファイルDownloader): キャンバスJSON出力サービス {
        return new キャンバスJSON出力サービス(downloader);
    }

    public 出力(data: 描画キャンバスデータ, fileName?: string): void {
        const json = JSON.stringify(data.toJSON(), null, 2);
        const name = fileName ?? キャンバスJSONファイル名を作る(data.metadata.name, new Date());
        this.downloader.download(json, name, "application/json");
    }
}
