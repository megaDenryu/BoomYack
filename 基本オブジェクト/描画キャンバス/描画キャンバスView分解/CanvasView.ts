import { DivC, Drag中値, LV2HtmlComponentBase, MouseEventData, MouseWife, Px2DVector, Px長さ, 描画基準座標, 描画座標点, 画面座標点 } from "SengenUI/index";
import { I配置物集約, 配置物zIndex } from "../../I配置物";


import { 円状コンテキストメニュー, 円状メニューアイテムオプション } from "../../キャンバス操作/円状コンテキストメニュー/円状コンテキストメニュー";
import { コンテキストメニューコンテナ } from "../../キャンバス操作/円状コンテキストメニュー/コンテキストメニューコンテナ";
import { 配置物選択機能集約, I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { 描画キャンバスリポジトリ } from "../描画キャンバスAPIリポジトリ";
import { CanvasGraphModel, GraphEvent } from "./CanvasGraphModel";
import { CanvasItemFactory } from "./CanvasItemFactory";
import { CanvasPersistenceManager } from "./CanvasPersistenceManager";


import { キャンバスメタデータ } from "../データクラス";
import { 折れ線矢印VM } from "../../配置物"; // export確認要
import { 折れ線矢印ID, キャンバスID } from "../../ID";
import { 配置物連結グラフ, 配置物連結グラフをすべて抽出 } from "../配置物グラフ/配置物連結グラフ";
import 付箋Icon from '../../../SVGImg/付箋文字でか斜め色付き.svg?url';
import SaveIcon from '../../../SVGImg/SaveIcon.svg?url';
import ゴミ箱Icon from '../../../SVGImg/ゴミ箱2.svg?url';
import 折れ線矢印Icon from '../../../SVGImg/折れ線矢印.svg?url';
import { まとめて移動サービス } from "./まとめて移動サービス";

export interface 全ての接続点を表示非表示切り替え可能 {
    全ての接続点を表示非表示切り替え(表示する: boolean): void;
}


export interface I配置物選択機能集約用のキャンバス機能 extends 全ての接続点を表示非表示切り替え可能 {
}

export interface CanvasViewOptions {
    canvasId?: string;
    追加メニュー項目?: 円状メニューアイテムオプション[];
    onSaveClick?: () => void;
}

export class CanvasView extends LV2HtmlComponentBase implements I配置物選択機能集約用のキャンバス機能 {
    protected _componentRoot: DivC;
    private _mouseWife!: MouseWife;
    
    // Model & Services
    public readonly model: CanvasGraphModel;
    public readonly factory: CanvasItemFactory;
    public readonly persistence: CanvasPersistenceManager;
    private selectionManager: 配置物選択機能集約;
    private 選択物まとめて移動サービス: まとめて移動サービス = new まとめて移動サービス();
    
    // UI Elements
    private menu!: 円状コンテキストメニュー;
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

        this.factory = new CanvasItemFactory(
            this.model, 
            this.selectionManager, 
            this.contextMenuContainer,
            () => this.deleteSelectedItem()
        );
        this.model.setFactory(this.factory);
        
        this.persistence = new CanvasPersistenceManager(this.model, this.factory, repository);
        
        this._componentRoot = this.createComponentRoot();
        
        this.model.subscribe((e) => this.handleGraphEvent(e));
        
        // _mouseWifeの初期化はcreateComponentRoot内のbindで行われるため、ここではプロパティへの代入待ち、あるいは再度ラップする。
        // Original: bindで_mouseWife生成。
        // ここでは型定義上 _mouseWife!: MouseWife とするか、bind内で代入する。
    }

    private handleGraphEvent(e: GraphEvent): void {
        if (e.type === 'ADDED' && e.item) {
            this._配置物コンテナ.child(e.item.view);
        } else if (e.type === 'REMOVED' && e.item) {
             e.item.view.delete();
        } else if (e.type === 'CLEARED') {
            // Already handled by REMOVED events loop in Model
        } else if (e.type === 'UPDATED') {
            // Repaint triggered by Model calling item.再描画()
        }
    }

    protected createComponentRoot(): DivC {
        console.log(SaveIcon);
        const menuItems: 円状メニューアイテムオプション[] = [
            { iconUrl: ゴミ箱Icon, onClick: (e) => this.deleteSelectedItem() , backgroundColor: '#ffffff', borderColor: 'green' },
            { iconUrl: 付箋Icon, onClick: (e) => this.onAddStickyNote(e) , backgroundColor: '#ffffff', borderColor: 'green' },
            { iconUrl: 折れ線矢印Icon, onClick: (e) => this.onAddArrow(e) , backgroundColor: '#ffffff', borderColor: 'green' },
            { label: "グラフ選択", onClick: (e) => this.グラフ選択() },
            { label: "グラフテキストコピー", onClick: (e) => this.グラフをテキストとしてコピー()},
            { label: "グラフJson", onClick: (e) => this.グラフを選択してjsonファイル出力()},
            { iconUrl: SaveIcon, onClick: (e) => this._options.onSaveClick?.(), backgroundColor: '#ffffff', borderColor: 'green' },

            { label: "貼り付け", onClick: (e) => this.クリップボードから貼り付け(e)},

            ...(this._options.追加メニュー項目 ?? [])
        ];

        return new DivC({"class": "キャンバスコンテナ"}).childs([
                    new DivC({"class": "描画キャンバスView"}).setStyleCSS({
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
                            .addDivEventListener('click', (e: MouseEvent) => {
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
                    new DivC({"class": "配置物コンテナ"})
                            .setStyleCSS({
                                zIndex: 配置物zIndex.キャンバス.配置物コンテナ,
                                position: 'absolute', top: '0',left: '0',width: '10px',height: '10px',
                            })
                            .bind(self => {this._配置物コンテナ = self;}),
                    
                    this.contextMenuContainer
                        .bind(self => {
                            self.コンテキストメニュー追加(new 円状コンテキストメニュー(menuItems).bind(self => this.menu = self))
                        })
                        .zIndex(配置物zIndex.キャンバス.コンテキストメニューコンテナ)
        ]);
    }
    
    private deleteSelectedItem(): void {
        const items = this.selectionManager.選択中配置物;
        if (items.length === 0) {
            return;
        }
        for (const item of items) {
            this.model.remove配置物(item);
            this.selectionManager.選択解除();
        }
    }
    
    private onAddStickyNote(e: MouseEvent): void { 
         const data = new MouseEventData(e);
         const pos = new 画面座標点(data.pos2DVector).to描画座標点(this.model.描画基準座標);
         this.model.描画座標点でadd付箋(pos);
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
        this.model.add折れ線矢印(vm);
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
        this.model.配置物再描画();
    }

    public 全ての接続点を表示非表示切り替え(表示する: boolean): void {
        for (const item of this.model.配置物リスト) {
            item.接続点を表示非表示切り替え?.(表示する);
        }
    }
    
    public scaleUpdate(input:{拡縮率:number, e:WheelEvent}): void {
         this.model.update拡縮率(
            input.拡縮率, 
            new 画面座標点(new Px2DVector(new Px長さ(input.e.clientX), new Px長さ(input.e.clientY)))
         );
         
         this._配置物コンテナ.setStyleCSS({
             transform: `scale(${input.拡縮率})`,
             transformOrigin: `${input.e.clientX}px ${input.e.clientY}px`
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

    public 現在の描画キャンバスデータを取得() {
        return this.persistence.serialize();
    }

    // Proxy methods for compatibility or usage
    public async 保存(): Promise<{ success: boolean; message: string }> {
        return this.persistence.save(this.canvasId);
    }
    
    public async 読み込み(): Promise<boolean> {
        return this.persistence.load(this.canvasId);
    }
    
    public ローカル保存(): void {
        this.persistence.localSave(this.canvasId);
    }
    
    public ローカル読み込み(): boolean {
        return this.persistence.localLoad(this.canvasId);
    }

    public 全配置物クリア(): void {
        this.model.全配置物クリア();
    }
    
    public delete(): void {
        super.delete();
        this.contextMenuContainer.delete(); 
    }

    public グラフ選択(): void {
        const 選択中配置物リスト = this.selectionManager.選択中配置物;
        const 選択中配置物グラフリスト: 配置物連結グラフ[] = 選択中配置物リスト.map(配置物 => this.model.グラフを選択(配置物))
                                                                          .filter((graph) => graph !== null);
        for (const グラフ of 選択中配置物グラフリスト) {
            for (const 配置物 of グラフ.配置物集約リスト) {
                this.selectionManager.追加選択(配置物);
            }
        }
    }

    public グラフを選択してjsonファイル出力(){
        const 選択配置物 = this.selectionManager.選択中配置物[0];
        if (選択配置物) {this.model.グラフを選択してjsonファイル出力(選択配置物);}
        
    }

    public グラフをテキストとしてコピー(){
        const 選択配置物 = this.selectionManager.選択中配置物[0];
        if (選択配置物) {this.model.グラフをテキストとしてコピー(選択配置物);}
    }

    public クリップボードから貼り付け(e: MouseEvent){
        this.model.クリップボードから貼り付け(e);
    }
}
