import { FileOperationResult, JSONファイル } from "TypeScriptBenriKakuchou/FileSystem/ファイル/拡張子付きファイル/JSONファイル";
import { I描画キャンバスJSON, 描画キャンバスデータ } from "../描画キャンバス/データクラス";

export class 描画キャンバスデータバリデーター {
    public constructor() {
        
    }

    public async execute(data: JSONファイル):Promise<FileOperationResult<描画キャンバスデータ>> {
        // Phase 2: FileSystem層での読み込み+解析（型安全）
        const canvasJSONResult = await data.loadAndParse(this.isCanvasJSON.bind(this));
        if (!canvasJSONResult.success) {
            return { 
                success: false, 
                error: `キャンバスデータ読み込みエラー: ${canvasJSONResult.error}` 
            };
        }

        // Phase 3: ドメイン層での変換
        const canvasDataResult = this.transformToCanvasData(canvasJSONResult.data);
        return canvasDataResult;
    }

    /**
     * キャンバスJSON型ガード - 型安全な検証関数
     * ドメイン固有のバリデーションロジック
     */
    private isCanvasJSON(obj: unknown): obj is I描画キャンバスJSON {
        if (!obj || typeof obj !== 'object') return false;
        
        const data = obj as Record<string, unknown>;
        
        // 必須フィールドの存在と型チェック
        return (
            typeof data.version === 'string' &&
            typeof data.id === 'string' &&
            typeof data.name === 'string' &&
            typeof data.createdAt === 'string' &&
            typeof data.updatedAt === 'string' &&
            data.描画原点 !== undefined &&
            Array.isArray(data.配置物リスト)
        );
    };

    /**
     * ドメインオブジェクト変換 - 純粋なドメインロジック
     * 既存のfromJSONメソッドを活用し、エラーハンドリングを強化
     */
    private transformToCanvasData(
        canvasJSON: I描画キャンバスJSON
    ): FileOperationResult<描画キャンバスデータ> {
        try {
            // ドメイン固有のバリデーション
            const validationResult = this._validateCanvasDomainRules(canvasJSON);
            if (!validationResult.success) {
                return validationResult;
            }

            // 既存ドメインロジックによる変換
            const canvasData = 描画キャンバスデータ.fromJSON(canvasJSON);
            return { success: true, data: canvasData };

        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error 
                    ? `ドメインオブジェクト変換エラー: ${error.message}` 
                    : "キャンバスデータの変換に失敗しました" 
            };
        }
    }

    /**
     * キャンバス固有のドメインルール検証
     * ビジネスロジック層での検証
     */
    private _validateCanvasDomainRules(
        canvasJSON: I描画キャンバスJSON
    ): FileOperationResult<void> {
        // バージョンチェック
        if (!canvasJSON.version || canvasJSON.version.trim() === '') {
            return { success: false, error: "キャンバスのバージョン情報が不正です" };
        }

        // IDチェック
        if (!canvasJSON.id || canvasJSON.id.trim() === '') {
            return { success: false, error: "キャンバスIDが不正です" };
        }

        // 名前チェック
        if (!canvasJSON.name || canvasJSON.name.trim() === '') {
            return { success: false, error: "キャンバス名が不正です" };
        }

        // 配置物リストの基本検証
        if (!Array.isArray(canvasJSON.配置物リスト)) {
            return { success: false, error: "配置物リストの形式が不正です" };
        }

        // 配置物数の実用的制限（パフォーマンス考慮）
        if (canvasJSON.配置物リスト.length > 1000) {
            return { 
                success: false, 
                error: "配置物が多すぎます（最大1000個まで）" 
            };
        }

        return { success: true, data: undefined };
    }
}