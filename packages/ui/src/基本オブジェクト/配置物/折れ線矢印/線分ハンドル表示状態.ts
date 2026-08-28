import { DivC } from "SengenUI/index";
import { 線分ハンドル状態 } from "./線分ハンドル.style.css";

type 表示状態 = keyof typeof 線分ハンドル状態;

export class 線分ハンドル表示状態 {
    private _選択中 = false;
    private _ホバー中 = false;
    private _ドラッグ中 = false;

    public 選択状態を設定する(value: boolean): void { this._選択中 = value; }
    public ホバー状態を設定する(value: boolean): void { this._ホバー中 = value; }
    public ドラッグ状態を設定する(value: boolean): void { this._ドラッグ中 = value; }

    public 要素へ反映する(element: DivC): void {
        Object.values(線分ハンドル状態).forEach(className => element.removeClass(className));
        element.addClass(線分ハンドル状態[this._現在の状態()]);
    }

    private _現在の状態(): 表示状態 {
        if (this._ドラッグ中) return "ドラッグ中";
        if (this._選択中) return this._ホバー中 ? "選択中ホバー" : "選択中";
        return this._ホバー中 ? "未選択ホバー" : "通常";
    }
}
