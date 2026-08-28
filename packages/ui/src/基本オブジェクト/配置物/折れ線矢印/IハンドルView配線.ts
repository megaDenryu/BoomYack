import { Drag中値, Drag終了値, Drag開始値 } from "SengenUI/index";

export interface IハンドルView配線 {
    onドラッグ開始(e: Drag開始値): void;
    onドラッグ中(e: Drag中値): void;
    onドラッグ終了(e: Drag終了値): void;
    on右クリック(e: MouseEvent): void;
}
