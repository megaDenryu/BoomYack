import { 描画座標点 } from "SengenUI/index";
import { AiOperationService } from "../../AI連携/AiOperationService";
import { FudabaAPIクライアント } from "../../Fudaba連携/FudabaAPIクライアント";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { Iキャンバスコマンド } from "../../キャンバス操作/コマンドリポジトリ/Iキャンバスコマンド";
import { VoiceRecognitionService } from "../../キャンバス操作/音声認識サービス";
import { コンテキストメニューコンテナ } from "../../キャンバス操作/円状コンテキストメニュー/コンテキストメニューコンテナ";
import { ボード基準座標変換 } from "../../キャンバス操作/座標変換/ボード基準座標変換";
import { 折れ線矢印VM, 折れ線矢印集約 } from "../../配置物";
import { 付箋集約 } from "../../配置物/付箋2/付箋集約";
import { なめらか曲線矢印VM } from "../../配置物/なめらか曲線矢印/なめらか曲線矢印VM";
import { なめらか曲線矢印集約 } from "../../配置物/なめらか曲線矢印/なめらか曲線矢印集約";
import { 配置物データ } from "../データクラス";
import { CanvasGraphModel, ICanvasItemFactory } from "./CanvasGraphModel";
import { キャンバスグラフ操作サービス } from "./キャンバスグラフ操作サービス";
import { 付箋Factory } from "./付箋Factory";
import { 付箋設定パネル表示 } from "./付箋設定パネル表示";
import { 矢印Factory } from "./矢印Factory";

export class CanvasItemFactory implements ICanvasItemFactory {
    private readonly _付箋: 付箋Factory;
    private readonly _矢印: 矢印Factory;

    public constructor(model: CanvasGraphModel, selection: I配置物選択機能集約,
        contextMenu: コンテキストメニューコンテナ, graph: キャンバスグラフ操作サービス,
        voice: VoiceRecognitionService, onDelete: () => void,
        onCommandPush: ((command: Iキャンバスコマンド) => void) | undefined,
        座標変換: ボード基準座標変換, fudaba: FudabaAPIクライアント) {
        const ai = new AiOperationService(model, onCommandPush);
        const settings = new 付箋設定パネル表示(model, 座標変換);
        const menu = { selection, graph, ai, voice, settings, 座標変換, onDelete, onCommandPush };
        this._付箋 = new 付箋Factory(model, { model, selection, contextMenu, fudaba, menu, onCommandPush });
        this._矢印 = new 矢印Factory(model, selection, onCommandPush);
    }

    public create付箋(pos: 描画座標点, text?: string, id?: string): 付箋集約<描画座標点> {
        return this._付箋.create付箋(pos, text, id);
    }
    public createタイトル付き付箋(pos: 描画座標点, id?: string): 付箋集約<描画座標点> {
        return this._付箋.createタイトル付き付箋(pos, id);
    }
    public create札参照付箋(pos: 描画座標点, 札ID: string, id?: string): 付箋集約<描画座標点> {
        return this._付箋.create札参照付箋(pos, 札ID, id);
    }
    public create折れ線矢印(vm: 折れ線矢印VM<描画座標点>): 折れ線矢印集約<描画座標点> {
        return this._矢印.create折れ線矢印(vm);
    }
    public createなめらか曲線矢印(vm: なめらか曲線矢印VM<描画座標点>): なめらか曲線矢印集約<描画座標点> {
        return this._矢印.createなめらか曲線矢印(vm);
    }

    public createItemFromData(data: 配置物データ) {
        switch (data.type) {
            case "付箋": return this._付箋.create付箋FromData(data);
            case "折れ線矢印": return this._矢印.create折れ線矢印FromData(data);
            case "なめらか曲線矢印": return this._矢印.createなめらか曲線矢印FromData(data);
            default:
                console.warn(`未対応の配置物タイプ: ${(data as { type: string }).type}`);
                return null;
        }
    }
}
