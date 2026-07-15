import { DivC, PointerWife, 描画座標点 } from "SengenUI/index";
import { 描画キャンバスリポジトリ } from "../../API/I描画キャンバスAPIリポジトリ";
import { コンテキストメニューコンテナ } from "../../キャンバス操作/円状コンテキストメニュー/コンテキストメニューコンテナ";
import { Iコンテキストメニュー } from "../../キャンバス操作/円状コンテキストメニュー/円状コンテキストメニュー";
import { 配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { キャンバスコマンドリポジトリ } from "../../キャンバス操作/コマンドリポジトリ/キャンバスコマンドリポジトリ";
import { VoiceRecognitionService } from "../../キャンバス操作/音声認識サービス";
import { ボード基準座標変換 } from "../../キャンバス操作/座標変換/ボード基準座標変換";
import { FudabaAPIクライアント } from "../../Fudaba連携/FudabaAPIクライアント";
import { Fudaba札検索ダイアログ } from "../../Fudaba連携/Fudaba札検索ダイアログ";
import { グローバルイベント購読ハンドル } from "../../グローバルイベント購読";
import { 付箋召喚UI } from "../../配置物/付箋2/付箋召喚UI";
import type { 付箋召喚ドラッグ対象 } from "../../配置物/付箋2/付箋召喚UI";
import { CanvasGraphModel } from "./CanvasGraphModel";
import { CanvasItemFactory } from "./CanvasItemFactory";
import { CanvasPersistenceManager } from "./CanvasPersistenceManager";
import { CanvasViewOptions, I配置物選択機能集約用のキャンバス機能 } from "./CanvasView契約";
import { キャンバスグラフ操作サービス } from "./キャンバスグラフ操作サービス";
import { まとめて移動サービス } from "./まとめて移動サービス";
import MicOnIcon from '../../../SVGImg/MicOn.svg?url';
import MicOffIcon from '../../../SVGImg/MicOff.svg?url';

export class CanvasView状態 {
    public readonly model = new CanvasGraphModel();
    public readonly commandRepository = new キャンバスコマンドリポジトリ();
    public readonly contextMenuContainer = new コンテキストメニューコンテナ();
    public readonly fudabaAPIクライアント = new FudabaAPIクライアント();
    public readonly selectionManager: 配置物選択機能集約;
    public readonly グラフ操作サービス: キャンバスグラフ操作サービス;
    public readonly voiceRecognitionService: VoiceRecognitionService;
    public readonly factory: CanvasItemFactory;
    public readonly persistence: CanvasPersistenceManager;
    public menu?: Iコンテキストメニュー;
    public 配置物コンテナ!: DivC;
    public recordingIndicator: DivC | null = null;
    public fudaba検索ダイアログ: Fudaba札検索ダイアログ | null = null;
    public 付箋召喚UI!: 付箋召喚UI;
    public mouseWife?: PointerWife;
    public keydown購読?: グローバルイベント購読ハンドル;
    public currentScale = 1;
    public 再描画予約済み = false;
    public 再描画ID: number | null = null;

    public constructor(public readonly options: CanvasViewOptions, repository: 描画キャンバスリポジトリ,
        public readonly 座標変換: ボード基準座標変換, canvas機能: I配置物選択機能集約用のキャンバス機能, deleteSelected: () => void) {
        this.selectionManager = new 配置物選択機能集約(canvas機能, new まとめて移動サービス(), () => this.付箋召喚UI?.ホバー表示を解除する());
        this.グラフ操作サービス = new キャンバスグラフ操作サービス(this.model, () => this.model.metadata.name, 座標変換);
        this.voiceRecognitionService = new VoiceRecognitionService(this.selectionManager);
        this.voiceRecognitionService.onStateChange(isRecording => this.録音状態を反映する(isRecording));
        this.factory = new CanvasItemFactory(this.model, this.selectionManager, this.contextMenuContainer,
            this.グラフ操作サービス, this.voiceRecognitionService, deleteSelected,
            cmd => this.commandRepository.push(cmd), 座標変換, this.fudabaAPIクライアント);
        this.model.setFactory(this.factory);
        this.persistence = new CanvasPersistenceManager(this.model, this.factory, repository);
    }

    public 付箋召喚UIを初期化(on開始: (text: string) => 付箋召喚ドラッグ対象): void {
        this.付箋召喚UI = new 付箋召喚UI(描画座標点.fromNumbers(0, 0, this.model.描画基準座標)).配線する({
            on召喚開始: on開始, onHover開始: () => this.selectionManager.ホバー解除(),
        });
        this.配置物コンテナ.child(this.付箋召喚UI);
    }
    private 録音状態を反映する(録音中: boolean): void {
        this.menu?.updateItem?.("L1-mic", 録音中
            ? { iconUrl: MicOnIcon, backgroundColor: "rgba(231, 76, 60, 0.85)" }
            : { iconUrl: MicOffIcon });
        this.recordingIndicator?.setStyleCSS({ display: 録音中 ? "flex" : "none" });
    }
}
