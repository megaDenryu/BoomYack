import { BrowserClipboardCopier } from "./BrowserClipboardCopier";
import { IClipboardCopier } from "./ClipboardCopier";

export { BrowserClipboardCopier };
export type { IClipboardCopier };

export class クリップボードサービス {
    private constructor(private readonly copier: IClipboardCopier) { }

    public static create(): クリップボードサービス {
        return new クリップボードサービス(new BrowserClipboardCopier());
    }

    public static createWith(copier: IClipboardCopier): クリップボードサービス {
        return new クリップボードサービス(copier);
    }

    public async コピー(text: string): Promise<void> {
        try {
            await this.copier.copy(text);
        } catch (error) {
            console.error("クリップボードへのコピーに失敗しました:", error);
            throw error;
        }
    }

    public async 貼り付け(): Promise<string> {
        try {
            return await this.copier.read();
        } catch (error) {
            console.error("クリップボードからの読み取りに失敗しました:", error);
            throw error;
        }
    }
}
