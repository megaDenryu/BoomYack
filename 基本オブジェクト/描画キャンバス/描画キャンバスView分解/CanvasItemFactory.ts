import { Px2DVector, Px長さ, ビューポート座標値, 描画座標点 } from "SengenUI/index";
import { 矢印接続可能付箋Old } from "../../配置物/付箋2/矢印接続可能付箋Old";
import { 矢印VM } from "../../配置物/折れ線矢印/矢印集約";
import { 折れ線矢印VM, 折れ線矢印集約 } from "../../配置物";


import { 付箋ID } from "../../ID";
import { CanvasGraphModel, ICanvasItemFactory } from "./CanvasGraphModel";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { コンテキストメニューコンテナ } from "../../キャンバス操作/円状コンテキストメニュー/コンテキストメニューコンテナ";
import { 付箋データ, 矢印データ, 折れ線矢印データ, 配置物データ } from "../データクラス";
import { 付箋設定パネル, 付箋設定状態 } from "../../配置物/設定パネル";
import { 配置物衝突判定サービス } from "./配置物衝突判定サービス";
import { AiOperationService } from "../../AI連携/AiOperationService";
import { キャンバスグラフ操作サービス } from "./キャンバスグラフ操作サービス";
import { I付箋View } from "../../I配置物";
import { Iキャンバスコマンド } from "../../キャンバス操作/コマンドリポジトリ/Iキャンバスコマンド";
import { 配置物テキスト変更コマンド, 配置物移動コマンド, 配置物追加コマンド, 配置物矢印変更コマンド } from "../../キャンバス操作/コマンドリポジトリ/具体的なコマンド群";
import { VoiceRecognitionService } from "../../キャンバス操作/音声認識サービス";

export class CanvasItemFactory implements ICanvasItemFactory {
    private 衝突判定サービス: 配置物衝突判定サービス;
    private _aiOperation: AiOperationService;

    constructor(
        private model: CanvasGraphModel,
        private selectionManager: I配置物選択機能集約,
        private contextMenuContainer: コンテキストメニューコンテナ,
        private graphService: キャンバスグラフ操作サービス,
        private voiceRecognitionService: VoiceRecognitionService,
        private onDeleteItem: () => void, // 削除コールバック
        private onCommandPush?: (cmd: Iキャンバスコマンド) => void
    ) {
        this.衝突判定サービス = new 配置物衝突判定サービス();
        this._aiOperation = new AiOperationService(this.model, this.onCommandPush);
    }

    public create付箋(pos: 描画座標点, text?: string): 矢印接続可能付箋Old<描画座標点> {
        let dragStartPos: 描画座標点 | null = null;
        const 付箋 = new 矢印接続可能付箋Old<描画座標点>(
            {
                position: pos,
                size: new Px2DVector(new Px長さ(200), new Px長さ(50)),
                minHeight: new Px長さ(50),
                text: text ?? "",
                コンテキストメニューコンテナ: this.contextMenuContainer,
                onTextCommit: (oldText: string, newText: string) => {
                    this.onCommandPush?.(new 配置物テキスト変更コマンド(付箋, oldText, newText));
                },
                onDragStart: () => {
                    dragStartPos = 付箋.描画座標点;
                },
                onDragEnd: () => {
                    if (dragStartPos) {
                        const dragEndPos = 付箋.描画座標点;
                        if (!dragStartPos.px2DVector.equals(dragEndPos.px2DVector)) {
                            this.onCommandPush?.(new 配置物移動コマンド(付箋, dragStartPos, dragEndPos));
                        }
                    }
                }
            }, 
            {
                i矢印生成先: {
                    add折れ線矢印: (vm) => {
                        const arrow = this.model.add折れ線矢印(vm);
                        this.onCommandPush?.(new 配置物追加コマンド(this.model, arrow));
                        return arrow;
                    },
                    未接続の点ハンドルを接続点と接続をtryする: (接続点) => this.model.未接続の点ハンドルを接続点と接続をtryする(接続点)
                },
                i描画空間: this.model,
                i配置物選択機能集約: this.selectionManager
            },
            new 付箋ID(),
            {
                on削除: this.onDeleteItem,
                on設定パネル表示: (位置: 描画座標点) => this.設定パネルを表示する(付箋, 位置),
                onAI生成: () => { this._aiOperation.executeGenerate(付箋); },
                onAI分解_LLM: () => { this._aiOperation.executeDecompose(付箋, "意味クラスタ"); },
                onAI分解_区切り文字: () => { this._aiOperation.executeDecompose(付箋, "文単位"); },
                onグラフをテキストとしてコピー: () => { this.graphService.グラフをテキストとしてコピー(付箋); },
                onグラフをJSON出力: () => { this.graphService.グラフを選択してjsonファイル出力(付箋); },
                on選択配置物をコピー: () => { this.graphService.選択中の配置物をコピー(this.selectionManager.選択中配置物); },
                onクリップボードから貼り付け: (e: MouseEvent) => { this.graphService.クリップボードから貼り付け(e, this.onCommandPush); },
                onグラフ選択: () => {
                    const グラフ = this.graphService.グラフを選択(付箋);
                    if (グラフ) {
                        for (const item of グラフ.配置物集約リスト) {
                            this.selectionManager.追加選択(item);
                        }
                    }
                },
                onマイク入力トグル: () => { this.voiceRecognitionService.toggleRecording(); },
                getマイク入力状態: () => this.voiceRecognitionService.getIsRecording(),
                onマイク状態監視登録: (callback) => { this.voiceRecognitionService.onStateChange(callback); }
            }
        );
        return 付箋;
    }
    
    public create付箋FromData(data: 付箋データ): 矢印接続可能付箋Old<描画座標点> {
        let dragStartPos: 描画座標点 | null = null;
        const pos = 描画座標点.fromPx2DVector(data.position.toPx2DVector(), this.model.描画基準座標);
        const 付箋 = new 矢印接続可能付箋Old<描画座標点>(
            {
                position: pos,
                size: data.size.toPx2DVector(),
                minHeight: new Px長さ(50),
                text: data.text,
                コンテキストメニューコンテナ: this.contextMenuContainer,
                onTextCommit: (oldText: string, newText: string) => {
                    this.onCommandPush?.(new 配置物テキスト変更コマンド(付箋, oldText, newText));
                },
                onDragStart: () => {
                    dragStartPos = 付箋.描画座標点;
                },
                onDragEnd: () => {
                    if (dragStartPos) {
                        const dragEndPos = 付箋.描画座標点;
                        if (!dragStartPos.px2DVector.equals(dragEndPos.px2DVector)) {
                            this.onCommandPush?.(new 配置物移動コマンド(付箋, dragStartPos, dragEndPos));
                        }
                    }
                }
            },
            {
                i矢印生成先: {
                    add折れ線矢印: (vm) => {
                        const arrow = this.model.add折れ線矢印(vm);
                        this.onCommandPush?.(new 配置物追加コマンド(this.model, arrow));
                        return arrow;
                    },
                    未接続の点ハンドルを接続点と接続をtryする: (接続点) => this.model.未接続の点ハンドルを接続点と接続をtryする(接続点)
                },
                i描画空間: this.model,
                i配置物選択機能集約: this.selectionManager
            },
            data.id,
            {
                on削除: this.onDeleteItem,
                on設定パネル表示: (位置: 描画座標点) => this.設定パネルを表示する(付箋, 位置),
                onAI生成: () => { this._aiOperation.executeGenerate(付箋); },
                onAI分解_LLM: () => { this._aiOperation.executeDecompose(付箋, "意味クラスタ"); },
                onAI分解_区切り文字: () => { this._aiOperation.executeDecompose(付箋, "文単位"); },
                onグラフをテキストとしてコピー: () => { this.graphService.グラフをテキストとしてコピー(付箋); },
                onグラフをJSON出力: () => { this.graphService.グラフを選択してjsonファイル出力(付箋); },
                on選択配置物をコピー: () => { this.graphService.選択中の配置物をコピー(this.selectionManager.選択中配置物); },
                onクリップボードから貼り付け: (e: MouseEvent) => { this.graphService.クリップボードから貼り付け(e, this.onCommandPush); },
                onグラフ選択: () => {
                    const グラフ = this.graphService.グラフを選択(付箋);
                    if (グラフ) {
                        for (const item of グラフ.配置物集約リスト) {
                            this.selectionManager.追加選択(item);
                        }
                    }
                },
                onマイク入力トグル: () => { this.voiceRecognitionService.toggleRecording(); },
                getマイク入力状態: () => this.voiceRecognitionService.getIsRecording(),
                onマイク状態監視登録: (callback) => { this.voiceRecognitionService.onStateChange(callback); }
            }
        );
        付箋.設定を適用(data.設定状態);
        return 付箋;
    }

    public create折れ線矢印(折れ線矢印vm: 折れ線矢印VM<描画座標点>): 折れ線矢印集約<描画座標点> {
         const arrow = new 折れ線矢印集約(折れ線矢印vm, this.model, this.model , this.selectionManager);
         let startData: 折れ線矢印データ | null = null;
         
         arrow.onハンドルドラッグ開始 = () => {
             startData = arrow.toシリアライズデータ();
         };
         
         arrow.onハンドルドラッグ終了 = () => {
             if (startData) {
                 const endData = arrow.toシリアライズデータ();
                 const startJson = JSON.stringify(startData);
                 const endJson = JSON.stringify(endData);
                 if (startJson !== endJson) {
                     this.onCommandPush?.(new 配置物矢印変更コマンド(arrow, startData, endData, this.model));
                 }
                 startData = null;
             }
         };
         return arrow;
    }
    
    public create折れ線矢印FromData(data: 折れ線矢印データ): 折れ線矢印集約<描画座標点> {
        const 折れ線矢印vm = new 折れ線矢印VM<描画座標点>(
            data.id,
            描画座標点.fromPx2DVector(data.start.toPx2DVector(), this.model.描画基準座標),
            data.中点リスト.map(中点 => 描画座標点.fromPx2DVector(中点.toPx2DVector(), this.model.描画基準座標)),
            描画座標点.fromPx2DVector(data.end.toPx2DVector(), this.model.描画基準座標)
        );
        return this.create折れ線矢印(折れ線矢印vm);
    }
    
    // データから適切なアイテムを生成
    public createItemFromData(data: 配置物データ) {
        switch (data.type) {
            case "付箋": return this.create付箋FromData(data);
            case "折れ線矢印": return this.create折れ線矢印FromData(data);
            default:
                // data.type はUnion型なので通常ここは通らないが、型定義外の値が来た場合のフォールバック
                // console.warn("未対応の配置物タイプ: " + (data as 配置物データ).type); 
                // data は 配置物データ型なので .type にアクセス可能だが、switchで網羅されていればneverになる可能性も。
                // 安全に string として扱うなら以下。
                console.warn(`未対応の配置物タイプ: ${(data as { type: string }).type}`);
                return null;
        }
    }

    private 設定パネルを表示する(付箋: 矢印接続可能付箋Old<描画座標点>, 中心位置: 描画座標点): void {
        // 設定パネルのサイズ（画面座標系で固定）
        const パネル画面幅 = 220;
        const パネル画面高さ = 250;
        
        // 被らない位置を探す（画面座標系のサイズで、ターゲット付箋のみ回避）
        const 表示位置viewport = this.衝突判定サービス.被らない位置を探す(
            中心位置, 
            パネル画面幅, 
            パネル画面高さ,
            this.model.配置物リスト,
            付箋, // ターゲット配置物（これだけは必ず回避）
            this.model.描画基準座標
        );
        
        const 設定パネル = new 付箋設定パネル({
            position: 表示位置viewport,
            初期設定: 付箋.get設定状態(),
            on設定変更: (新設定: 付箋設定状態) => {
                付箋.設定を適用(新設定);
            },
            on閉じる: () => {
                設定パネル.dom.element.remove();
            }
        });
        document.body.appendChild(設定パネル.dom.element);
    }
}
