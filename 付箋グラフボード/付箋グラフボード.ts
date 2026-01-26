import { CanvasC, DivC, DocumentBodyC, LV2HtmlComponentBase, MouseEventData, Px2DVector, Px長さ, 描画座標点, 画面座標点 } from "SengenUI/index";


import { sticky_graph_board_container } from './style.css';
import { 自動リサイズ付箋View2 } from 'BoomYack/基本オブジェクト/配置物/付箋2/自動リサイズ付箋View2';


import { CanvasView, CanvasViewOptions } from 'BoomYack/基本オブジェクト/描画キャンバス/描画キャンバスView分解/CanvasView';


import { 配置物zIndex } from 'BoomYack/基本オブジェクト/I配置物';

import { Action } from 'TypeScriptBenriKakuchou/アーキテクチャBase';
import { セーブパネル, ISavePanelEvents, SaveMode } from 'BoomYack/基本オブジェクト/キャンバス操作/セーブパネル';
import { 描画キャンバスAPIリポジトリ, 描画キャンバスリポジトリ, 描画キャンバスローカルリポジトリ } from 'BoomYack/基本オブジェクト/描画キャンバス/描画キャンバスAPIリポジトリ';
import { 円状メニューアイテムオプション } from 'BoomYack/基本オブジェクト/キャンバス操作/円状コンテキストメニュー/円状コンテキストメニュー';
import { キャンバスメタデータ, 描画キャンバスデータ } from 'BoomYack/基本オブジェクト/描画キャンバス/データクラス';
import { 自動リサイズ付箋View } from 'BoomYack/基本オブジェクト/配置物/付箋2/自動リサイズ付箋View';
import { JSON読み込みサービス } from 'BoomYack/基本オブジェクト/ファイル入出力/JSON読み込みサービス';
import { 描画キャンバスデータバリデーター } from 'BoomYack/基本オブジェクト/ファイル入出力/描画キャンバスデータバリデーター';
import { DropFileLoader } from 'TypeScriptBenriKakuchou/FileSystem/ローダー/DropFileLoader';
import セーブIcon from '../SVGImg/セーブアイコン.svg?url';

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
    private _apiリポジトリ: 描画キャンバスAPIリポジトリ;
    private _ローカルリポジトリ: 描画キャンバスローカルリポジトリ;
    private _json読み込みサービス: JSON読み込みサービス;

    constructor() {
        super();
        
        // リポジトリ初期化
        this._apiリポジトリ = new 描画キャンバスAPIリポジトリ();
        this._ローカルリポジトリ = new 描画キャンバスローカルリポジトリ();
        
        this._windowSizeScaleObserver = new WindowSizeScaleObserver();
        this._componentRoot = this.createComponentRoot();
        this._一番上の付箋 = this._描画キャンバスView.add付箋(Px2DVector.fromNumbers(0,0)).view;
        this._一番上の付箋.付箋をめくる動作を登録( this.付箋をめくる動作.bind(this) );
        this._json読み込みサービス = new JSON読み込みサービス(
            new DropFileLoader(),
            new 描画キャンバスデータバリデーター()
        );
        // this.マウスキーボードイベントバインディング()
        window.addEventListener("resize",this.ブラウザのウインドウが拡縮したときマウスを中心に拡縮したように見せるために座標中心を移動させる.bind(this))
        // スクロールしたときにresizeToを使うようにする
        this._mouseGlobal = new GlobalMouseManager(input => {this._描画キャンバスView.scaleUpdate(input);});
        
    }

    /** セーブパネルイベントハンドラを生成 */
    private createSavePanelEvents(): ISavePanelEvents {
        return {
            onSave: async (name: string, mode: SaveMode) => {
                // nameをIDとしても使用（ファイル名として安全な形式にする）
                const safeId = this.toSafeId(name);
                this._描画キャンバスView.setCanvasIdAndName(safeId, name);
                if (mode === "server") {
                    await this._描画キャンバスView.保存();
                } else {
                    this._描画キャンバスView.ローカル保存();
                }
            },
            onLoad: async (id: string, mode: SaveMode) => {
                this._描画キャンバスView.setCanvasId(id);
                if (mode === "server") {
                    await this._描画キャンバスView.読み込み();
                } else {
                    this._描画キャンバスView.ローカル読み込み();
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
                return this._描画キャンバスView.現在の描画キャンバスデータを取得();
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

    /** コンテキストメニューに追加するメニュー項目を生成 */
    private createAdditionalMenuItems(): 円状メニューアイテムオプション[] {
        return [
            { iconUrl: セーブIcon, backgroundColor: 'white', borderColor: 'green', onClick: () => this._セーブパネル.開く() },
        ];
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

    protected createComponentRoot(): DivC {
        // セーブパネルを先に作成（コンテキストメニューから参照するため）
        this._セーブパネル = new セーブパネル(this.createSavePanelEvents());

        // 描画キャンバスViewのオプション（DI）
        const canvasOptions: CanvasViewOptions = {
            canvasId: "sticky-graph-board",
            追加メニュー項目: this.createAdditionalMenuItems()
        };

        return new DivC({ class: sticky_graph_board_container }).childs([
                new CanvasView(canvasOptions, {api: this._apiリポジトリ, local: this._ローカルリポジトリ})
                    .bind(self => {
                        this._描画キャンバスView = self;
                        self.onDropFile = this.onDropFile;
                    }).setStyleCSS({
                        zIndex:配置物zIndex.キャンバス.描画キャンバス
                    }),
                new CanvasC().bind(self => {
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
            ]);
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

export class 拡縮情報 {
    public readonly 現在scale: number;
    public readonly 拡縮変化率: number;
    constructor(現在scale: number, 拡縮変化率: number) {
        this.現在scale = 現在scale;
        this.拡縮変化率 = 拡縮変化率;
    }
}

export class GlobalMouseManager {
    public scale: number;
    public mousePos:画面座標点
    public _onResize: Action<{拡縮率:number, e:WheelEvent}>;

    constructor(onResize: Action<{拡縮率:number, e:WheelEvent}>, minScale: number = 0.1, maxScale: number = 10) {
        this.scale = 1;
        new DocumentBodyC().addEventListener("mousemove",(e)=>this.onGlobalMouseMove(e));
        
        // Ctrl+Wheelでのブラウザ標準ズームを無効化し、独自のウィンドウリサイズ処理を行う
        window.addEventListener('wheel', (e: WheelEvent) => this.onWheel(e), { passive: false });
        this._onResize = onResize;
    }

    public new拡縮率(e: WheelEvent): 拡縮情報 {
        const wheel = e.deltaY;
        let deltaRatio = 0;
        if (wheel > 0) {
            deltaRatio = -0.1;
        } else {
            deltaRatio = 0.1;
        }
        
        const newScale = this.scale + deltaRatio;
        if (newScale <= 0.1 || newScale >= 5.0) {
            return new 拡縮情報(this.scale, 1.0);
        }
        const 拡縮率 = newScale / this.scale;
        this.scale = newScale;
        return new 拡縮情報(this.scale, 拡縮率);
    }

    private onWheel(e: WheelEvent): void {
        this.onGlobalMouseMove(e);
        
        if (e.ctrlKey) {
            e.preventDefault(); // ブラウザ標準のズームを無効化
            this.resizeWindow(e);
        }
    }

    private resizeWindow(e: WheelEvent): void {
        // new拡縮率を呼び出してscaleを更新する
        const 拡縮情報 = this.new拡縮率(e);
        
        // 変化がない場合は何もしない
        if (拡縮情報.拡縮変化率 === 1.0) return;
        this._onResize({拡縮率:拡縮情報.現在scale, e:e});
    }

    public onGlobalMouseMove(e:MouseEvent){
        const mouseEvent = new MouseEventData(e)
        this.mousePos = 画面座標点.fromNumbers(mouseEvent.position.x, mouseEvent.position.y);
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


