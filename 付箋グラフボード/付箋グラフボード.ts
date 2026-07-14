import { canvas, div, DivC, LV2HtmlComponentBase, MouseEventData, Px2DVector, Px長さ, CanvasC, 描画座標点, 画面座標点 } from "SengenUI/index";
import { sticky_graph_board_container } from './style.css';
import { ボード基準座標変換 } from 'BoomYack/基本オブジェクト/キャンバス操作/座標変換/ボード基準座標変換';
import { 自動リサイズ付箋View2 } from 'BoomYack/基本オブジェクト/配置物/付箋2/自動リサイズ付箋View2';
import { CanvasView, CanvasViewOptions, 拡縮入力 } from 'BoomYack/基本オブジェクト/描画キャンバス/描画キャンバスView分解/CanvasView';
import { 配置物zIndex } from 'BoomYack/基本オブジェクト/I配置物';
import { Action } from 'TypeScriptBenriKakuchou/アーキテクチャBase';
import { セーブパネル, ISavePanelEvents, SaveMode } from 'BoomYack/基本オブジェクト/キャンバス操作/セーブパネル';
import { 描画キャンバスローカルリポジトリ } from 'BoomYack/基本オブジェクト/API/描画キャンバスAPIリポジトリ';
import { キャンバスメタデータ, 描画キャンバスデータ } from 'BoomYack/基本オブジェクト/描画キャンバス/データクラス';
import { 自動リサイズ付箋View } from 'BoomYack/基本オブジェクト/配置物/付箋2/自動リサイズ付箋View';
import { JSON読み込みサービス } from 'BoomYack/基本オブジェクト/ファイル入出力/JSON読み込みサービス';
import { 描画キャンバスデータバリデーター } from 'BoomYack/基本オブジェクト/ファイル入出力/描画キャンバスデータバリデーター';
import { DropFileLoader } from 'TypeScriptBenriKakuchou/FileSystem/ローダー/DropFileLoader';
import { I描画キャンバスAPIリポジトリ } from "BoomYack/基本オブジェクト/API/I描画キャンバスAPIリポジトリ";
import { グローバルイベントを購読する } from 'BoomYack/基本オブジェクト/グローバルイベント購読';

/**
 * Miroのような付箋グラフボードページ
 * 複数の付箋を配置して、矢印で接続できるキャンバスを提供
 * 
 *  機能：
 *  矢印接続可能付箋の追加方法：左上に矢印接続可能付箋置き場がある。それをドラッグするとその付箋はそのまま好きな場所における。
 * そしてドラッグした瞬間に付箋置き場には新しい付箋が生成される。
 */
export class StickyGraphBoard extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private _一番上の付箋: 自動リサイズ付箋View<描画座標点>|自動リサイズ付箋View2<描画座標点>;
    private _mouseGlobal: GlobalMouseManager;
    private _windowSizeScaleObserver: WindowSizeScaleObserver;
    private _描画キャンバスView: CanvasView;
    private testCanvas: CanvasC;
    private _セーブパネル: セーブパネル;
    private _apiリポジトリ: I描画キャンバスAPIリポジトリ;
    private _ローカルリポジトリ: 描画キャンバスローカルリポジトリ;
    private _json読み込みサービス: JSON読み込みサービス;
    private readonly _座標変換: ボード基準座標変換;

        constructor(props: {
            apiリポジトリ: I描画キャンバスAPIリポジトリ, // デフォルトでサーバーモード利用可能
        }) {
        super();
        
        // リポジトリ初期化
        this._apiリポジトリ = props.apiリポジトリ;
        this._ローカルリポジトリ = new 描画キャンバスローカルリポジトリ();
        
        this._windowSizeScaleObserver = new WindowSizeScaleObserver();
        // サンクで遅延評価する。componentRootはこの後の_ルートを構築する()内で
        // 構築されるが、実際にルート要素へアクセスするのはユーザー操作時（マウス移動等）
        // まで先送りされるため、この時点で未構築でも問題ない。
        this._座標変換 = new ボード基準座標変換(() => this._componentRoot.dom.element);
        this._componentRoot = this._ルートを構築する();
        this._一番上の付箋 = this._描画キャンバスView.add付箋(Px2DVector.fromNumbers(0,0)).view;
        this._一番上の付箋.付箋をめくる動作を登録( this.付箋をめくる動作.bind(this) );
        this._json読み込みサービス = new JSON読み込みサービス(
            new DropFileLoader(),
            new 描画キャンバスデータバリデーター()
        );
        // this.マウスキーボードイベントバインディング()
        グローバルイベントを購読する(window, "resize", this.ブラウザのウインドウが拡縮したときマウスを中心に拡縮したように見せるために座標中心を移動させる.bind(this))
        // スクロールしたときにresizeToを使うようにする
        this._mouseGlobal = new GlobalMouseManager(input => {this._描画キャンバスView.scaleUpdate(input);}, this._座標変換);
        
    }

    /** セーブパネルイベントハンドラを生成 */
    private createSavePanelEvents(): ISavePanelEvents {
        return {
            onSave: async (name: string, mode: SaveMode) => {
                // nameをIDとしても使用（ファイル名として安全な形式にする）
                const safeId = this.toSafeId(name);
                this._描画キャンバスView.setCanvasIdAndName(safeId, name);
                if (mode === "server") {
                    await this._描画キャンバスView.persistence.save(this._描画キャンバスView.canvasId);
                } else {
                    this._描画キャンバスView.persistence.localSave(this._描画キャンバスView.canvasId);
                }
            },
            onLoad: async (id: string, mode: SaveMode) => {
                this._描画キャンバスView.setCanvasId(id);
                if (mode === "server") {
                    await this._描画キャンバスView.persistence.load(this._描画キャンバスView.canvasId);
                } else {
                    this._描画キャンバスView.persistence.localLoad(this._描画キャンバスView.canvasId);
                }
            },
            onDelete: async (id: string, mode: SaveMode) => {
                if (mode === "server") {
                    await this._apiリポジトリ.削除(id);
                } else {
                    this._ローカルリポジトリ.削除(id);
                }
            },
            onRefreshList: async (mode: SaveMode): Promise<キャンバスメタデータ[]> => {
                if (mode === "server") {
                    return await this._apiリポジトリ.一覧取得();
                } else {
                    return this._ローカルリポジトリ.一覧取得();
                }
            },
            onGetCurrentCanvasData: () => {
                return this._描画キャンバスView.persistence.serialize();
            },
            onGetCanvasDataById: async (id: string, mode: SaveMode) => {
                if (mode === "server") {
                    const json = await this._apiリポジトリ.読み込み(id);
                    if (!json) return null;
                    return 描画キャンバスデータ.fromJSON(json);
                } else {
                    const json = this._ローカルリポジトリ.読み込み(id);
                    if (!json) return null;
                    return 描画キャンバスデータ.fromJSON(json);
                }
            },
            onSaveCanvasData: async (canvasData: 描画キャンバスデータ): Promise<void> => {
                // 渡されたキャンバスデータで現在のキャンバスを復元
                this._ローカルリポジトリ.保存(canvasData);
            },
            onIsServerModeAvailable: () => {
                // サーバーモードが利用可能かどうかを判定するロジック
                // ここでは単純にAPIリポジトリのエンドポイントが設定されているかで判定する例を示す
                return this._apiリポジトリ.isAvailable;
            }
        };
    }

    /**
     * 名前からファイル名として安全なIDを生成する
     */
    private toSafeId(name: string): string {
        // 日本語や特殊文字を含む名前をBase64っぽくハッシュ化
        // シンプルに名前をそのまま使うが、ファイル名として危険な文字は除去
        return name.replace(/[<>:"/\\|?*]/g, '_').trim() || 'untitled';
    }

    private onDropFile = async (e: DragEvent) => {
        console.log("ファイルドロップ検出", e);
        const json = await this._json読み込みサービス.ドロップイベントから読み込み(e);
        if (json.typeName === "描画キャンバスデータ") {
            this._ローカルリポジトリ.保存(json.data);
            this._セーブパネル.importLocalRepository(json.data);
        } else {
            console.error("JSON読み込みエラー:", json.error);
        }
        
    }

    protected _ルートを構築する(): DivC {
        // セーブパネルを先に作成（コンテキストメニューから参照するため）
        this._セーブパネル = new セーブパネル(this.createSavePanelEvents());

        // 描画キャンバスViewのオプション（DI）
        const canvasOptions: CanvasViewOptions = {
            canvasId: "sticky-graph-board",
            onSaveClick: () => this._セーブパネル.開く()
        };

        return (
            div({ class: sticky_graph_board_container }).childs([
                    new CanvasView(canvasOptions, {api: this._apiリポジトリ, local: this._ローカルリポジトリ}, this._座標変換)
                        .tap(self => {
                            this._描画キャンバスView = self;
                            self.onDropFile = this.onDropFile;
                        }).setStyleCSS({
                            zIndex:配置物zIndex.キャンバス.描画キャンバス
                        }),
                    canvas().tap(self => {
                        this.testCanvas = self;
                        self.setWidth(window.innerWidth);
                        self.setHeight(window.innerHeight);
                    }).setStyleCSS({
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        top: '0',
                        left: '0',
                        zIndex: 配置物zIndex.お絵描きキャンバス
                    }),
                    this._セーブパネル
                ])
        );
    }

    public delete(): void {
        super.delete();
    }

    private 付箋をめくる動作():void{
        this._一番上の付箋 = this._描画キャンバスView.add付箋(Px2DVector.fromNumbers(0,0)).view;
        this._一番上の付箋.付箋をめくる動作を登録( () => {
            this.付箋をめくる動作();
        });
    }

    private ブラウザのウインドウが拡縮したときマウスを中心に拡縮したように見せるために座標中心を移動させる(){
        const windowSizeInfo = this._windowSizeScaleObserver.updateWindowSize();
        const 前のウインドウサイズでのmousePos = this._mouseGlobal.mousePos;//ウインドウの大きさが変わるとマウスを物理的に動かしてなくてもビューポート上での座標が変わる
        //マウスの位置を別イベントで撮っているのでバグが存在するが、許容する。
        const new描画座標中心: 画面座標点 = this._描画キャンバスView.描画基準座標.描画原点.plus(前のウインドウサイズでのmousePos.px2DVector.times(windowSizeInfo.拡縮率-1))
        this._描画キャンバスView.update描画基準座標原点(new描画座標中心);

    }
}

export class GlobalMouseManager {
    public scale: number;
    public mousePos: 画面座標点;
    private _onScale: Action<拡縮入力>;
    private readonly _座標変換: ボード基準座標変換;

    constructor(onScale: Action<拡縮入力>, 座標変換: ボード基準座標変換) {
        this.scale = 1;
        this._座標変換 = 座標変換;
        グローバルイベントを購読する(document, "pointermove", (e) => this.onGlobalPointerMove(e));
        グローバルイベントを購読する(window, 'wheel', (e: WheelEvent) => this.onWheel(e), { passive: false });
        this._onScale = onScale;
    }

    private onWheel(e: WheelEvent): void {
        this.onGlobalPointerMove(e);
        if (e.ctrlKey) {
            e.preventDefault();
            const deltaRatio = e.deltaY > 0 ? -0.1 : 0.1;
            const newScale = this.scale + deltaRatio;
            if (newScale <= 0.1 || newScale >= 5.0) return;
            this.scale = newScale;
            // ズーム中心はボードルート基準へ補正する。CSSのtransformOrigin適用先
            // （配置物コンテナ）はボードルート配下の要素であり、raw clientX/Yを
            // そのまま渡すとタブ埋め込み時にボードルート左上とのズレ分だけ
            // ズーム中心がずれる。
            const 補正済み中心 = this._座標変換.viewportPointを補正する(e.clientX, e.clientY);
            this._onScale({ 拡縮率: this.scale, 中心X: 補正済み中心.x.値, 中心Y: 補正済み中心.y.値 });
        }
    }

    private onGlobalPointerMove(e: MouseEvent | PointerEvent): void {
        const mouseEvent = new MouseEventData(e);
        this.mousePos = this._座標変換.画面座標点を補正する(mouseEvent.position.x, mouseEvent.position.y);
    }
}


export class WindowSizeScaleObserver {
    private _prevWindowSize: WindowSize;
    public constructor() {   
        this._prevWindowSize = this.windowSize();
    }

    public updateWindowSize(): UpdateWindowSizeInfo {
        const newSize = this.windowSize();
        const 拡縮率 = newSize.devide(this._prevWindowSize);
        this._prevWindowSize = newSize;
        return {
            newSize: newSize,
            拡縮率: 拡縮率
        };
    }

    public windowSize(): WindowSize {
        return new WindowSize(new Px長さ(window.innerWidth), new Px長さ(window.innerHeight));
    }
}

export interface UpdateWindowSizeInfo {
    newSize: WindowSize; 
    拡縮率: number
}

export class WindowSize { 
    public readonly width: Px長さ;
    public readonly height: Px長さ; 

    constructor(width: Px長さ = new Px長さ(window.innerWidth), height: Px長さ = new Px長さ(window.innerHeight)) {
        this.width = width;
        this.height = height;
    }

    devide(other: WindowSize): number {
        return this.width.value / other.width.value
    }
}


