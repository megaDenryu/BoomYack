import { Px2DVector, Px長さ, 描画座標点 } from "SengenUI/index";
import { AiApiRepository, 分解戦略 } from "./AiApiRepository";
import { CanvasGraphModel } from "../描画キャンバス/描画キャンバスView分解/CanvasGraphModel";
import { 矢印接続可能付箋Old } from "../配置物/付箋2/矢印接続可能付箋Old";
import { 付箋選択状態 } from "../配置物/付箋2/自動リサイズ付箋View";
import { Toast } from "../../../OneONetUIComponents/Toast/Toast";

/**
 * キャンバス上のAI機能（テキスト生成・分解）のビジネスロジックを担うサービス
 */
export class AiOperationService {
    private _repository: AiApiRepository;

    constructor(private _model: CanvasGraphModel) {
        this._repository = new AiApiRepository();
    }

    /**
     * AIテキスト生成（続きを生成）を実行
     */
    public async executeGenerate(起点付箋: 矢印接続可能付箋Old<描画座標点>): Promise<void> {
        const prompt = 起点付箋.text;
        if (!prompt) return;

        // Draft状態をモック
        起点付箋.view.set選択状態(付箋選択状態.ホバー); // 本来は Draft 用のステートがあればそれを使用

        try {
            const res = await this._repository.generateText({ プロンプト: prompt });
            if (res.success && res.生成テキスト) {
                // 右側に新しい付箋を生成
                const newPos = 起点付箋.描画座標点.plus(new Px2DVector(new Px長さ(300), new Px長さ(0)));
                const 新付箋 = this._model.描画座標点でadd付箋(newPos, res.生成テキスト);

                // 矢印で繋ぐ（内部でCanvasGraphModelに追加される）
                起点付箋.別の付箋へ矢印を作る(新付箋);
                Toast.success("AI生成が完了しました");
            } else {
                Toast.error(`AI生成エラー: ${res.エラーメッセージ}`);
            }
        } catch (e) {
            Toast.error(`ネットワークエラー: ${String(e)}`);
            console.error("AI Generate Exception:", e);
        } finally {
            起点付箋.view.set選択状態(付箋選択状態.なし);
        }
    }

    /**
     * ノード分解を実行
     */
    public async executeDecompose(対象付箋: 矢印接続可能付箋Old<描画座標点>, 戦略?: 分解戦略): Promise<void> {
        const text = 対象付箋.text;
        if (!text) return;

        対象付箋.view.set選択状態(付箋選択状態.ホバー);

        try {
            const res = await this._repository.decomposeText({ テキスト: text, 戦略: 戦略 });
            if (res.success && res.子ノードリスト) {
                // 親のテキストを要約で上書き
                if (res.親要約) {
                    対象付箋.view.設定を適用(対象付箋.get設定状態()); // 再描画用
                    // ただし、テキストを直接上書きするメソッドが現状見当たらないため、
                    // Viewを作り直すか、テキストエリアにアクセスするハックが必要かもしれない。
                    // 今回はひとまず子ノードの展開だけ行う
                }

                let currentYOffset = new Px長さ(150);
                for (const child of res.子ノードリスト) {
                    const newPos = 対象付箋.描画座標点.plus(new Px2DVector(new Px長さ(300), currentYOffset));
                    const 新付箋 = this._model.描画座標点でadd付箋(newPos, child.テキスト);
                    
                    // 矢印で繋ぐ（内部でCanvasGraphModelに追加される）
                    対象付箋.別の付箋へ矢印を作る(新付箋);

                    currentYOffset = currentYOffset.plus(new Px長さ(200));
                }
                Toast.success("ノードの分解が完了しました");
            } else {
                Toast.error(`分解エラー: ${res.エラーメッセージ}`);
            }
        } catch (e) {
            Toast.error(`ネットワークエラー: ${String(e)}`);
            console.error("AI Decompose Exception:", e);
        } finally {
            対象付箋.view.set選択状態(付箋選択状態.なし);
        }
    }
}
