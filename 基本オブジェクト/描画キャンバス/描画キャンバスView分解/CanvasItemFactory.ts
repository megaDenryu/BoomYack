import { Px2DVector, Px長さ, ビューポート座標値, 描画座標点 } from "SengenUI/index";
import { 付箋集約 } from "../../配置物/付箋2/付箋集約";
import { 自動リサイズ付箋Viewオプション } from "../../配置物/付箋2/自動リサイズ付箋View";
import { 矢印VM } from "../../配置物/折れ線矢印/矢印集約";
import { 折れ線矢印VM, 折れ線矢印集約 } from "../../配置物";
import { なめらか曲線矢印VM } from "../../配置物/なめらか曲線矢印/なめらか曲線矢印VM";
import { なめらか曲線矢印集約 } from "../../配置物/なめらか曲線矢印/なめらか曲線矢印集約";


import { 付箋ID } from "../../ID";
import { CanvasGraphModel, ICanvasItemFactory } from "./CanvasGraphModel";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { コンテキストメニューコンテナ } from "../../キャンバス操作/円状コンテキストメニュー/コンテキストメニューコンテナ";
import { 付箋データ, 矢印データ, 折れ線矢印データ, なめらか曲線矢印データ, 配置物データ } from "../データクラス";
import { 付箋コンテンツデータ, 自由テキストコンテンツを作る, タイトル付きコンテンツを作る, 札参照コンテンツを作る } from "../付箋コンテンツデータ";
import { 付箋設定パネル, 付箋設定状態 } from "../../配置物/設定パネル";
import { FudabaAPIクライアント } from "../../Fudaba連携/FudabaAPIクライアント";
import { 配置物衝突判定サービス } from "./配置物衝突判定サービス";
import { AiOperationService } from "../../AI連携/AiOperationService";
import { キャンバスグラフ操作サービス } from "./キャンバスグラフ操作サービス";
import { I付箋View } from "../../I配置物";
import { Iキャンバスコマンド } from "../../キャンバス操作/コマンドリポジトリ/Iキャンバスコマンド";
import { 配置物テキスト変更コマンド, 配置物移動コマンド, 配置物追加コマンド, 配置物矢印変更コマンド, 配置物なめらか曲線矢印変更コマンド } from "../../キャンバス操作/コマンドリポジトリ/具体的なコマンド群";
import { VoiceRecognitionService } from "../../キャンバス操作/音声認識サービス";
import { ボード基準座標変換 } from "../../キャンバス操作/座標変換/ボード基準座標変換";

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
        private onCommandPush: ((cmd: Iキャンバスコマンド) => void) | undefined,
        private 座標変換: ボード基準座標変換,
        private fudabaAPIクライアント: FudabaAPIクライアント
    ) {
        this.衝突判定サービス = new 配置物衝突判定サービス();
        this._aiOperation = new AiOperationService(this.model, this.onCommandPush);
    }

    public create付箋(pos: 描画座標点, text?: string, id?: string): 付箋集約<描画座標点> {
        return this.付箋を構築する(
            pos,
            new Px2DVector(new Px長さ(200), new Px長さ(50)),
            自由テキストコンテンツを作る(text ?? ""),
            new 付箋ID(id)
        );
    }

    public createタイトル付き付箋(pos: 描画座標点, id?: string): 付箋集約<描画座標点> {
        return this.付箋を構築する(
            pos,
            new Px2DVector(new Px長さ(220), new Px長さ(70)),
            タイトル付きコンテンツを作る("", ""),
            new 付箋ID(id)
        );
    }

    public create札参照付箋(pos: 描画座標点, 札ID: string, id?: string): 付箋集約<描画座標点> {
        return this.付箋を構築する(
            pos,
            new Px2DVector(new Px長さ(220), new Px長さ(90)),
            new Px長さ(90),
            札参照コンテンツを作る(札ID),
            new 付箋ID(id)
        );
    }

    public create付箋FromData(data: 付箋データ): 付箋集約<描画座標点> {
        const pos = 描画座標点.fromPx2DVector(data.position.toPx2DVector(), this.model.描画基準座標);
        const 付箋 = this.付箋を構築する(pos, data.size.toPx2DVector(), data.コンテンツ, data.id);
        付箋.設定を適用(data.設定状態);
        return 付箋;
    }

    /**
     * 付箋集約の生成ロジックの共通部分(コンテキストメニュー依存関係の組み立て等)。
     * position/size/初期コンテンツ/idだけを呼び出し側で分岐させ、コンテンツ種別が
     * 増えても生成ロジックの重複が線形に増えない構造にする(設計2026-07-14_付箋コンテンツ設計.md 4.4節)。
     */
    private 付箋を構築する(
        pos: 描画座標点,
        size: Px2DVector,
        初期コンテンツ: 付箋コンテンツデータ,
        id: 付箋ID
    ): 付箋集約<描画座標点> {
        let dragStartPos: 描画座標点 | null = null;
        const オプション: 自動リサイズ付箋Viewオプション<描画座標点> = {
            position: pos,
            size,
            初期コンテンツ,
            コンテキストメニューコンテナ: this.contextMenuContainer,
            fudabaAPIクライアント: this.fudabaAPIクライアント,
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
        };
        const 付箋 = new 付箋集約<描画座標点>(
            オプション,
            {
                i矢印生成先: {
                    add折れ線矢印: (vm) => {
                        const arrow = this.model.add折れ線矢印(vm);
                        this.onCommandPush?.(new 配置物追加コマンド(this.model, arrow));
                        return arrow;
                    },
                    addなめらか曲線矢印: (vm) => {
                        const arrow = this.model.addなめらか曲線矢印(vm);
                        this.onCommandPush?.(new 配置物追加コマンド(this.model, arrow));
                        return arrow;
                    },
                    未接続の点ハンドルを接続点と接続をtryする: (接続点) => this.model.未接続の点ハンドルを接続点と接続をtryする(接続点)
                },
                i描画空間: this.model,
                i配置物選択機能集約: this.selectionManager
            },
            id,
            {
                座標変換: this.座標変換,
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

    public createなめらか曲線矢印(vm: なめらか曲線矢印VM<描画座標点>): なめらか曲線矢印集約<描画座標点> {
        const arrow = new なめらか曲線矢印集約(vm, this.model, this.model, this.selectionManager);
        let startData: なめらか曲線矢印データ | null = null;

        arrow.onハンドルドラッグ開始 = () => {
            startData = arrow.toシリアライズデータ();
        };

        arrow.onハンドルドラッグ終了 = () => {
            if (startData) {
                const endData = arrow.toシリアライズデータ();
                const startJson = JSON.stringify(startData);
                const endJson = JSON.stringify(endData);
                if (startJson !== endJson) {
                    this.onCommandPush?.(new 配置物なめらか曲線矢印変更コマンド(arrow, startData, endData, this.model));
                }
                startData = null;
            }
        };
        return arrow;
    }

    public createなめらか曲線矢印FromData(data: なめらか曲線矢印データ): なめらか曲線矢印集約<描画座標点> {
        const vm = new なめらか曲線矢印VM<描画座標点>(
            data.id,
            描画座標点.fromPx2DVector(data.start.toPx2DVector(), this.model.描画基準座標),
            描画座標点.fromPx2DVector(data.end.toPx2DVector(), this.model.描画基準座標)
        );
        return this.createなめらか曲線矢印(vm);
    }

    // データから適切なアイテムを生成
    public createItemFromData(data: 配置物データ) {
        switch (data.type) {
            case "付箋": return this.create付箋FromData(data);
            case "折れ線矢印": return this.create折れ線矢印FromData(data);
            case "なめらか曲線矢印": return this.createなめらか曲線矢印FromData(data);
            default:
                // data.type はUnion型なので通常ここは通らないが、型定義外の値が来た場合のフォールバック
                // console.warn("未対応の配置物タイプ: " + (data as 配置物データ).type); 
                // data は 配置物データ型なので .type にアクセス可能だが、switchで網羅されていればneverになる可能性も。
                // 安全に string として扱うなら以下。
                console.warn(`未対応の配置物タイプ: ${(data as { type: string }).type}`);
                return null;
        }
    }

    private 設定パネルを表示する(付箋: 付箋集約<描画座標点>, 中心位置: 描画座標点): void {
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
        // document.bodyへ直接appendするとボードルートのtransformが確立する
        // 包含ブロックの外に出てしまい、タブ埋め込み時にoverflow:hiddenのクリップが
        // 効かなくなる。ボードルート配下へ取り付けることで恒等transformの傘下に収める。
        this.座標変換.ルート要素().appendChild(設定パネル.dom.element);
    }
}
