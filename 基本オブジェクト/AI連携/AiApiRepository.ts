import { RequestAPI } from "TypeScriptBenriKakuchou/Web/RequestApi";

// ==========================================
// インターフェース定義
// ==========================================

export interface IAIテキスト生成リクエスト {
    プロンプト: string;
    コンテキスト?: string;
}

export interface IAIテキスト生成レスポンス {
    success: boolean;
    生成テキスト?: string;
    エラーメッセージ?: string;
}

export interface Iノード分解リクエスト {
    テキスト: string;
    戦略?: string; // "意味クラスタ" など
}

export interface I分解結果ノード {
    テキスト: string;
    順序: number;
}

export interface Iノード分解レスポンス {
    success: boolean;
    親要約?: string;
    子ノードリスト: I分解結果ノード[];
    エラーメッセージ?: string;
}

// ==========================================
// AiApiRepository
// ==========================================

/**
 * BoomYack AI関連のサーバー（FastAPI）連携を行うリポジトリクラス
 */
export class AiApiRepository {
    
    /**
     * AIによってテキスト続きを生成する
     */
    public async generateText(request: IAIテキスト生成リクエスト): Promise<IAIテキスト生成レスポンス> {
        return await RequestAPI.postRequest2<IAIテキスト生成レスポンス>(
            "BoomYack/AI/Generate", 
            request
        );
    }

    /**
     * 長文テキストをノードに分解する
     */
    public async decomposeText(request: Iノード分解リクエスト): Promise<Iノード分解レスポンス> {
        // パスが /BoomYack/Decompose になっているので注意
        return await RequestAPI.postRequest2<Iノード分解レスポンス>(
            "BoomYack/Decompose", 
            request
        );
    }
}
