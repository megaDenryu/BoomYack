import { DivC, LV2HtmlComponentBase, 描画基準座標, 画面座標点 } from "SengenUI/index";
import { 描画キャンバスリポジトリ } from "../../API/I描画キャンバスAPIリポジトリ";
import { ボード基準座標変換 } from "../../キャンバス操作/座標変換/ボード基準座標変換";
import { グローバルイベントを購読する } from "../../グローバルイベント購読";
import { CanvasGraphModel } from "./CanvasGraphModel";
import { CanvasItemFactory } from "./CanvasItemFactory";
import { CanvasPersistenceManager } from "./CanvasPersistenceManager";
import { CanvasViewOptions, I配置物選択機能集約用のキャンバス機能, 拡縮入力 } from "./CanvasView契約";
import { CanvasView状態 } from "./CanvasView状態";
import { Canvas配置物操作 } from "./Canvas配置物操作";
import { Canvas表示操作 } from "./Canvas表示操作";
import { Canvasキーボード操作 } from "./Canvasキーボード操作";
import { キャンバスルートを構築する } from "./CanvasViewルート";
import { キャンバスグラフ操作サービス } from "./キャンバスグラフ操作サービス";
import { キャンバスコマンドリポジトリ } from "../../キャンバス操作/コマンドリポジトリ/キャンバスコマンドリポジトリ";
import { VoiceRecognitionService } from "../../キャンバス操作/音声認識サービス";

export type { CanvasViewOptions, I配置物選択機能集約用のキャンバス機能, 拡縮入力 } from "./CanvasView契約";

export class CanvasView extends LV2HtmlComponentBase implements I配置物選択機能集約用のキャンバス機能 {
    protected _componentRoot: DivC;
    private readonly 状態: CanvasView状態;
    private readonly 配置物操作: Canvas配置物操作;
    private readonly 表示操作: Canvas表示操作;
    private readonly キーボード操作: Canvasキーボード操作;
    public onDropFile?: (e: DragEvent) => Promise<void>;

    public constructor(options: CanvasViewOptions, repository: 描画キャンバスリポジトリ, 座標変換: ボード基準座標変換) {
        super();
        this.状態 = new CanvasView状態(options, repository, 座標変換, this, () => this.配置物操作.deleteSelectedItem());
        this.配置物操作 = new Canvas配置物操作(this.状態);
        this.表示操作 = new Canvas表示操作(this.状態);
        this.キーボード操作 = new Canvasキーボード操作(this.状態, this.配置物操作);
        this._componentRoot = this._ルートを構築する();
        this.状態.付箋召喚UIを初期化(text => this.配置物操作.付箋召喚を開始する(text));
        this.状態.model.subscribe(e => this.表示操作.handleGraphEvent(e));
        this.状態.keydown購読 = グローバルイベントを購読する(document, "keydown", e => this.キーボード操作.handleGlobalKeyDown(e));
    }

    protected _ルートを構築する(): DivC {
        return キャンバスルートを構築する(this.状態, this.配置物操作, this.表示操作, this.キーボード操作, e => this.onDropFile?.(e));
    }
    public get model(): CanvasGraphModel { return this.状態.model; }
    public get factory(): CanvasItemFactory { return this.状態.factory; }
    public get persistence(): CanvasPersistenceManager { return this.状態.persistence; }
    public get グラフ操作サービス(): キャンバスグラフ操作サービス { return this.状態.グラフ操作サービス; }
    public get commandRepository(): キャンバスコマンドリポジトリ { return this.状態.commandRepository; }
    public get voiceRecognitionService(): VoiceRecognitionService { return this.状態.voiceRecognitionService; }
    public get canvasId(): string { return this.状態.options.canvasId || "default"; }
    public get 描画基準座標(): 描画基準座標 { return this.model.描画基準座標; }
    public update描画基準座標原点(pos: 画面座標点): void { this.model.update描画基準座標原点(pos); }
    public 全ての接続点を表示非表示切り替え(表示: boolean): void { this.表示操作.全接続点を切り替える(表示); }
    public scaleUpdate(input: 拡縮入力): void { this.表示操作.scaleUpdate(input); }
    public setCanvasIdAndName(id: string, name: string): void { this.配置物操作.setCanvasIdAndName(id, name); }
    public setCanvasId(id: string): void { this.配置物操作.setCanvasId(id); }
    public 全配置物クリア(): void { this.model.全配置物クリア(); }
    public delete(): void {
        super.delete();
        this.状態.contextMenuContainer.delete();
        this.状態.keydown購読?.解除する();
        this.状態.fudaba検索ダイアログ?.delete();
        this.表示操作.再描画予約を解除する();
    }
}
