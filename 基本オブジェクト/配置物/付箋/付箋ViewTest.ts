import { ButtonC, DivC, H1C, HrC, HtmlComponentBase, LiC, PC, UlC } from "SengenUI/index";
import { 付箋View } from "./付箋View/スクロール可能モード/付箋View";







import { ITestPage } from "../../../../Examples/ITestPage";


/**
 * 付箋Viewのテスト実行クラス
 * 付箋の基本機能をテストします：
 * - テキスト編集（インライン編集・自動リサイズ・改行対応）
 * - ４辺と頂点にリサイズハンドルを持つ
 * - ドラッグで移動可能
 */
export class 付箋ViewTest implements ITestPage {
    private containerComponent: DivC;
    private stickyNotes: 付箋View[] = [];

    constructor() {
        this.containerComponent = new DivC();
        this.initializeTest();
    }

    private initializeTest(): void {
        // 基本スタイルを設定
        this.containerComponent.setStyleCSS({
            margin: "0",
            padding: "20px", 
            fontFamily: "Arial, sans-serif",
            backgroundColor: "#f5f5f5",
            minHeight: "100vh"
        });

        // ヘッダー情報をUIComponentで作成し、コンテナに追加
        this.containerComponent.childs([
            new H1C({ text: "付箋View テスト" }),
            new PC({ text: "以下の機能をテスト可能です：" }),
            new UlC().childs([
                new LiC().setHtmlContent("<strong>テキスト編集</strong>: 付箋をクリックしてテキストを編集"),
                new LiC().setHtmlContent("<strong>リサイズ</strong>: 付箋の端や角をドラッグしてサイズ変更"),
                new LiC().setHtmlContent("<strong>移動</strong>: 付箋をドラッグして移動")
            ]),
            new ButtonC({ text: "新しい付箋を追加", id: "addStickyNote" }).addTypedEventListener("click", () => { this.addRandomStickyNote(); }),
            new ButtonC({ text: "全てクリア", id: "clearAll" }).addTypedEventListener("click", () => { this.clearAllStickyNotes(); }),
            new HrC().setStyleCSS({ margin: "20px 0" })
        ]);


        // 初期の付箋をいくつか作成
        this.createInitialStickyNotes();
    }

    private createInitialStickyNotes(): void {
        // UIコンポーネントとして追加
        this.containerComponent.childs([
            new 付箋View({ text: "基本的な付箋\nクリックして編集してください",
                x: 50,y: 200,width: 200,height: 150,backgroundColor: "#ffeb3b" }).bind((note) => {this.stickyNotes.push(note);}),
            new 付箋View({ text: "小さな付箋", 
                x: 300, y: 200, width: 150, height: 100, backgroundColor: "#ff9800" }).bind((note) => {this.stickyNotes.push(note);}),
            new 付箋View({ text: "大きな付箋です\n複数行のテキストが\n入力できます\n自動リサイズもテストしてください", 
                x: 500, y: 200, width: 250, height: 200, backgroundColor: "#4caf50" }).bind((note) => {this.stickyNotes.push(note);}),
            new 付箋View({ text: "ピンク色の付箋", 
                x: 100, y: 450, width: 180, height: 120, backgroundColor: "#e91e63" }).bind((note) => {this.stickyNotes.push(note);}),
        ]);
    }

    private addRandomStickyNote(): void {
        const colors = ["#ffeb3b", "#ff9800", "#4caf50", "#2196f3", "#e91e63", "#9c27b0"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        this.containerComponent.child(
            new 付箋View({
                text: `新しい付箋 ${this.stickyNotes.length + 1}`,
                x: Math.random() * (window.innerWidth - 250),
                y: Math.random() * (window.innerHeight - 200) + 100,
                width: 150 + Math.random() * 100,
                height: 100 + Math.random() * 100,
                backgroundColor: randomColor
            }).bind((note) => { this.stickyNotes.push(note); })
        );
    }

    private clearAllStickyNotes(): void {
        this.stickyNotes.forEach(note => {
            this.containerComponent.removeChild(note);
        });
        this.stickyNotes = [];
    }

    // 公開メソッド
    public getStickyNotes(): 付箋View[] {
        return [...this.stickyNotes];
    }

    public addStickyNote(options: {
        text?: string;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        backgroundColor?: string;
    }): 付箋View {
        const newNote = new 付箋View(options);
        this.stickyNotes.push(newNote);
        this.containerComponent.child(newNote);
        return newNote;
    }

    // ITestPage インターフェースの実装
    public getRoot(): HtmlComponentBase {
        return this.containerComponent;
    }

    public destroy(): void {
        this.clearAllStickyNotes();
        this.containerComponent.delete();
    }
}


