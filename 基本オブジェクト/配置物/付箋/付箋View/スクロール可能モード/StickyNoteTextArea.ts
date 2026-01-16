import { LV2HtmlComponentBase, TextAreaC } from "SengenUI/index";


import { sticky_note_textarea } from "../style.css";

/**
 * 付箋テキスト入力機能専用コンポーネント
 * テキスト入力、フォーカス管理、イベント競合回避を担当
 */
export class StickyNoteTextArea extends LV2HtmlComponentBase {
    protected _componentRoot: TextAreaC;
    private _text: string;
    
    // コールバック
    private _onTextChange: (text: string) => void;
    private _onFocus: () => void;
    private _onBlur: () => void;

    constructor(options: {
        initialText?: string;
        placeholder?: string;
        onTextChange: (text: string) => void;
        onFocus?: () => void;
        onBlur?: () => void;
    }) {
        super();
        this._text = options.initialText ?? "";
        this._onTextChange = options.onTextChange;
        this._onFocus = options.onFocus ?? (() => {});
        this._onBlur = options.onBlur ?? (() => {});
        
        this._componentRoot = this.createComponentRoot(options.placeholder);
    }

    protected createComponentRoot(placeholder?: string): TextAreaC {
        return new TextAreaC({
            value: this._text,
            placeholder: placeholder ?? "付箋のテキストを入力...",
            class: sticky_note_textarea
        })
        .addTextAreaEventListener('input', (e) => {
            const target = e.target as HTMLTextAreaElement;
            this._text = target.value;
            this._onTextChange(this._text);
        })
        .addTextAreaEventListener('focus', (e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.outline = "2px solid #2196f3";
            this._onFocus();
        })
        .addTextAreaEventListener('blur', (e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.outline = "none";
            this._onBlur();
        })
        .addTextAreaEventListener('mousedown', (e) => {
            // ドラッグ・リサイズとの競合を回避
            e.stopPropagation();
        });
    }
    
    // 外部からテキストを設定
    public setValue(text: string): void {
        this._text = text;
        this._componentRoot.setValue(text);
    }
    
    // 現在のテキストを取得
    public getValue(): string {
        return this._componentRoot.getValue();
    }
    
    // フォーカスを当てる
    public focus(): void {
        this._componentRoot.focus();
    }
    
    // フォーカスを外す（内部的に処理されるため実装は不要）
    public blur(): void {
        // TextAreaCのblurは自動的に処理される
    }
    
    // 現在のテキスト状態を取得
    public getText(): string {
        return this._text;
    }
    
    // テキスト変更の通知（外部からの強制更新用）
    public notifyTextChange(): void {
        this._onTextChange(this._text);
    }
}
