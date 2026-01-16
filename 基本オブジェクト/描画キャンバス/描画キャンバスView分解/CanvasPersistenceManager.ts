import { 描画座標点, 画面座標点 } from "SengenUI/index";
import { CanvasGraphModel } from "./CanvasGraphModel";
import { CanvasItemFactory } from "./CanvasItemFactory";
import { 描画キャンバスリポジトリ } from "../描画キャンバスAPIリポジトリ";
import { 描画キャンバスデータ, 配置物データ, 接続参照データ, 描画キャンバスJSON, 座標データ, キャンバスメタデータ } from "../データクラス";

import { 矢印接続可能付箋Old } from "../../配置物/付箋2/矢印接続可能付箋Old";
import { 折れ線矢印集約 } from "../../配置物";

import { 接続点 } from "../../配置物/矢印接続可能なもの/接続点";
import { キャンバスID } from "../../ID";

export class CanvasPersistenceManager {
    constructor(
        private model: CanvasGraphModel,
        private factory: CanvasItemFactory,
        private repository: 描画キャンバスリポジトリ
    ) {}

    public async save(canvasId: string): Promise<{ success: boolean; message: string }> {
        const data = this.toJSONStructure(canvasId);
        return await this.repository.api.保存(data);
    }
    
    public localSave(canvasId: string): void {
        const data = this.toJSONStructure(canvasId);
        this.repository.local.保存(data);
    }

    public async load(canvasId: string): Promise<boolean> {
        const json = await this.repository.api.読み込み(canvasId);
        if (!json) return false;
        
        try {
             // JSONからドメインオブジェクトへ復元 (メソッドを持つクラスインスタンスにする)
             const data = 描画キャンバスデータ.fromJSON(json);
             return this.restoreFromData(data);
        } catch (e) {
            console.error(e);
            return false;
        }
    }
    
     public localLoad(canvasId: string): boolean {
        const json = this.repository.local.読み込み(canvasId);
        if (!json) return false;
        try {
             // JSONからドメインオブジェクトへ復元
             const data = 描画キャンバスデータ.fromJSON(json);
             return this.restoreFromData(data);
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public serialize(): 描画キャンバスデータ {
        // metadata.id is explicitly typed as キャンバスID, assuming toString() works or accessing .id property
        return this.toJSONStructure(this.model.metadata.id ? this.model.metadata.id.id : "default");
    }

    // シリアライズデータの生成
    public toJSONStructure(canvasId: string = "default"): 描画キャンバスデータ {
        const items = this.model.配置物リスト.map(item => 
            item.toシリアライズデータ()
        );
        
        // メタデータ更新（ID再設定・更新日時更新）
        // キャンバスメタデータは不変クラスのため安全に再生成する
        const newMetadata = キャンバスメタデータ.create(
            new キャンバスID(canvasId),
            this.model.metadata.name,
            this.model.metadata.createdAt,
            new Date()
        );

        return 描画キャンバスデータ.create(
            "1.0.0",
            newMetadata, 
            座標データ.fromPx2DVector(this.model.描画基準座標.描画原点.px2DVector),
            items
        );
    }

    /**
     * シリアライズデータからキャンバスを復元する
     */
    public restoreFromData(data: 描画キャンバスデータ): boolean {
        this.model.全配置物クリア();

        // 描画原点を復元（呼び出し元でHydration済みであることを前提とする）
        const 新描画原点 = 画面座標点.fromPx2DVector(data.描画原点.toPx2DVector());
        this.model.update描画基準座標原点(新描画原点);

        const 付箋マップ = new Map<string, 矢印接続可能付箋Old<描画座標点>>();
        const 折れ線矢印マップ = new Map<string, 折れ線矢印集約<描画座標点>>();

        // 第1フェーズ: 配置物を生成
        for (const itemData of data.配置物リスト) {
            const item = this.factory.createItemFromData(itemData);
            if (item) {
                    this.model.add配置物(item);
                    
                    // マップ登録
                    if (itemData.type === "付箋") 付箋マップ.set(itemData.id.id, item as 矢印接続可能付箋Old<描画座標点>);
                    else if (itemData.type === "折れ線矢印") 折れ線矢印マップ.set(itemData.id.id, item as 折れ線矢印集約<描画座標点>);
            }
        }

        // 第2フェーズ: 接続を復元
        this.restoreConnections(data.配置物リスト, 付箋マップ, 折れ線矢印マップ);

        return true;
    }

    private restoreConnections(
        配置物リスト: ReadonlyArray<配置物データ>,
        付箋マップ: Map<string, 矢印接続可能付箋Old<描画座標点>>,
        折れ線矢印マップ: Map<string, 折れ線矢印集約<描画座標点>>
    ): void {
        for (const data of 配置物リスト) {
            if (data.type === "折れ線矢印") {
                const 折れ線矢印 = 折れ線矢印マップ.get(data.id.id);
                if (!折れ線矢印) continue;

                if (data.startRef) {
                    const 接続点 = this.getConnectionPointByRef(data.startRef, 付箋マップ);
                    if (接続点) 折れ線矢印.始点ハンドル.接続(接続点);
                }
                if (data.endRef) {
                    const 接続点 = this.getConnectionPointByRef(data.endRef, 付箋マップ);
                    if (接続点) 折れ線矢印.終点ハンドル.接続(接続点);
                }
            }
        }
    }

    private getConnectionPointByRef(
        ref: 接続参照データ,
        付箋マップ: Map<string, 矢印接続可能付箋Old<描画座標点>>
    ): 接続点<描画座標点> | null {
        const 付箋 = 付箋マップ.get(ref.配置物ID.id);
        if (!付箋) return null;

        for (const 接続点 of 付箋.接続点リスト) {
            if (接続点.接続位置 === ref.接続位置) {
                return 接続点;
            }
        }
        return null;
    }
    
    public toJSON(canvasId: string): string {
        const data = this.toJSONStructure(canvasId);
        return JSON.stringify(data, null, 2);
    }
}
