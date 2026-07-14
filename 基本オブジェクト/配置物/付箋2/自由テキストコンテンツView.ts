import { LV2HtmlComponentBase, Px長さ } from "SengenUI/index";

import { テキストエリアサイズパラメータ, 自動リサイズテキストエリア } from "../付箋/付箋View/自動リサイズモード/自動リサイズテキストエリア";
import { I付箋コンテンツView, 付箋コンテンツView依存関係 } from "./I付箋コンテンツView";
import { テキストフォーマット適用 } from "./テキストフォーマッタサービス";
import { 自由テキストコンテンツを作る, 付箋コンテンツデータ } from "../../描画キャンバス/付箋コンテンツデータ";
import { 付箋設定状態 } from "../設定パネル";

const 自由テキストのプレースホルダー = "付箋の内容を入力...";
/**
 * テキストエリア自身には人為的な最小高さを設けない(0を指定)。ブラウザが
 * 自然に計算する1行分の高さ(padding+行の高さ)だけに初期高さを委ねることで、
 * 常に1行分の高さで表示され、入力量が増えれば自動リサイズで伸びる。
 */
const 本文テキストエリアの最小高さ = new Px長さ(0);

/**
 * 「自由テキスト」種別の付箋コンテンツ。単一のテキストエリアのみを持つ、
 * これまでの付箋の見た目そのもの。I付箋コンテンツViewの最初の実装。
 */
export class 自由テキストコンテンツView extends LV2HtmlComponentBase implements I付箋コンテンツView {
    protected _componentRoot: 自動リサイズテキストエリア;
    private _formatterCleanup?: () => void;

    public constructor(依存関係: 付箋コンテンツView依存関係) {
        super();
        this._componentRoot = new 自動リサイズテキストエリア({
            initialText: 依存関係.初期テキスト,
            placeholder: 自由テキストのプレースホルダー,
            初期テキストエリアサイズパラメータ: new テキストエリアサイズパラメータ().setMinHeight(本文テキストエリアの最小高さ),
            onTextChange: 依存関係.onTextChange,
            onHeightChange: 依存関係.onHeightChange,
            onBlurTextCommit: 依存関係.onBlurTextCommit,
            onFocus: 依存関係.onFocus,
        });
        this._formatterCleanup = テキストフォーマット適用(this._componentRoot.element);
    }

    public get text(): string {
        return this._componentRoot.getText();
    }

    public setText(text: string): void {
        this._componentRoot.setValue(text);
    }

    public get コンテンツデータ(): 付箋コンテンツデータ {
        return 自由テキストコンテンツを作る(this.text);
    }

    public 設定を適用(設定: 付箋設定状態): void {
        this._componentRoot.setTextSize(設定.文字サイズ).set文字色(設定.文字色);
    }

    public AI操作に対応しているか(): boolean {
        return true;
    }

    public delete(): void {
        super.delete();
        this._formatterCleanup?.();
    }
}
