import { canvas, div, CanvasC, DivC, LV2HtmlComponentBase, 画面座標点 } from "SengenUI/index";
import { DropFileLoader } from "TypeScriptBenriKakuchou/FileSystem/ローダー/DropFileLoader";

import { I描画キャンバスAPIリポジトリ } from "BoomYack/基本オブジェクト/API/I描画キャンバスAPIリポジトリ";
import { 描画キャンバスローカルリポジトリ } from "BoomYack/基本オブジェクト/API/描画キャンバスAPIリポジトリ";
import { ボード外部更新監視 } from "BoomYack/基本オブジェクト/API/ボード外部更新監視";
import { ボード基準座標変換 } from "BoomYack/基本オブジェクト/キャンバス操作/座標変換/ボード基準座標変換";
import { セーブパネル } from "BoomYack/基本オブジェクト/キャンバス操作/セーブパネル";
import { JSON読み込みサービス } from "BoomYack/基本オブジェクト/ファイル入出力/JSON読み込みサービス";
import { 描画キャンバスデータバリデーター } from "BoomYack/基本オブジェクト/ファイル入出力/描画キャンバスデータバリデーター";
import { グローバルイベントを購読する } from "BoomYack/基本オブジェクト/グローバルイベント購読";
import { 配置物zIndex } from "BoomYack/基本オブジェクト/I配置物";
import { CanvasView, CanvasViewOptions } from "BoomYack/基本オブジェクト/描画キャンバス/描画キャンバスView分解/CanvasView";
import { セーブパネルイベントを作る } from "./セーブパネルイベント";
import { GlobalMouseManager, WindowSizeScaleObserver } from "./付箋グラフボード入力";
import { sticky_graph_board_container } from "./style.css";

export { GlobalMouseManager, WindowSize, WindowSizeScaleObserver } from "./付箋グラフボード入力";
export type { UpdateWindowSizeInfo } from "./付箋グラフボード入力";

export class StickyGraphBoard extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private readonly windowSizeScaleObserver: WindowSizeScaleObserver;
    private readonly api: I描画キャンバスAPIリポジトリ;
    private readonly local: 描画キャンバスローカルリポジトリ;
    private readonly 座標変換: ボード基準座標変換;
    private readonly json読み込み: JSON読み込みサービス;
    private mouseGlobal: GlobalMouseManager;
    private 描画キャンバスView: CanvasView;
    private testCanvas: CanvasC;
    private セーブパネル: セーブパネル;

    public constructor(props: { apiリポジトリ: I描画キャンバスAPIリポジトリ }) {
        super();
        this.api = props.apiリポジトリ;
        this.local = new 描画キャンバスローカルリポジトリ();
        this.windowSizeScaleObserver = new WindowSizeScaleObserver();
        this.座標変換 = new ボード基準座標変換(() => this._componentRoot.dom.element);
        this._componentRoot = this._ルートを構築する();
        this.json読み込み = new JSON読み込みサービス(
            new DropFileLoader(), new 描画キャンバスデータバリデーター()
        );
        グローバルイベントを購読する(window, "resize", this.windowResize.bind(this));
        this.mouseGlobal = new GlobalMouseManager(
            input => this.描画キャンバスView.scaleUpdate(input), this.座標変換
        );
        if (this.api.isAvailable) {
            new ボード外部更新監視({
                現在のボードIDを得る: () => this.描画キャンバスView.canvasId || null,
                既知のrevisionを得る: canvasId => this.api.記録済みrevision(canvasId),
            }).開始する();
        }
    }

    protected _ルートを構築する(): DivC {
        this.セーブパネル = new セーブパネル(セーブパネルイベントを作る(
            () => this.描画キャンバスView, this.api, this.local
        ));
        const options: CanvasViewOptions = {
            canvasId: "sticky-graph-board",
            onSaveClick: () => this.セーブパネル.開く()
        };
        return div({ class: sticky_graph_board_container }).childs([
            new CanvasView(options, { api: this.api, local: this.local }, this.座標変換)
                .tap(self => { this.描画キャンバスView = self; self.onDropFile = this.onDropFile; })
                .setStyleCSS({ zIndex: 配置物zIndex.キャンバス.描画キャンバス }),
            canvas()
                .tap(self => {
                    this.testCanvas = self;
                    self.setWidth(window.innerWidth);
                    self.setHeight(window.innerHeight);
                })
                .setStyleCSS({ position: "absolute", width: "100%", height: "100%", top: "0", left: "0",
                    zIndex: 配置物zIndex.お絵描きキャンバス }),
            this.セーブパネル
        ]);
    }

    private onDropFile = async (event: DragEvent): Promise<void> => {
        console.log("ファイルドロップ検出", event);
        const json = await this.json読み込み.ドロップイベントから読み込み(event);
        if (json.typeName === "描画キャンバスデータ") {
            this.local.保存(json.data);
            this.セーブパネル.importLocalRepository(json.data);
        } else console.error("JSON読み込みエラー:", json.error);
    };

    private windowResize(): void {
        const info = this.windowSizeScaleObserver.updateWindowSize();
        const mousePos = this.mouseGlobal.mousePos;
        const center: 画面座標点 = this.描画キャンバスView.描画基準座標.描画原点
            .plus(mousePos.px2DVector.times(info.拡縮率 - 1));
        this.描画キャンバスView.update描画基準座標原点(center);
    }
}
