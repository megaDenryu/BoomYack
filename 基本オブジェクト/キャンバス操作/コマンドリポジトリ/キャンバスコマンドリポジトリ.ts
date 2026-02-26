import { Iキャンバスコマンド } from "./Iキャンバスコマンド";

export class キャンバスコマンドリポジトリ {
    private undoStack: Iキャンバスコマンド[] = [];
    private redoStack: Iキャンバスコマンド[] = [];
    private readonly MAX_HISTORY = 100;

    /**
     * 新しいコマンドを登録して実行します。
     * Redoスタックはクリアされます。
     */
    public executeAndPush(command: Iキャンバスコマンド): void {
        command.execute();
        this.push(command);
    }

    /**
     * コマンドを登録だけします。（実行は既に行われている場合）
     */
    public push(command: Iキャンバスコマンド): void {
        this.undoStack.push(command);
        if (this.undoStack.length > this.MAX_HISTORY) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    }

    public undo(): void {
        const command = this.undoStack.pop();
        if (command) {
            command.undo();
            this.redoStack.push(command);
        }
    }

    public redo(): void {
        const command = this.redoStack.pop();
        if (command) {
            command.execute();
            this.undoStack.push(command);
        }
    }

    public canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    public canRedo(): boolean {
        return this.redoStack.length > 0;
    }
    
    public clear(): void {
        this.undoStack = [];
        this.redoStack = [];
    }
}
