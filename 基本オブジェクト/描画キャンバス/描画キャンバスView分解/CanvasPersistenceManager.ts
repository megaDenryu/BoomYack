import { CanvasGraphModel } from "./CanvasGraphModel";
import { CanvasItemFactory } from "./CanvasItemFactory";
import { I描画キャンバスJSON, 描画キャンバスデータ, 座標データ, キャンバスメタデータ } from "../データクラス";
import { キャンバスID } from "../../ID";
import { 描画キャンバスリポジトリ } from "../../API/I描画キャンバスAPIリポジトリ";
import { キャンバスデータを復元する } from "./CanvasDataRestorer";

export class CanvasPersistenceManager {
    constructor(
        private model: CanvasGraphModel,
        private factory: CanvasItemFactory,
        private repository: 描画キャンバスリポジトリ
    ) { }

    public async save(canvasId: string): Promise<{ success: boolean; message: string }> {
        return await this.repository.api.保存(this.toJSONStructure(canvasId));
    }

    public localSave(canvasId: string): void {
        this.repository.local.保存(this.toJSONStructure(canvasId));
    }

    public async load(canvasId: string): Promise<boolean> {
        const json = await this.repository.api.読み込み(canvasId);
        if (!json) return false;
        return this.restoreJSON(json);
    }

    public localLoad(canvasId: string): boolean {
        const json = this.repository.local.読み込み(canvasId);
        if (!json) return false;
        return this.restoreJSON(json);
    }

    public serialize(): 描画キャンバスデータ {
        const id = this.model.metadata.id ? this.model.metadata.id.id : "default";
        return this.toJSONStructure(id);
    }

    public toJSONStructure(canvasId: string = "default"): 描画キャンバスデータ {
        const metadata = キャンバスメタデータ.create(
            new キャンバスID(canvasId),
            this.model.metadata.name,
            this.model.metadata.createdAt,
            new Date()
        );
        return 描画キャンバスデータ.create(
            "1.0.0",
            metadata,
            座標データ.fromPx2DVector(this.model.描画基準座標.描画原点.px2DVector),
            this.model.配置物リスト.map(item => item.toシリアライズデータ())
        );
    }

    public restoreFromData(data: 描画キャンバスデータ): boolean {
        キャンバスデータを復元する(this.model, this.factory, data);
        return true;
    }

    public toJSON(canvasId: string): string {
        return JSON.stringify(this.toJSONStructure(canvasId), null, 2);
    }

    private restoreJSON(json: I描画キャンバスJSON): boolean {
        try {
            return this.restoreFromData(描画キャンバスデータ.fromJSON(json));
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}
