export interface Iキャンバスコマンド {
    /** コマンドを実行（Redo時にも利用される場合があります） */
    execute(): void;
    /** コマンドを取り消す（Undo時に利用されます） */
    undo(): void;
}
