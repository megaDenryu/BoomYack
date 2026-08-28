import { I配線可能, Px長さ, TextAreaC, 配線ポート } from "SengenUI/index";
import { sticky_note_textarea } from "./自動リサイズ付箋style.css";
import { テキストエリアサイズパラメータ, テキストエリアサイズパラメータ管理 } from "./テキストエリアサイズパラメータ";

export interface 自動リサイズテキストエリアオプション {
    initialText?: string;
    placeholder?: string;
    追加クラス?: string;
    初期テキストエリアサイズパラメータ?: テキストエリアサイズパラメータ;
}
export interface I自動リサイズテキストエリア配線 {
    onTextChange(text: string): void;
    onHeightChange(height: number): void;
    onFocus(): void;
    onBlur(): void;
    onBlurTextCommit(oldText: string, newText: string): void;
}

/** 自動高さ調整と付箋入力操作を所有するLV1拡張。 */
export class 自動リサイズテキストエリア extends TextAreaC implements I配線可能<I自動リサイズテキストエリア配線> {
    private _text: string;
    private _focusText = "";
    private readonly _sizes: テキストエリアサイズパラメータ管理;
    private readonly _配線 = new 配線ポート<I自動リサイズテキストエリア配線>("自動リサイズテキストエリア");

    public constructor(option: 自動リサイズテキストエリアオプション) {
        const text = option.initialText ?? "";
        super({ value: text, placeholder: option.placeholder ?? "付箋のテキストを入力...",
            class: option.追加クラス ? [sticky_note_textarea, option.追加クラス] : sticky_note_textarea,
            rows: 1, spellcheck: false });
        this._text = text;
        this._sizes = new テキストエリアサイズパラメータ管理(option.初期テキストエリアサイズパラメータ ?? new テキストエリアサイズパラメータ());
        this.setStyleCSS({ width: "100%", border: "none", backgroundColor: "transparent",
            fontFamily: "Arial, sans-serif", resize: "none", outline: "none",
            boxSizing: "border-box", overflow: "hidden" });
        this._sizeStyleを反映する();
        this.addTextAreaEventListener("input", e => this._入力(e))
            .addTextAreaEventListener("focus", e => this._focus(e))
            .addTextAreaEventListener("blur", e => this._blur(e))
            .addTextAreaEventListener("keydown", e => e.stopPropagation())
            .addTextAreaEventListener("pointerdown", e => e.stopPropagation())
            .addTextAreaEventListener("pointerup", e => e.stopPropagation())
            .addTextAreaEventListener("click", e => e.stopPropagation());
        setTimeout(() => this._高さを調整する(), 0);
    }

    private _入力(e: Event): void { this._text = (e.target as HTMLTextAreaElement).value; this._配線.先.onTextChange(this._text); this._高さを調整する(); }
    private _focus(e: FocusEvent): void { this.setStyleCSS({ outline: "2px solid #2196f3" }); this._focusText = (e.target as HTMLTextAreaElement).value; this._配線.先.onFocus(); }
    private _blur(e: FocusEvent): void { const value = (e.target as HTMLTextAreaElement).value; this.setStyleCSS({ outline: "none" }); this._配線.先.onBlur(); if (this._focusText !== value) this._配線.先.onBlurTextCommit(this._focusText, value); }
    private _高さを調整する(): void {
        const min = this._sizes.現在のサイズパラメータ.minHeight;
        if (this._text.length === 0) { this.setStyleCSS({ height: min.toCssValue() }); this._配線.先.onHeightChange(min.value); return; }
        this.autoFitToContent();
        this._配線.先.onHeightChange(this.高さPxを取得する());
    }
    private _sizeStyleを反映する(): void { const x = this._sizes.現在のサイズパラメータ; this.setStyleCSS({ padding: x.padding.toCssValue(), fontSize: x.textSize.toCssValue(), lineHeight: x.lineHeight.toCssValue(), minHeight: x.minHeight.toCssValue() }); }

    public 配線する(配線: I自動リサイズテキストエリア配線): this { this._配線.配線する(配線); return this; }
    public setValue(text: string): this { this._text = text; super.setValue(text); setTimeout(() => this._高さを調整する(), 0); return this; }
    public getValue(): string { return super.getValue(); }
    public get textArea(): TextAreaC { return this; }
    public getText(): string { return this._text; }
    public setMinHeight(n: number): this { this._sizes.scale1の時のサイズパラメータ = this._sizes.scale1の時のサイズパラメータ.setMinHeight(new Px長さ(n)); this._高さを調整する(); return this; }
    public setLineHeight(n: number): this { this._sizes.scale1の時のサイズパラメータ = this._sizes.scale1の時のサイズパラメータ.setLineHeight(new Px長さ(n)); this._sizeStyleを反映する(); return this; }
    public setTextSize(n: number): this { this._sizes.scale1の時のサイズパラメータ = this._sizes.scale1の時のサイズパラメータ.setTextSize(new Px長さ(n)); this._sizeStyleを反映する(); return this; }
    public setTextAreaSize(): void { this._sizeStyleを反映する(); this._高さを調整する(); }
    public set文字色(色: string): void { this.setStyleCSS({ color: 色 }); }
}
