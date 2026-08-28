import { I配線可能, TextAreaC, 配線ポート } from "SengenUI/index";
import { 付箋召喚寸法, 付箋召喚テキストエリア } from "./付箋召喚UIstyle.css";

export interface I付箋召喚入力欄配線 {
    on入力(テキスト: string, 高さ: number): void;
}

/** 付箋召喚用の1行入力と自動高さ調整を所有するLV1拡張。 */
export class 付箋召喚入力欄 extends TextAreaC implements I配線可能<I付箋召喚入力欄配線> {
    private readonly _配線 = new 配線ポート<I付箋召喚入力欄配線>("付箋召喚入力欄");

    public constructor() {
        super({
            placeholder: "付箋の内容を入力...",
            class: 付箋召喚テキストエリア,
            rows: 1,
            spellcheck: false,
        });
        this.addTextAreaEventListener("input", e => this._入力した(e))
            .addTextAreaEventListener("focus", () => this.setStyleCSS({ outline: "2px solid #2196f3" }))
            .addTextAreaEventListener("blur", () => this.setStyleCSS({ outline: "none" }))
            .addTextAreaEventListener("keydown", e => e.stopPropagation())
            .addTextAreaEventListener("pointerdown", e => e.stopPropagation())
            .addTextAreaEventListener("pointerup", e => e.stopPropagation())
            .addTextAreaEventListener("click", e => e.stopPropagation());
    }

    private _入力した(e: Event): void {
        const テキスト = (e.target as HTMLTextAreaElement).value;
        if (テキスト.length === 0) {
            this.setStyleCSS({ height: `${付箋召喚寸法.本体最小高さ}px` });
            this._配線.先.on入力("", 付箋召喚寸法.本体最小高さ);
            return;
        }
        this.autoFitToContent();
        this._配線.先.on入力(テキスト, this.高さPxを取得する());
    }

    public 配線する(配線: I付箋召喚入力欄配線): this {
        this._配線.配線する(配線);
        return this;
    }

    public 内容を消去する(): void {
        this.setValue("");
        this.setStyleCSS({ height: `${付箋召喚寸法.本体最小高さ}px` });
    }
}
