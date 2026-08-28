import { 描画座標点 } from "SengenUI/index";
import { AiApiRepository, 分解戦略 } from "./AiApiRepository";
import { CanvasGraphModel } from "../描画キャンバス/描画キャンバスView分解/CanvasGraphModel";
import { 付箋集約 } from "../配置物/付箋2/付箋集約";
import { 付箋選択状態 } from "../配置物/付箋2/自動リサイズ付箋View";
import { Toast } from "OneONetUIComponents/Toast/Toast";
import { Iキャンバスコマンド } from "../キャンバス操作/コマンドリポジトリ/Iキャンバスコマンド";
import { 配置物追加コマンド } from "../キャンバス操作/コマンドリポジトリ/具体的なコマンド群";
import { AI分解付箋を作る, AI続き付箋を作る } from "./Ai生成物構築";

/**
 * キャンバス上のAI機能（テキスト生成・分解）のビジネスロジックを担うサービス
 */
export class AiOperationService {
    private _repository: AiApiRepository;

    constructor(
        private _model: CanvasGraphModel,
        private _onCommandPush?: (cmd: Iキャンバスコマンド) => void
    ) {
        this._repository = new AiApiRepository();
    }

    /**
     * AIテキスト生成（続きを生成）を実行
     */
    public async executeGenerate(起点付箋: 付箋集約<描画座標点>): Promise<void> {
        const prompt = 起点付箋.text;
        if (!prompt) return;

        // Draft状態をモック
        起点付箋.view.set選択状態(付箋選択状態.ホバー); // 本来は Draft 用のステートがあればそれを使用

        try {
            const res = await this._repository.generateText({ プロンプト: prompt });
            if (res.success && res.生成テキスト) {
                const addedItems = AI続き付箋を作る(this._model, 起点付箋, res.生成テキスト);
                if (this._onCommandPush) {
                    this._onCommandPush(new 配置物追加コマンド(this._model, addedItems));
                }
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
    public async executeDecompose(対象付箋: 付箋集約<描画座標点>, 戦略?: 分解戦略): Promise<void> {
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

                const texts = res.子ノードリスト.map(child => child.テキスト);
                const addedItems = AI分解付箋を作る(this._model, 対象付箋, texts);
                if (this._onCommandPush && addedItems.length > 0) {
                    this._onCommandPush(new 配置物追加コマンド(this._model, addedItems));
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
