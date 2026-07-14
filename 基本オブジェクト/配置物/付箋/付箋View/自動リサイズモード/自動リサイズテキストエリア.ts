import { LV2HtmlComponentBase, Px長さ, TextAreaC } from "SengenUI/index";


import { sticky_note_textarea } from "../style.css";


/**
 * 自動リサイズ対応テキストエリアコンポーネント
 * テキスト量に応じて高さが自動調整される
 */
export class 自動リサイズテキストエリア extends LV2HtmlComponentBase {
    protected _componentRoot: TextAreaC;
    private _text: string;
    private _テキストエリアサイズパラメータ管理: テキストエリアサイズパラメータ管理;
    
    // コールバック
    private _onTextChange: (text: string) => void;
    private _onHeightChange: (newHeight: number) => void;
    private _onFocus: () => void;
    private _onBlur: () => void;
    private _onBlurTextCommit?: (oldText: string, newText: string) => void;
    private _textOnFocus: string = "";

    constructor(options: {
        initialText?: string;
        placeholder?: string;
        /** 付箋種別ごとの見た目差分(タイトル行の下線等)を追加するための任意クラス */
        追加クラス?: string;
        初期テキストエリアサイズパラメータ?: テキストエリアサイズパラメータ;
        onTextChange: (text: string) => void;
        onHeightChange: (newHeight: number) => void;
        onFocus?: () => void;
        onBlur?: () => void;
        onBlurTextCommit?: (oldText: string, newText: string) => void;
    }) {
        super();
        this._text = options.initialText ?? "";
        this._onTextChange = options.onTextChange;
        this._onHeightChange = options.onHeightChange;
        this._onFocus = options.onFocus ?? (() => {});
        this._onBlur = options.onBlur ?? (() => {});
        this._onBlurTextCommit = options.onBlurTextCommit;
        this._テキストエリアサイズパラメータ管理 = new テキストエリアサイズパラメータ管理(
            options.初期テキストエリアサイズパラメータ ?? new テキストエリアサイズパラメータ()
        );
        this._componentRoot = this._ルートを構築する(options.placeholder, options.追加クラス);

        // 初期高さを設定（遅延実行で親コンポーネントの初期化を待つ）
        setTimeout(() => this.adjustHeight(), 0);
    }

    protected _ルートを構築する(placeholder?: string, 追加クラス?: string): TextAreaC {
        return new TextAreaC({
            value: this._text,
            placeholder: placeholder ?? "付箋のテキストを入力...",
            class: 追加クラス ? [sticky_note_textarea, 追加クラス] : sticky_note_textarea,
            spellcheck: false
        })
        .setStyleCSS({
            width: "100%",
            padding: this._テキストエリアサイズパラメータ管理.現在のサイズパラメータ.padding.toCssValue(),
            border: "none",
            backgroundColor: "transparent",
            fontFamily: "Arial, sans-serif",
            fontSize: this._テキストエリアサイズパラメータ管理.現在のサイズパラメータ.textSize.toCssValue(),
            lineHeight: this._テキストエリアサイズパラメータ管理.現在のサイズパラメータ.lineHeight.toCssValue(),
            resize: "none", // 手動リサイズを無効化
            outline: "none",
            boxSizing: "border-box",
            overflow: "hidden", // スクロールバーを非表示
            minHeight: this._テキストエリアサイズパラメータ管理.現在のサイズパラメータ.minHeight.toCssValue()
        })
        .addTextAreaEventListener('input', (e) => {
            const target = e.target as HTMLTextAreaElement;
            this._text = target.value;
            this._onTextChange(this._text);
            this.adjustHeight();
        })
        .addTextAreaEventListener('focus', (e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.outline = "2px solid #2196f3";
            this._textOnFocus = target.value;
            this._onFocus();
        })
        .addTextAreaEventListener('blur', (e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.outline = "none";
            this._onBlur();
            if (this._onBlurTextCommit && this._textOnFocus !== target.value) {
                this._onBlurTextCommit(this._textOnFocus, target.value);
            }
        })
        .addTextAreaEventListener('keydown', (e) => {
            e.stopPropagation(); // Undoショートカット等がCanvasに伝播するのを防ぐ
        })
        .addTextAreaEventListener('pointerdown', (e) => {
            // ドラッグ・リサイズとの競合を回避し、フォーカス取得を確実にする
            e.stopPropagation();
        })
        .addTextAreaEventListener('pointerup', (e) => {
            // 親要素のMouseWifeドラッグ終了処理がフォーカスを奪うのを防ぐ
            e.stopPropagation();
        })
        .addTextAreaEventListener('click', (e) => {
            // クリックイベントの伝搬を停止してフォーカスを維持
            e.stopPropagation();
        });
    }
    
    /**
     * テキスト量に応じて高さを自動調整
     */
    private adjustHeight(): void {
        if (!this._componentRoot) {
            return; // まだ初期化されていない場合は何もしない
        }
        
        const textarea = this._componentRoot.dom.element as HTMLTextAreaElement;
        if (!textarea) {
            return; // DOM要素が取得できない場合は何もしない
        }
        
        // 一時的に高さをリセットしてscrollHeightを正確に取得
        textarea.style.height = 'auto';
        
        // 必要な高さを計算
        const scrollHeight = new Px長さ(textarea.scrollHeight);
        const minHeight = this._テキストエリアサイズパラメータ管理.現在のサイズパラメータ.minHeight;
        const newHeight = minHeight.isGreaterThan(scrollHeight) ? minHeight : scrollHeight;
        
        // 新しい高さを適用
        textarea.style.height = newHeight.toCssValue();
        
        // 親コンポーネントに高さ変更を通知
        if (this._onHeightChange) {
            this._onHeightChange(newHeight.value);
        }
    }
    
    // 外部からテキストを設定
    public setValue(text: string): void {
        this._text = text;
        this._componentRoot.setValue(text);
        // 高さを再調整
        setTimeout(() => this.adjustHeight(), 0);
    }
    
    // 現在のテキストを取得
    public getValue(): string {
        return this._componentRoot.getValue();
    }

    public get element(): HTMLTextAreaElement {
        return this._componentRoot.dom.element as HTMLTextAreaElement;
    }
    
    // フォーカスを当てる
    public focus(): void {
        this._componentRoot.focus();
    }
    
    // フォーカスを外す
    public blur(): void {
        // TextAreaCのblurは自動的に処理される
    }
    
    // 現在のテキスト状態を取得
    public getText(): string {
        return this._text;
    }
    
    // 最小高さを設定
    public setMinHeight(minHeight: number): this {
        this._テキストエリアサイズパラメータ管理.scale1の時のサイズパラメータ = this._テキストエリアサイズパラメータ管理.scale1の時のサイズパラメータ.setMinHeight(new Px長さ(minHeight));
        this.adjustHeight();
        return this;
    }
    
    // 行の高さを設定
    public setLineHeight(lineHeight: number): this {
        this._テキストエリアサイズパラメータ管理.scale1の時のサイズパラメータ = this._テキストエリアサイズパラメータ管理.scale1の時のサイズパラメータ.setLineHeight(new Px長さ(lineHeight));
        this.setTextAreaSize();
        return this;
    }

    public setTextSize(textSize: number): this {
        this._テキストエリアサイズパラメータ管理.scale1の時のサイズパラメータ = this._テキストエリアサイズパラメータ管理.scale1の時のサイズパラメータ.setTextSize(new Px長さ(textSize));
        this.setTextAreaSize();
        return this;
    }

    public setTextAreaSize(): void {
        this._componentRoot.setStyleCSS({
            padding: this._テキストエリアサイズパラメータ管理.現在のサイズパラメータ.padding.toCssValue(),
            fontSize: this._テキストエリアサイズパラメータ管理.現在のサイズパラメータ.textSize.toCssValue(),
            lineHeight: this._テキストエリアサイズパラメータ管理.現在のサイズパラメータ.lineHeight.toCssValue(),
            minHeight: this._テキストエリアサイズパラメータ管理.現在のサイズパラメータ.minHeight.toCssValue()
        });
        this.adjustHeight();
    }

    /** 文字色を設定 */
    public set文字色(色: string): void {
        this._componentRoot.setStyleCSS({ color: 色 });
    }




}

export class テキストエリアサイズパラメータ {
    public readonly padding: Px長さ;
    public readonly lineHeight: Px長さ;
    public readonly minHeight: Px長さ;
    public readonly textSize: Px長さ;

    constructor(
        padding: Px長さ = new Px長さ(16),
        lineHeight: Px長さ = new Px長さ(20),
        minHeight: Px長さ = new Px長さ(80),
        textSize: Px長さ = new Px長さ(14)
    ) {
        this.padding = padding;
        this.lineHeight = lineHeight;
        this.minHeight = minHeight;
        this.textSize = textSize;
    }

    public multiplyScale(scale: number): テキストエリアサイズパラメータ {
        return new テキストエリアサイズパラメータ(
            this.padding.multiply(scale),
            this.lineHeight.multiply(scale),
            this.minHeight.multiply(scale),
            this.textSize.multiply(scale)
        );
    }

    public setMinHeight(minHeight: Px長さ): テキストエリアサイズパラメータ {
        return new テキストエリアサイズパラメータ(
            this.padding,
            this.lineHeight,
            minHeight,
            this.textSize
        );
    }

    public setLineHeight(lineHeight: Px長さ): テキストエリアサイズパラメータ {
        return new テキストエリアサイズパラメータ(
            this.padding,
            lineHeight,
            this.minHeight,
            this.textSize
        );
    }

    public setTextSize(textSize: Px長さ): テキストエリアサイズパラメータ {
        return new テキストエリアサイズパラメータ(
            this.padding,
            this.lineHeight,
            this.minHeight,
            textSize
        );
    }
}

export class テキストエリアサイズパラメータ管理 {
    public scale: number = 1.0;
    public scale1の時のサイズパラメータ: テキストエリアサイズパラメータ;

    constructor(
        scale1の時のサイズパラメータ: テキストエリアサイズパラメータ = new テキストエリアサイズパラメータ()
    ) {
        this.scale1の時のサイズパラメータ = scale1の時のサイズパラメータ;
    }

    public get 現在のサイズパラメータ(): テキストエリアサイズパラメータ {
        return this.scale1の時のサイズパラメータ.multiplyScale(this.scale);
    }
}
