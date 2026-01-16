import { 自動リサイズ付箋View } from "./自動リサイズ付箋View";

/**
 * 自動リサイズ付箋Viewの使用例
 * 
 * 特徴：
 * - テキストの量に応じて付箋の高さが自動調整される
 * - スクロールバーは表示されない
 * - 改行やテキスト追加で付箋が拡大する
 * - 最小高さは設定可能
 */
export class 自動リサイズ付箋Example {
    private stickyNotes: 自動リサイズ付箋View[] = [];

    constructor() {
        this.createExamples();
    }

    private createExamples(): void {
        // 基本的な自動リサイズ付箋
        const basicStickyNote = new 自動リサイズ付箋View({
            initialPosition: { x: 100, y: 100 },
            initialWidth: 250,
            initialText: "これは自動リサイズ付箋です。\nテキストを追加すると高さが自動で調整されます。",
            placeholder: "ここにテキストを入力...",
            onTextChange: (text: string) => {
                console.log("テキスト変更:", text);
            },
            onPositionChange: (x: number, y: number) => {
                console.log(`位置変更: x=${x}, y=${y}`);
            },
            onDelete: () => {
                console.log("付箋削除");
                this.deleteStickyNote(basicStickyNote);
            }
        });

        // 幅広の付箋
        const wideStickyNote = new 自動リサイズ付箋View({
            initialPosition: { x: 400, y: 100 },
            initialWidth: 350,
            initialText: "幅広の自動リサイズ付箋です。\n複数行のテキストを入力してみてください。\n行数に応じて高さが調整されます。",
            minHeight: 120,
            onTextChange: (text: string) => {
                console.log("幅広付箋テキスト変更:", text);
            },
            onPositionChange: (x: number, y: number) => {
                console.log(`幅広付箋位置変更: x=${x}, y=${y}`);
            },
            onDelete: () => {
                console.log("幅広付箋削除");
                this.deleteStickyNote(wideStickyNote);
            }
        });

        // 空の付箋
        const emptyStickyNote = new 自動リサイズ付箋View({
            initialPosition: { x: 100, y: 300 },
            initialWidth: 200,
            initialText: "",
            placeholder: "空の付箋です。テキストを入力してみてください。",
            minHeight: 80,
            onTextChange: (text: string) => {
                console.log("空付箋テキスト変更:", text);
            },
            onPositionChange: (x: number, y: number) => {
                console.log(`空付箋位置変更: x=${x}, y=${y}`);
            },
            onDelete: () => {
                console.log("空付箋削除");
                this.deleteStickyNote(emptyStickyNote);
            }
        });

        this.stickyNotes.push(basicStickyNote, wideStickyNote, emptyStickyNote);

        // DOMに追加
        document.body.appendChild(basicStickyNote.dom.element);
        document.body.appendChild(wideStickyNote.dom.element);
        document.body.appendChild(emptyStickyNote.dom.element);

        // 5秒後に長いテキストを設定して動作確認
        setTimeout(() => {
            this.demonstrateAutoResize(basicStickyNote);
        }, 5000);
    }

    /**
     * 自動リサイズ機能のデモンストレーション
     */
    private demonstrateAutoResize(stickyNote: 自動リサイズ付箋View): void {
        const longText = `自動リサイズのデモンストレーション

この付箋は以下の特徴があります：
1. テキストの量に応じて高さが自動調整されます
2. スクロールバーは表示されません
3. 最小高さを設定できます
4. ドラッグして移動できます
5. 削除ボタンで閉じることができます

テキストをもっと追加してみると、
付箋の高さがさらに拡張されることが
確認できるはずです。

これは従来の固定サイズ付箋とは
異なる動作です。`;

        stickyNote.setText(longText);
        console.log("長いテキストを設定しました - 自動リサイズを確認してください");
    }

    /**
     * 付箋を削除
     */
    private deleteStickyNote(stickyNote: 自動リサイズ付箋View): void {
        const index = this.stickyNotes.indexOf(stickyNote);
        if (index !== -1) {
            this.stickyNotes.splice(index, 1);
            stickyNote.delete();
        }
    }

    /**
     * 新しい付箋を作成
     */
    public createNewStickyNote(x: number = 200, y: number = 200): 自動リサイズ付箋View {
        const newStickyNote = new 自動リサイズ付箋View({
            initialPosition: { x, y },
            initialWidth: 220,
            initialText: "",
            placeholder: "新しい付箋",
            onTextChange: (text: string) => {
                console.log("新規付箋テキスト変更:", text);
            },
            onPositionChange: (x: number, y: number) => {
                console.log(`新規付箋位置変更: x=${x}, y=${y}`);
            },
            onDelete: () => {
                console.log("新規付箋削除");
                this.deleteStickyNote(newStickyNote);
            }
        });

        this.stickyNotes.push(newStickyNote);
        document.body.appendChild(newStickyNote.dom.element);
        
        // 作成後すぐにフォーカス
        newStickyNote.focus();
        
        return newStickyNote;
    }

    /**
     * 全ての付箋を削除
     */
    public deleteAllStickyNotes(): void {
        this.stickyNotes.forEach(stickyNote => {
            stickyNote.delete();
        });
        this.stickyNotes = [];
        console.log("全ての付箋を削除しました");
    }
}

// 使用例の実行
// const example = new AutoResizeStickyNoteExample();

// グローバルオブジェクトとして利用可能にする（テスト用）
(window as any).自動リサイズ付箋Example = 自動リサイズ付箋Example;
(window as any).autoResizeExample = null;

// 手動で実行する関数
(window as any).startAutoResizeExample = () => {
    if ((window as any).autoResizeExample) {
        (window as any).autoResizeExample.deleteAllStickyNotes();
    }
    (window as any).autoResizeExample = new 自動リサイズ付箋Example();
    console.log("自動リサイズ付箋の例を開始しました。startAutoResizeExample()で再実行できます。");
};

console.log("自動リサイズ付箋Example が読み込まれました。");
console.log("使用方法: startAutoResizeExample() を実行してください。");