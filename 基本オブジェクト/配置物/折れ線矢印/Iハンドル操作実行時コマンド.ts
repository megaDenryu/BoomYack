import { Drag中値 } from "SengenUI/index";

export interface Iハンドル操作実行時コマンド {
    onハンドルドラッグ開始?(e: Drag中値): void;
    onハンドルドラッグ中?(e: Drag中値): void;
    onハンドルドラッグ終了?(e: Drag中値): void;
    on右クリック?(e: MouseEvent): void;
}
