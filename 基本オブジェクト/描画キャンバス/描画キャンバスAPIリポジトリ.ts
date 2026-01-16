import { RequestAPI } from "../../../Web/RequestApi";
import { キャンバスメタデータ, キャンバス保存レスポンス, 描画キャンバスデータ, 描画キャンバスデータからメタデータ抽出, 描画キャンバスJSON, I描画キャンバスJSON } from "./データクラス";


export interface 描画キャンバスリポジトリ {api: 描画キャンバスAPIリポジトリ, local: 描画キャンバスローカルリポジトリ}

/**
 * 描画キャンバスのデータをサーバーと同期するためのAPIリポジトリ
 * 
 * 使用例:
 * ```typescript
 * const repo = new 描画キャンバスAPIリポジトリ();
 * await repo.保存("my-canvas-id", canvasData);
 * const loadedData = await repo.読み込み("my-canvas-id");
 * ```
 */
export class 描画キャンバスAPIリポジトリ {
    private readonly _endpointBase: string = "canvas";

    /**
     * キャンバスデータをサーバーに保存する
     * @param data 保存するキャンバスデータ（id, nameを含む）
     * @returns 保存結果のレスポンス
     */
    public async 保存(data: 描画キャンバスデータ): Promise<キャンバス保存レスポンス> {
        return RequestAPI.postRequest2<キャンバス保存レスポンス>(
            `${this._endpointBase}/save`,
            { canvasId: data.metadata.id, data }
        ).then(response => response)
         .catch(error => {
            console.error("キャンバス保存エラー:", error);
            return { success: false, message: `保存に失敗しました: ${error.message}` };
         });
    }

    /**
     * サーバーからキャンバスデータを読み込む
     * @param canvasId キャンバスの識別子
     * @returns キャンバスデータのJSON形式、存在しない場合はnull
     */
    public async 読み込み(canvasId: string): Promise<描画キャンバスJSON | null> {
        return RequestAPI.postRequest2<{ success: boolean; data: any | null }>(
            `${this._endpointBase}/load`,
            { canvasId }
        ).then(response => response.success ? response.data : null)
         .catch(error => {
            console.error("キャンバス読み込みエラー:", error);
            return null;
         });
    }

    /**
     * 保存されているキャンバス一覧を取得する
     * @returns キャンバスメタデータの一覧
     */
    public async 一覧取得(): Promise<キャンバスメタデータ[]> {
        return RequestAPI.postRequest2<{ success: boolean; items: キャンバスメタデータ[] }>(
            `${this._endpointBase}/list`,
            {}
        ).then(response => response.success ? response.items : [])
         .catch(error => {
            console.error("キャンバス一覧取得エラー:", error);
            return [];
         });
    }

    /**
     * キャンバスデータを削除する
     * @param canvasId キャンバスの識別子
     * @returns 削除結果
     */
    public async 削除(canvasId: string): Promise<{ success: boolean; message: string }> {
        return RequestAPI.postRequest2<{ success: boolean; message: string }>(
            `${this._endpointBase}/delete`,
            { canvasId }
        ).then(response => response)
         .catch(error => {
            console.error("キャンバス削除エラー:", error);
            return { success: false, message: `削除に失敗しました: ${error.message}` };
         });
    }
}

/**
 * ローカルストレージを使用したキャンバスデータの一時保存リポジトリ
 * サーバーが利用できない場合のフォールバック用
 */
export class 描画キャンバスローカルリポジトリ {
    private readonly _storageKeyPrefix: string = "canvas_data_";

    /**
     * キャンバスデータが有効かどうかを検証する
     * @param data 検証対象のデータ
     * @returns 有効なら true、無効なら false
     */
    public static データ検証(data: unknown): data is I描画キャンバスJSON {
        if (!data || typeof data !== 'object') return false;
        
        const d = data as Record<string, unknown>;
        
        // 必須フィールドの存在チェック
        if (typeof d.id !== 'string' || d.id.trim() === '') return false;
        if (typeof d.name !== 'string') return false;
        if (typeof d.version !== 'string') return false;
        if (typeof d.createdAt !== 'string') return false;
        if (typeof d.updatedAt !== 'string') return false;
        
        // 描画原点のチェック
        if (!d.描画原点 || typeof d.描画原点 !== 'object') return false;
        const origin = d.描画原点 as Record<string, unknown>;
        if (typeof origin.x !== 'number' || typeof origin.y !== 'number') return false;
        
        // 配置物リストのチェック
        if (!Array.isArray(d.配置物リスト)) return false;
        
        return true;
    }

    /**
     * ローカルストレージに保存する
     * @param data 保存するキャンバスデータ（id, nameを含む）
     */
    public 保存(data: 描画キャンバスデータ): this {
        try {
            const key = this._storageKeyPrefix + data.metadata.id.id;
            const json = data.toJSON();
            localStorage.setItem(key, JSON.stringify(json));
            console.log(`キャンバス[${data.metadata.id.id}]をローカルストレージに保存しました`);
        } catch (error) {
            console.error("ローカルストレージ保存エラー:", error);
        }
        return this;
    }

    /**
     * ローカルストレージから読み込む
     * 無効なデータの場合は自動的に削除する
     * @param canvasId キャンバスの識別子
     * @returns キャンバスデータのJSON形式、存在しない場合はnull
     */
    public 読み込み(canvasId: string): 描画キャンバスJSON | null {
        try {
            const key = this._storageKeyPrefix + canvasId;
            const jsonStr = localStorage.getItem(key);
            if (!jsonStr) return null;
            
            const parsed = JSON.parse(jsonStr);
            
            // データ検証
            if (!描画キャンバスローカルリポジトリ.データ検証(parsed)) {
                console.warn(`無効なキャンバスデータを検出しました [${canvasId}] - 削除します`);
                this.削除(canvasId);
                return null;
            }
            
            // 型安全なJSON形式として返す（型ガードで検証済み）
            return parsed;
        } catch (error) {
            console.error("ローカルストレージ読み込みエラー:", error);
            // パースエラーの場合は無効データとして削除
            console.warn(`パースエラーのデータを削除します [${canvasId}]`);
            this.削除(canvasId);
            return null;
        }
    }

    /**
     * ローカルストレージから削除する
     * @param canvasId キャンバスの識別子
     */
    public 削除(canvasId: string): this {
        try {
            const key = this._storageKeyPrefix + canvasId;
            localStorage.removeItem(key);
            console.log(`キャンバス[${canvasId}]をローカルストレージから削除しました`);
        } catch (error) {
            console.error("ローカルストレージ削除エラー:", error);
        }
        return this;
    }

    /**
     * 保存されているすべてのキャンバスIDを取得
     */
    public 全キャンバスID取得(): string[] {
        const ids: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(this._storageKeyPrefix)) {
                ids.push(key.substring(this._storageKeyPrefix.length));
            }
        }
        return ids;
    }

    /**
     * 保存されているキャンバス一覧を取得
     * 各キャンバスデータから実際のメタデータを抽出する
     * 無効なデータは自動的に削除される
     */
    public 一覧取得(): キャンバスメタデータ[] {
        const items: キャンバスメタデータ[] = [];
        const ids = this.全キャンバスID取得();
        
        for (const id of ids) {
            // 読み込み内で無効データは自動削除される
            const json = this.読み込み(id);
            if (json) {
                const data = 描画キャンバスデータ.fromJSON(json);
                items.push(描画キャンバスデータからメタデータ抽出(data));
            }
        }
        
        return items;
    }

    /**
     * 無効なデータをすべて削除する
     * @returns 削除されたIDのリスト
     */
    public 無効データクリーンアップ(): string[] {
        const deletedIds: string[] = [];
        const ids = this.全キャンバスID取得();
        
        for (const id of ids) {
            try {
                const key = this._storageKeyPrefix + id;
                const jsonStr = localStorage.getItem(key);
                if (!jsonStr) continue;
                
                const parsed = JSON.parse(jsonStr);
                if (!描画キャンバスローカルリポジトリ.データ検証(parsed)) {
                    console.warn(`無効なデータを削除: ${id}`);
                    this.削除(id);
                    deletedIds.push(id);
                }
            } catch (error) {
                console.warn(`パースエラーのデータを削除: ${id}`);
                this.削除(id);
                deletedIds.push(id);
            }
        }
        
        if (deletedIds.length > 0) {
            console.log(`${deletedIds.length}件の無効データを削除しました`);
        }
        
        return deletedIds;
    }
}
