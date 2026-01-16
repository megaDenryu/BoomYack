import { ButtonC, DivC, H1C, HrC, HtmlComponentBase, LiC, PC, Px2DVector, Px長さ, UlC, ビューポート座標値, 描画座標点 } from "SengenUI/index";
import { 自動リサイズ付箋View } from "./付箋View/自動リサイズモード/自動リサイズ付箋View";







import { ITestPage } from "../../../../Examples/ITestPage";

import { 自動リサイズ付箋View2 } from "../付箋2/自動リサイズ付箋View2";



/**
 * 自動リサイズ付箋Viewのテスト実行クラス
 * 自動リサイズ付箋の基本機能をテストします：
 * - テキスト編集（テキスト量に応じて高さ自動調整）
 * - スクロールバーなし（高さが自動で拡張される）
 * - ドラッグで移動可能
 * - 幅は設定可能、高さは自動
 */
export class 自動リサイズ付箋ViewTest implements ITestPage {
    private containerComponent: DivC;
    private stickyNotes: (自動リサイズ付箋View|自動リサイズ付箋View2<描画座標点>)[] = [];

    constructor() {
        console.log("自動リサイズ付箋ViewTest: コンストラクター開始");
        this.containerComponent = new DivC();
        console.log("自動リサイズ付箋ViewTest: DivC作成完了");
        this.initializeTest();
        console.log("自動リサイズ付箋ViewTest: 初期化完了");
    }

    private initializeTest(): void {
        console.log("自動リサイズ付箋ViewTest: initializeTest開始");
        
        // 基本スタイルを設定
        this.containerComponent.setStyleCSS({
            margin: "0",
            padding: "20px", 
            fontFamily: "Arial, sans-serif",
            backgroundColor: "#f5f5f5",
            minHeight: "100vh"
        });
        console.log("自動リサイズ付箋ViewTest: スタイル設定完了");

        // ヘッダー情報をUIComponentで作成し、コンテナに追加
        this.containerComponent.childs([
            new H1C({ text: "自動リサイズ付箋View テスト" }),
            new PC({ text: "以下の機能をテスト可能です：" }),
            new UlC().childs([
                new LiC().setHtmlContent("<strong>テキスト編集</strong>: 付箋をクリックしてテキストを編集"),
                new LiC().setHtmlContent("<strong>自動リサイズ</strong>: テキスト量に応じて高さが自動調整されます"),
                new LiC().setHtmlContent("<strong>移動</strong>: ヘッダー部分をドラッグして移動"),
                new LiC().setHtmlContent("<strong>スクロールバーなし</strong>: 固定の高さではないためスクロール不要")
            ]),
            new ButtonC({ text: "新しい自動リサイズ付箋を追加", id: "addAutoStickyNote" }).addTypedEventListener("click", () => { this.addRandomStickyNote(); }),
            new ButtonC({ text: "長いテキストでテスト", id: "testLongText" }).addTypedEventListener("click", () => { this.addLongTextStickyNote(); }),
            new ButtonC({ text: "全てクリア", id: "clearAll" }).addTypedEventListener("click", () => { this.clearAllStickyNotes(); }),
            new HrC().setStyleCSS({ margin: "20px 0" })
        ]);

        // 初期の付箋をいくつか作成
        console.log("自動リサイズ付箋ViewTest: createInitialStickyNotes呼び出し");
        console.log("自動リサイズ付箋ViewTest: initializeTest完了");
    }

    

    private addRandomStickyNote(): void {
        const randomTexts = [
            "ランダム付箋",
            "短いテキスト",
            "中程度の長さのテキストです\n改行も含まれています",
            "これは長めのテキスト\n複数行にわたって\nテキストが表示される例です",
            ""
        ];
        
        const randomText = randomTexts[Math.floor(Math.random() * randomTexts.length)];
        const stickyNote = new 自動リサイズ付箋View({
            initialPosition: { 
                x: Math.random() * (window.innerWidth - 250),
                y: Math.random() * (window.innerHeight - 200) + 100
            },
            initialWidth: 150 + Math.random() * 150,
            initialText: randomText,
            placeholder: "新しい付箋",
            onTextChange: (text) => console.log(`ランダム付箋${this.stickyNotes.length + 1}テキスト変更:`, text),
            onPositionChange: (x, y) => console.log(`ランダム付箋${this.stickyNotes.length + 1}位置: x=${x}, y=${y}`),
            onDelete: () => {
                console.log(`ランダム付箋${this.stickyNotes.length + 1}削除`);
                const index = this.stickyNotes.indexOf(stickyNote);
                if (index !== -1) {
                    this.removeStickyNote(index);
                }
            }
        });

        this.stickyNotes.push(stickyNote);
        this.containerComponent.child(stickyNote);
    }

    private addLongTextStickyNote(): void {
        const longText = `長いテキストのテスト付箋

この付箋は長いテキストを含んでおり、自動リサイズ機能のテストに使用されます。

特徴：
1. テキストの量に応じて高さが自動調整される
2. スクロールバーは表示されない
3. 最小高さを設定できる
4. ドラッグして移動できる
5. 削除ボタンで閉じることができる

さらにテキストを追加してみてください：

- リスト項目1
- リスト項目2  
- リスト項目3

このようにテキストが増えると、
付箋の高さも自動的に拡張されていきます。

従来の固定サイズ付箋とは
異なる動作を確認できるはずです。`;

        const stickyNote = new 自動リサイズ付箋View({
            initialPosition: { 
                x: 350,
                y: 100
            },
            initialWidth: 280,
            initialText: longText,
            minHeight: 100,
            onTextChange: (text) => console.log("長文付箋テキスト変更:", text),
            onPositionChange: (x, y) => console.log(`長文付箋位置: x=${x}, y=${y}`),
            onDelete: () => {
                console.log("長文付箋削除");
                const index = this.stickyNotes.indexOf(stickyNote);
                if (index !== -1) {
                    this.removeStickyNote(index);
                }
            }
        });

        this.stickyNotes.push(stickyNote);
        this.containerComponent.child(stickyNote);
    }

    private removeStickyNote(index: number): void {
        if (index >= 0 && index < this.stickyNotes.length) {
            const note = this.stickyNotes[index];
        }
    }

    private clearAllStickyNotes(): void {
        this.stickyNotes.forEach(note => {
            this.containerComponent.removeChild(note);
        });
        this.stickyNotes = [];
    }

    public addStickyNote(options: {
        initialText?: string;
        initialPosition?: { x: number; y: number };
        initialWidth?: number;
        minHeight?: number;
        placeholder?: string;
    }): 自動リサイズ付箋View {
        const newNote = new 自動リサイズ付箋View({
            ...options,
            onTextChange: (text) => console.log("追加付箋テキスト変更:", text),
            onPositionChange: (x, y) => console.log(`追加付箋位置: x=${x}, y=${y}`),
            onDelete: () => {
                console.log("追加付箋削除");
                const index = this.stickyNotes.indexOf(newNote);
                if (index !== -1) {
                    this.removeStickyNote(index);
                }
            }
        });
        
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
