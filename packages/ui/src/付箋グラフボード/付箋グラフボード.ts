import { canvas, div, CanvasC, DivC, LV2HtmlComponentBase } from "SengenUI/index";
import { DropFileLoader } from "TypeScriptBenriKakuchou/FileSystem/ローダー/DropFileLoader";

import { I描画キャンバスAPIリポジトリ } from "BoomYack/基本オブジェクト/API/I描画キャンバスAPIリポジトリ";
import { 描画キャンバスローカルリポジトリ } from "BoomYack/基本オブジェクト/API/描画キャンバスAPIリポジトリ";
import { ボード外部更新監視 } from "BoomYack/基本オブジェクト/API/ボード外部更新監視";
import { ボード外部更新の受信 } from "BoomYack/基本オブジェクト/API/ボード外部更新の受信";
import { ボード基準座標変換 } from "BoomYack/基本オブジェクト/キャンバス操作/座標変換/ボード基準座標変換";
import { セーブパネル } from "BoomYack/基本オブジェクト/キャンバス操作/セーブパネル";
import { JSON読み込みサービス } from "BoomYack/基本オブジェクト/ファイル入出力/JSON読み込みサービス";
import { 描画キャンバスデータバリデーター } from "BoomYack/基本オブジェクト/ファイル入出力/描画キャンバスデータバリデーター";
import { ボード購読台帳 } from "BoomYack/基本オブジェクト/ボード購読台帳";
import { 配置物zIndex } from "BoomYack/基本オブジェクト/I配置物";
import { CanvasView, CanvasViewOptions } from "BoomYack/基本オブジェクト/描画キャンバス/描画キャンバスView分解/CanvasView";
import { セーブパネルイベントを作る } from "./セーブパネルイベント";
import { GlobalMouseManager } from "./付箋グラフボード入力";
import { ウインドウの大きさの変化への追従 } from "./ウインドウの大きさの変化への追従";
import { sticky_graph_board_container } from "./style.css";
import { 見えている範囲への追従 } from "./見えている範囲への追従";
import { ボードの操作開始の通知先, 操作開始を知らせる先の無いボード } from "./ボードの操作開始の通知先";
import { 付箋グラフボードの依存 } from "./付箋グラフボードの依存";

export { GlobalMouseManager, WindowSize, WindowSizeScaleObserver } from "./付箋グラフボード入力";
export type { UpdateWindowSizeInfo } from "./付箋グラフボード入力";

/**
 * 付箋グラフのボード1枚。window/documentへの購読はすべて購読台帳が持ち、delete()で台帳ごと解除する。
 * キー操作・ホイールは操作対象の間だけ受ける。操作対象でないときに中を押されたら、通知先へ知らせる。
 */
export class StickyGraphBoard extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private readonly 購読台帳 = new ボード購読台帳();
    private readonly api: I描画キャンバスAPIリポジトリ;
    private readonly local: 描画キャンバスローカルリポジトリ;
    private readonly 座標変換: ボード基準座標変換;
    private readonly json読み込み: JSON読み込みサービス;
    private 描画キャンバスView: CanvasView;
    private testCanvas: CanvasC;
    private セーブパネル: セーブパネル;
    private readonly 見えている範囲への追従: 見えている範囲への追従;
    private readonly 操作開始の通知先: ボードの操作開始の通知先;

    public constructor(props: 付箋グラフボードの依存) {
        super();
        this.api = props.apiリポジトリ;
        this.操作開始の通知先 = props.操作開始の通知先 ?? new 操作開始を知らせる先の無いボード();
        this.local = new 描画キャンバスローカルリポジトリ();
        this.座標変換 = new ボード基準座標変換(() => this._componentRoot.dom.element);
        this.見えている範囲への追従 = new 見えている範囲への追従(this.座標変換);
        this._componentRoot = this._ルートを構築する();
        this.json読み込み = new JSON読み込みサービス(
            new DropFileLoader(), new 描画キャンバスデータバリデーター()
        );
        const ポインタ = new GlobalMouseManager(
            input => this.描画キャンバスView.scaleUpdate(input), this.座標変換, this.購読台帳, this._componentRoot
        );
        new ウインドウの大きさの変化への追従(this.描画キャンバスView, ポインタ, this.購読台帳);
        if (this.api.isAvailable) new ボード外部更新監視({
            現在のボードIDを得る: () => this.描画キャンバスView.canvasId || null,
            既知のrevisionを得る: canvasId => this.api.記録済みrevision(canvasId),
        }, props.外部更新の受信 ?? new ボード外部更新の受信(), this.購読台帳);
    }

    public 操作対象にする(): void { this.購読台帳.操作対象にする(); }
    public 操作対象から外す(): void { this.購読台帳.操作対象から外す(); }

    /** ボードを捨てる。保存していない変更は失われる。ゴミ箱へ移した保存データは保存先に残る。 */
    public delete(): void {
        this.購読台帳.すべて解除する();
        this.描画キャンバスView.delete();
        super.delete();
    }

    protected _ルートを構築する(): DivC {
        this.セーブパネル = new セーブパネル(セーブパネルイベントを作る(
            () => this.描画キャンバスView, this.api, this.local
        ), this.購読台帳);
        const options: CanvasViewOptions = {
            canvasId: "sticky-graph-board",
            onSaveClick: () => this.セーブパネル.開く()
        };
        return div({ class: sticky_graph_board_container }).onScroll(() => this.見えている範囲への追従.スクロール量へ合わせる())
            .addTypedEventListener("pointerdown", () => this.操作され始めた(), true)
            .addTypedEventListener("focus", () => this.操作され始めた(), true)
            .childs([
            new CanvasView(options, { api: this.api, local: this.local }, this.座標変換, this.購読台帳)
                .tap(self => { this.描画キャンバスView = self; self.onDropFile = this.onDropFile; })
                .tap(self => self.見えている範囲に固定する要素一覧.forEach(要素 => this.見えている範囲への追従.登録する(要素)))
                .setStyleCSS({ zIndex: 配置物zIndex.キャンバス.描画キャンバス }),
            canvas()
                .tap(self => {
                    this.testCanvas = self;
                    this.見えている範囲への追従.登録する(self);
                    self.setWidth(window.innerWidth);
                    self.setHeight(window.innerHeight);
                })
                .setStyleCSS({ position: "absolute", width: "100%", height: "100%", top: "0", left: "0",
                    zIndex: 配置物zIndex.お絵描きキャンバス }),
            this.セーブパネル.tap(self => { this.見えている範囲への追従.登録する(self); })
        ]);
    }

    // 分割表示で並んだ別のボードを押したときに、キー操作の行き先をそのボードへ移すため、キャプチャで先に受ける。
    private 操作され始めた(): void { if (!this.購読台帳.操作対象か) this.操作開始の通知先.ボードが操作され始めた(); }

    private onDropFile = async (event: DragEvent): Promise<void> => {
        console.log("ファイルドロップ検出", event);
        const json = await this.json読み込み.ドロップイベントから読み込み(event);
        if (json.typeName === "描画キャンバスデータ") {
            this.local.保存(json.data);
            this.セーブパネル.importLocalRepository(json.data);
        } else console.error("JSON読み込みエラー:", json.error);
    };
}
