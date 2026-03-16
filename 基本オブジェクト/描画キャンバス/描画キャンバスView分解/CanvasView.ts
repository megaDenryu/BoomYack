import { div, span, DivC, Drag中値, LV2HtmlComponentBase, MouseEventData, MouseWife, Px2DVector, Px長さ, 描画基準座標, 描画座標点, 画面座標点 } from "SengenUI/index";
import { 配置物zIndex } from "../../I配置物";


import { Iコンテキストメニュー } from "../../キャンバス操作/円状コンテキストメニュー/円状コンテキストメニュー";
import { 多段格子コンテキストメニュー, 格子メニュー1層オプション, 格子メニュー2層オプション } from "../../キャンバス操作/多段格子コンテキストメニュー/多段格子コンテキストメニュー";
import { コンテキストメニューコンテナ } from "../../キャンバス操作/円状コンテキストメニュー/コンテキストメニューコンテナ";
import { 配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { CanvasGraphModel, GraphEvent } from "./CanvasGraphModel";
import { CanvasItemFactory } from "./CanvasItemFactory";
import { CanvasPersistenceManager } from "./CanvasPersistenceManager";


import { キャンバスメタデータ } from "../データクラス";
import { 折れ線矢印VM } from "../../配置物";
import { 折れ線矢印ID, キャンバスID } from "../../ID";
import { 配置物連結グラフ } from "../配置物グラフ/配置物連結グラフ";
import 付箋Icon from '../../../SVGImg/付箋文字でか斜め色付き.svg?url';
import SaveIcon from '../../../SVGImg/SaveIcon.svg?url';
import ゴミ箱Icon from '../../../SVGImg/ゴミ箱2.svg?url';
import 折れ線矢印Icon from '../../../SVGImg/折れ線矢印.svg?url';
import MicOnIcon from '../../../SVGImg/MicOn.svg?url';
import MicOffIcon from '../../../SVGImg/MicOff.svg?url';
import { キャンバスグラフ操作サービス } from "./キャンバスグラフ操作サービス";
import { まとめて移動サービス } from "./まとめて移動サービス";
import { キャンバスコマンドリポジトリ } from "../../キャンバス操作/コマンドリポジトリ/キャンバスコマンドリポジトリ";
import { 配置物追加コマンド, 配置物削除コマンド } from "../../キャンバス操作/コマンドリポジトリ/具体的なコマンド群";
import { VoiceRecognitionService } from "../../キャンバス操作/音声認識サービス";
import { micIcon } from "OneONetUIComponents/Svg/Icons";
import { 描画キャンバスリポジトリ } from "../../API/I描画キャンバスAPIリポジトリ";
import { キャンバスコンテナ, 描画キャンバスView as 描画キャンバスViewcss, 配置物コンテナ as 配置物コンテナcss, 録音インジケータ } from "./style.css";

export interface 全ての接続点を表示非表示切り替え可能 {
    全ての接続点を表示非表示切り替え(表示する: boolean): void;
}


export interface I配置物選択機能集約用のキャンバス機能 extends 全ての接続点を表示非表示切り替え可能 {
}

export interface 拡縮入力 {
    拡縮率: number;
    中心X: number;
    中心Y: number;
}

export interface CanvasViewOptions {
    canvasId?: string;
    onSaveClick?: () => void;
}

/**
 * 普通のMVPをやっているわけではなく、Viewがモデルやサービスを持っているのがこのプロジェクトです。
 * これは理由があって、Viewをモデルに持たせるとViewの宣言的な組み立てがしにくいなーというのがありました。
 * すべてのViewに対してモデルとプレゼンターがあるというのがMVPだと思いますが、そうするとViewを宣言的に組み立てる前にモデルを宣下的に組み立てる必要が出てきて、Viewが宣言的に見えなくなるなと思いました。
 */

export class CanvasView extends LV2HtmlComponentBase implements I配置物選択機能集約用のキャンバス機能 {
    protected _componentRoot: DivC;
    private _mouseWife!: MouseWife;
    
    // Model & Services
    public readonly model: CanvasGraphModel;
    public readonly factory: CanvasItemFactory;
    public readonly persistence: CanvasPersistenceManager;
    private selectionManager: 配置物選択機能集約;
    private 選択物まとめて移動サービス: まとめて移動サービス = new まとめて移動サービス();
    public readonly グラフ操作サービス: キャンバスグラフ操作サービス;
    public readonly commandRepository: キャンバスコマンドリポジトリ = new キャンバスコマンドリポジトリ();
    public readonly voiceRecognitionService: VoiceRecognitionService;
    private _recordingIndicator: DivC | null = null;
    private _再描画予約済み = false;
    private _再描画リクエストID: number | null = null;
    
    // UI Elements
    private menu!: Iコンテキストメニュー;
    private contextMenuContainer: コンテキストメニューコンテナ;
    private _配置物コンテナ!: DivC;
    
    // State
    private readonly _options: CanvasViewOptions;
    public get canvasId(): string { return this._options.canvasId || "default"; }

    public get 描画基準座標(): 描画基準座標 {
        return this.model.描画基準座標;
    }

    public update描画基準座標原点(pos: 画面座標点) {
        this.model.update描画基準座標原点(pos);
    }

    public onDropFile?: (e: DragEvent) => Promise<void>;

    constructor(options: CanvasViewOptions, repository: 描画キャンバスリポジトリ) {
        super();
        this._options = options;
        
        
        this.選択物まとめて移動サービス = new まとめて移動サービス();
        this.selectionManager = new 配置物選択機能集約(this, this.選択物まとめて移動サービス);
        this.model = new CanvasGraphModel();
        this.contextMenuContainer = new コンテキストメニューコンテナ();
        this.グラフ操作サービス = new キャンバスグラフ操作サービス(this.model, () => this.model.metadata.name);
        this.voiceRecognitionService = new VoiceRecognitionService(this.selectionManager);
        
        this.voiceRecognitionService.onStateChange((isRecording) => {
            if (this.menu && (this.menu as 多段格子コンテキストメニュー).updateItem) {
                const multiMenu = this.menu as 多段格子コンテキストメニュー;
                if (isRecording) {
                    multiMenu.updateItem("L1-mic", { iconUrl: MicOnIcon, backgroundColor: 'rgba(231, 76, 60, 0.85)' });
                } else {
                    multiMenu.updateItem("L1-mic", { iconUrl: MicOffIcon });
                }
            }
            if (this._recordingIndicator) {
                this._recordingIndicator.setStyleCSS({ display: isRecording ? 'flex' : 'none' });
            }
        });

        this.factory = new CanvasItemFactory(
            this.model, 
            this.selectionManager, 
            this.contextMenuContainer,
            this.グラフ操作サービス,
            this.voiceRecognitionService,
            () => this.deleteSelectedItem(),
            (cmd) => this.commandRepository.push(cmd)
        );
        this.model.setFactory(this.factory);
        
        this.persistence = new CanvasPersistenceManager(this.model, this.factory, repository);
        
        this._componentRoot = this.createComponentRoot();
        
        this.model.subscribe((e) => this.handleGraphEvent(e));
        
        document.addEventListener('keydown', this.handleKeyDown);
        
        // _mouseWifeの初期化はcreateComponentRoot内のbindで行われるため、ここではプロパティへの代入待ち、あるいは再度ラップする。
        // Original: bindで_mouseWife生成。
        // ここでは型定義上 _mouseWife!: MouseWife とするか、bind内で代入する。
    }

    private handleKeyDown = (e: KeyboardEvent): void => {
        const target = e.target as HTMLElement | null;
        if (target) {
            const tagName = target.tagName.toLowerCase();
            const isContentEditable = target.isContentEditable;
            if (tagName === 'input' || tagName === 'textarea' || isContentEditable) {
                return;
            }
        }

        if (e.key === 'Delete') {
            this.deleteSelectedItem();
        } else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.selectionManager.全て選択(this.model.配置物リスト);
        }
    };

    private handleGraphEvent(e: GraphEvent): void {
        if (e.type === 'ADDED' && e.item) {
            this._配置物コンテナ.child(e.item.view);
        } else if (e.type === 'REMOVED' && e.item) {
             e.item.view.delete();
        } else if (e.type === 'UPDATED') {
            this.再描画をスケジュール();
        }
    }

    private 再描画をスケジュール(): void {
        if (this._再描画予約済み) return;
        this._再描画予約済み = true;
        this._再描画リクエストID = requestAnimationFrame(() => {
            this.model.配置物再描画();
            this._再描画予約済み = false;
            this._再描画リクエストID = null;
        });
    }

    protected createComponentRoot(): DivC {
        const imgBg = "rgba(255, 255, 255, 0.5)";

        const layer1Items: 格子メニュー1層オプション[] = [
            // メインアクション（アイコン系）を十字方向に配置
            { id: "L1-sticky", iconUrl: 付箋Icon, backgroundColor: imgBg, Position: 'top', onClick: (e: MouseEvent) => this.onAddStickyNote(e) },
            { id: "L1-delete", iconUrl: ゴミ箱Icon, backgroundColor: imgBg, Position: 'bottom', onClick: (e: MouseEvent) => this.deleteSelectedItem() },
            { id: "L1-arrow", iconUrl: 折れ線矢印Icon, backgroundColor: imgBg, Position: 'left', onClick: (e: MouseEvent) => this.onAddArrow(e) },
            { id: "L1-save", iconUrl: SaveIcon, backgroundColor: imgBg, Position: 'right', onClick: (e: MouseEvent) => this._options.onSaveClick?.() },

            // カテゴリ（テキスト系）を斜め方向に配置
            { id: "L1-ai", label: ["分解", "生成"], Position: 'lt' },
            { id: "L1-graph", label: ["グラフ", "操作"], Position: 'rt' },
            { id: "L1-mic", iconUrl: MicOffIcon, backgroundColor: imgBg, Position: 'lb', onClick: (e: MouseEvent) => { e.stopPropagation(); this.voiceRecognitionService.toggleRecording(); } },
        ];

        const layer2Items: 格子メニュー2層オプション[] = [
            // 分解生成 (LT)
            // TODO: 必要に応じてAI操作を追加

            // グラフ操作 (RT)
            { parentId: "L1-graph", label: "グラフ選択", onClick: (e: MouseEvent) => this.executeGraphSelection() },
            { parentId: "L1-graph", label: ["グラフをテキスト", "としてコピー"], onClick: (e: MouseEvent) => {
                const 選択配置物 = this.selectionManager.選択中配置物[0];
                if (選択配置物) { this.グラフ操作サービス.グラフをテキストとしてコピー(選択配置物); }
            }},
            { parentId: "L1-graph", label: ["グラフを", "JSON出力"], onClick: (e: MouseEvent) => {
                const 選択配置物 = this.selectionManager.選択中配置物[0];
                if (選択配置物) { this.グラフ操作サービス.グラフを選択してjsonファイル出力(選択配置物); }
            }},
            { parentId: "L1-graph", label: "コピー", onClick: (e: MouseEvent) => this.選択中配置物をコピー() },
            { parentId: "L1-graph", label: "貼り付け", onClick: (e: MouseEvent) => this.グラフ操作サービス.クリップボードから貼り付け(e, (cmd) => this.commandRepository.push(cmd))},
        ];
        
        let canvasContainer: DivC | null = null;

        return (
          div({class: キャンバスコンテナ})
            .setTabIndex(0)
            .bind(div => { canvasContainer = div; })
            .addDivEventListener('keydown', (e: KeyboardEvent) => this.onKeyDown(e))
            .childs([
                    div({class: 描画キャンバスViewcss}).setStyleCSS({
                                position: 'absolute',top: '0',left: '0',width: '100%',height: '100%',
                                zIndex: 配置物zIndex.キャンバス.描画キャンバス,
                            }).bind((self) => {this._mouseWife = new MouseWife(self).ドラッグ連動登録({
                                    onドラッグ開始: (e) => {},
                                    onドラッグ中: (e: Drag中値) => this.onCanvasDrag(e),
                                    onドラッグ終了: (e) => this.onCanvasDragEnd(e),
                                });
                            })
                            .addDivEventListener('contextmenu', (e: MouseEvent) => {
                                e.preventDefault();
                                this.menu.表示(new MouseEventData(e).position);
                            })
                            .onLongPress((pos) => {
                                this.menu.表示({ x: pos.x, y: pos.y });
                            })
                            .addDivEventListener('click', (e: MouseEvent) => {
                                if (canvasContainer) {
                                    canvasContainer.focus({ preventScroll: true });
                                }
                                this.contextMenuContainer.すべてのコンテキストメニューを非表示にする();
                                this.selectionManager.選択解除()
                                this.selectionManager.ホバー解除();
                            })
                            .addDivEventListener('dragenter', (e: DragEvent) => {
                                e.preventDefault();
                            })
                            .addDivEventListener('dragover', (e: DragEvent) => {
                                e.preventDefault();
                            })
                            .addDivEventListener('dragleave', (e: DragEvent) => {
                                e.preventDefault();
                            })
                            .addDivEventListener('drop', async (e: DragEvent) => {
                                e.preventDefault();
                                console.log("CanvasView drop detected", e);
                                if (this.onDropFile) await this.onDropFile(e);
                            }),
                    div({class: 配置物コンテナcss})
                            .setStyleCSS({
                                zIndex: 配置物zIndex.キャンバス.配置物コンテナ,
                                position: 'absolute', top: '0',left: '0',width: '10px',height: '10px',
                            })
                            .bind(self => {this._配置物コンテナ = self;}),

                    this.contextMenuContainer
                        .bind(self => {
                            self.コンテキストメニュー追加(new 多段格子コンテキストメニュー({
                                mode: "clickable",
                                opacity: 0.85,
                                showCenterButton: false,
                                layer1Items: layer1Items,
                                layer2Items: layer2Items
                            }).bind((self: Iコンテキストメニュー) => this.menu = self))
                        })
                        .zIndex(配置物zIndex.キャンバス.コンテキストメニューコンテナ),

                    div({ class: 録音インジケータ })
                        .childs([
                            micIcon(16, "white"),
                            span({ text: "録音中..." })
                        ])
                        .setStyleCSS({
                            display: 'none',
                            alignItems: 'center',
                            gap: '8px',
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px',
                            backgroundColor: 'rgba(231, 76, 60, 0.9)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                            zIndex: 配置物zIndex.キャンバス.コンテキストメニューコンテナ,
                            pointerEvents: 'none',
                            animation: 'pulse 1.5s infinite' // cssアニメーションがあれば適用される
                        })
                        .bind(self => { this._recordingIndicator = self; })
        ])
        );
    }
    
    private deleteSelectedItem(): void {
        const items = [...this.selectionManager.選択中配置物];
        if (items.length === 0) {
            return;
        }
        this.commandRepository.executeAndPush(new 配置物削除コマンド(this.model, items));
        this.selectionManager.選択解除();
    }
    
    private onAddStickyNote(e: MouseEvent): void { 
         const data = new MouseEventData(e);
         const pos = new 画面座標点(data.pos2DVector).to描画座標点(this.model.描画基準座標);
         const item = this.model.描画座標点でadd付箋(pos);
         this.commandRepository.push(new 配置物追加コマンド(this.model, item));
    }
    
    private onAddArrow(e: MouseEvent): void {
        const data = new MouseEventData(e);
        const 始点 = new 画面座標点(data.pos2DVector).to描画座標点(this.model.描画基準座標);
        const 終点 = 始点.plus(new Px2DVector(new Px長さ(100), new Px長さ(0)));
        
        const vm = new 折れ線矢印VM<描画座標点>(
                new 折れ線矢印ID(),
                始点,
                [],
                終点
            );
        const item = this.model.add折れ線矢印(vm);
        this.commandRepository.push(new 配置物追加コマンド(this.model, item));
    }
    
    private onCanvasDrag(e: Drag中値): void {
        const delta = e.data.直前のマウス位置から現在位置までの差分;
        const 補正されたdelta = Px2DVector.fromNumbers(
            delta.x / this.model.描画基準座標.拡縮率,
            delta.y / this.model.描画基準座標.拡縮率
        );
        this.model.update描画基準座標原点(this.model.描画基準座標.描画原点.plus(補正されたdelta));
    }

    private onCanvasDragEnd(e: Drag中値): void {
        this.再描画をスケジュール();
    }

    public 全ての接続点を表示非表示切り替え(表示する: boolean): void {
        for (const item of this.model.配置物リスト) {
            item.接続点を表示非表示切り替え?.(表示する);
        }
    }
    
    public scaleUpdate(input: 拡縮入力): void {
         this.model.update拡縮率(
            input.拡縮率,
            new 画面座標点(new Px2DVector(new Px長さ(input.中心X), new Px長さ(input.中心Y)))
         );

         this._配置物コンテナ.setStyleCSS({
             transform: `scale(${input.拡縮率})`,
             transformOrigin: `${input.中心X}px ${input.中心Y}px`
         });
    }
    
    public add付箋(pos: Px2DVector) {
        return this.model.add付箋(pos);
    }

    public setCanvasIdAndName(id: string, name: string) {
        this._options.canvasId = id; 
        
        // メタデータ更新 (readonlyなので再生成)
        const old = this.model.metadata;
        this.model.metadata = キャンバスメタデータ.create(
            new キャンバスID(id), 
            name,
            old.createdAt,
            new Date()
        );
    }
    
    public setCanvasId(id: string) {
        this._options.canvasId = id;
        
        const old = this.model.metadata;
        this.model.metadata = キャンバスメタデータ.create(
            new キャンバスID(id),
            old.name,
            old.createdAt,
            new Date()
        );
    }



    public 全配置物クリア(): void {
        this.model.全配置物クリア();
    }
    
    public delete(): void {
        super.delete();
        this.contextMenuContainer.delete(); 
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    private 選択中配置物をコピー(): void {
        const 選択中 = this.selectionManager.選択中配置物;
        if (選択中.length === 0) return;
        this.グラフ操作サービス.選択中の配置物をコピー(選択中);
    }

    private executeGraphSelection(): void {
        const 選択中配置物リスト = this.selectionManager.選択中配置物;
        const 選択中配置物グラフリスト: 配置物連結グラフ[] = 選択中配置物リスト.map(配置物 => this.グラフ操作サービス.グラフを選択(配置物))
                                                                          .filter((graph) => graph !== null);
        for (const グラフ of 選択中配置物グラフリスト) {
            for (const 配置物 of グラフ.配置物集約リスト) {
                this.selectionManager.追加選択(配置物);
            }
        }
    }

    private async onKeyDown(e: KeyboardEvent): Promise<void> {
        if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'c') {
            e.preventDefault();
            this.選択中配置物をコピー();
        } else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'v') {
            await this.グラフ操作サービス.クリップボードから貼り付け(undefined, (cmd) => this.commandRepository.push(cmd));
        } else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            this.commandRepository.undo();
        } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            this.commandRepository.redo();
        } else if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            this.commandRepository.redo();
        }
    }
}
