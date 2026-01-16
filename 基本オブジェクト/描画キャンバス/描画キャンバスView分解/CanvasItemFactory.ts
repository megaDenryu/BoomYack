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

export class CanvasItemFactory implements ICanvasItemFactory {
    private 衝突判定サービス: 配置物衝突判定サービス;

    constructor(
        private model: CanvasGraphModel,
        private selectionManager: I配置物選択機能集約,
        private contextMenuContainer: コンテキストメニューコンテナ,
        private onDeleteItem: () => void // 削除コールバック
    ) {
        this.衝突判定サービス = new 配置物衝突判定サービス();
    }

    public create付箋(pos: 描画座標点, text?: string): 矢印接続可能付箋Old<描画座標点> {
        const 付箋 = new 矢印接続可能付箋Old<描画座標点>(
            {
                position: pos,
                size: new Px2DVector(new Px長さ(200), new Px長さ(50)),
                minHeight: new Px長さ(50),
                text: text ?? "",
                コンテキストメニューコンテナ: this.contextMenuContainer,
            }, 
            {
                i配置物リポジトリ: this.model,
                i描画空間: this.model,
                i配置物選択機能集約: this.selectionManager
            },
            new 付箋ID(),
            {
                on削除: this.onDeleteItem,
                on設定パネル表示: (位置: 描画座標点) => this.設定パネルを表示する(付箋, 位置)
            }
        );
        return 付箋;
    }
    
    public create付箋FromData(data: 付箋データ): 矢印接続可能付箋Old<描画座標点> {
        const pos = 描画座標点.fromPx2DVector(data.position.toPx2DVector(), this.model.描画基準座標);
        const 付箋 = new 矢印接続可能付箋Old<描画座標点>(
            {
                position: pos,
                size: data.size.toPx2DVector(),
                minHeight: new Px長さ(50),
                text: data.text,
                コンテキストメニューコンテナ: this.contextMenuContainer,
            },
            {
                i配置物リポジトリ: this.model,
                i描画空間: this.model,
                i配置物選択機能集約: this.selectionManager
            },
            data.id,
            {
                on削除: this.onDeleteItem,
                on設定パネル表示: (位置: 描画座標点) => this.設定パネルを表示する(付箋, 位置)
            }
        );
        return 付箋;
    }

    public create折れ線矢印(折れ線矢印vm: 折れ線矢印VM<描画座標点>): 折れ線矢印集約<描画座標点> {
         return new 折れ線矢印集約(折れ線矢印vm, this.model, this.model , this.selectionManager);
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
                console.warn(`未対応の配置物タイプ: ${(data as {type: string}).type}`);
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
