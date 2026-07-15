import { キャンバスメタデータ, 描画キャンバスデータ, 描画キャンバスデータからメタデータ抽出, 描画キャンバスJSON, I描画キャンバスJSON } from "../描画キャンバス/データクラス";
import { I描画キャンバスローカルリポジトリ } from "./I描画キャンバスAPIリポジトリ";
import { ローカルキャンバスデータを検証する } from "./ローカルキャンバスデータ検証";

export class 描画キャンバスローカルリポジトリ implements I描画キャンバスローカルリポジトリ {
    private readonly _prefix = "canvas_data_";
    public static データ検証(data: unknown): data is I描画キャンバスJSON {
        return ローカルキャンバスデータを検証する(data);
    }
    public 保存(data: 描画キャンバスデータ): this {
        try {
            localStorage.setItem(this._prefix + data.metadata.id.id, JSON.stringify(data.toJSON()));
            console.log(`キャンバス[${data.metadata.id.id}]をローカルストレージに保存しました`);
        } catch (error) { console.error("ローカルストレージ保存エラー:", error); }
        return this;
    }
    public 読み込み(id: string): 描画キャンバスJSON | null {
        try {
            const text = localStorage.getItem(this._prefix + id);
            if (!text) return null;
            const parsed = JSON.parse(text);
            if (描画キャンバスローカルリポジトリ.データ検証(parsed)) return parsed;
            console.warn(`無効なキャンバスデータを検出しました [${id}] - 削除します`);
            this.削除(id); return null;
        } catch (error) {
            console.error("ローカルストレージ読み込みエラー:", error);
            console.warn(`パースエラーのデータを削除します [${id}]`);
            this.削除(id); return null;
        }
    }
    public 削除(id: string): this {
        try {
            localStorage.removeItem(this._prefix + id);
            console.log(`キャンバス[${id}]をローカルストレージから削除しました`);
        } catch (error) { console.error("ローカルストレージ削除エラー:", error); }
        return this;
    }
    public 全キャンバスID取得(): string[] {
        const ids: string[] = [];
        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index);
            if (key?.startsWith(this._prefix)) ids.push(key.substring(this._prefix.length));
        }
        return ids;
    }
    public 一覧取得(): キャンバスメタデータ[] {
        const items: キャンバスメタデータ[] = [];
        for (const id of this.全キャンバスID取得()) {
            const json = this.読み込み(id);
            if (json) items.push(描画キャンバスデータからメタデータ抽出(描画キャンバスデータ.fromJSON(json)));
        }
        return items;
    }
    public 無効データクリーンアップ(): string[] {
        const deleted: string[] = [];
        for (const id of this.全キャンバスID取得()) {
            try {
                const text = localStorage.getItem(this._prefix + id);
                if (!text || 描画キャンバスローカルリポジトリ.データ検証(JSON.parse(text))) continue;
                console.warn(`無効なデータを削除: ${id}`);
            } catch { console.warn(`パースエラーのデータを削除: ${id}`); }
            this.削除(id); deleted.push(id);
        }
        if (deleted.length > 0) console.log(`${deleted.length}件の無効データを削除しました`);
        return deleted;
    }
}
