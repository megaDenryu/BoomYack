import { div, DivC, LV2HtmlComponentBase, Px長さ } from "SengenUI/index";

import { テキストエリアサイズパラメータ, 自動リサイズテキストエリア } from "../付箋/付箋View/自動リサイズモード/自動リサイズテキストエリア";
import { I付箋コンテンツView, 付箋コンテンツView共通依存関係 } from "./I付箋コンテンツView";
import { タイトル付きコンテンツを作る, 付箋コンテンツデータ } from "../../描画キャンバス/付箋コンテンツデータ";
import { テキストフォーマット適用 } from "./テキストフォーマッタサービス";
import { タイトル入力欄, タイトル付き付箋コンテナ } from "./style.css";
import { 付箋設定状態 } from "../設定パネル";

const タイトルのプレースホルダー = "タイトルを入力...";
const 本文のプレースホルダー = "本文を入力...";
/**
 * タイトル欄・本文欄いずれもテキストエリア自身には人為的な最小高さを
 * 設けない(0を指定)。ブラウザが自然に計算する1行分の高さ(padding+行の
 * 高さ)だけに初期高さを委ねることで、タイトル・本文とも常に1行分の高さ
 * で表示され、入力量が増えれば自動リサイズで伸びる。
 */
const テキストエリア自身の最小高さ = new Px長さ(0);

/** タイトル付きコンテンツViewを構築するために枠から渡す依存関係 */
export interface タイトル付きコンテンツView依存関係 extends 付箋コンテンツView共通依存関係 {
    初期タイトル: string;
    初期本文: string;
}

/**
 * 「タイトル付き」種別の付箋コンテンツ。タイトル行(1行、編集可)+本文テキストエリアの2フィールド。
 * I付箋コンテンツViewの2つ目の実装。枠(自動リサイズ付箋View)への変更なしに載ることが
 * 枠/コンテンツ分離の証明であり、このクラスは既存のI付箋コンテンツView契約のみに依存する。
 */
export class タイトル付きコンテンツView extends LV2HtmlComponentBase implements I付箋コンテンツView {
    protected _componentRoot: DivC;
    private _タイトルエリア: 自動リサイズテキストエリア;
    private _本文エリア: 自動リサイズテキストエリア;
    private _タイトル高さ = 0;
    private _本文高さ = 0;
    private _formatterCleanup?: () => void;

    public constructor(依存関係: タイトル付きコンテンツView依存関係) {
        super();
        this._componentRoot = this._ルートを構築する(依存関係);
        this._formatterCleanup = テキストフォーマット適用(this._本文エリア.element);
    }

    private _ルートを構築する(依存関係: タイトル付きコンテンツView依存関係): DivC {
        const 高さ変更を通知する = (): void => {
            依存関係.onHeightChange(this._タイトル高さ + this._本文高さ);
        };

        return (
            div({ class: タイトル付き付箋コンテナ }).childs([
                new 自動リサイズテキストエリア({
                    initialText: 依存関係.初期タイトル,
                    placeholder: タイトルのプレースホルダー,
                    追加クラス: タイトル入力欄,
                    初期テキストエリアサイズパラメータ: new テキストエリアサイズパラメータ().setMinHeight(テキストエリア自身の最小高さ),
                    onTextChange: () => { 依存関係.onTextChange(this.text); },
                    onHeightChange: (newHeight) => {
                        this._タイトル高さ = newHeight;
                        高さ変更を通知する();
                    },
                    onBlurTextCommit: (旧タイトル, 新タイトル) => {
                        依存関係.onBlurTextCommit(
                            `${旧タイトル}\n${this._本文エリア.getText()}`,
                            `${新タイトル}\n${this._本文エリア.getText()}`
                        );
                    },
                    onFocus: 依存関係.onFocus,
                }).tap((self) => { this._タイトルエリア = self; }),
                new 自動リサイズテキストエリア({
                    initialText: 依存関係.初期本文,
                    placeholder: 本文のプレースホルダー,
                    初期テキストエリアサイズパラメータ: new テキストエリアサイズパラメータ().setMinHeight(テキストエリア自身の最小高さ),
                    onTextChange: () => { 依存関係.onTextChange(this.text); },
                    onHeightChange: (newHeight) => {
                        this._本文高さ = newHeight;
                        高さ変更を通知する();
                    },
                    onBlurTextCommit: (旧本文, 新本文) => {
                        依存関係.onBlurTextCommit(
                            `${this._タイトルエリア.getText()}\n${旧本文}`,
                            `${this._タイトルエリア.getText()}\n${新本文}`
                        );
                    },
                    onFocus: 依存関係.onFocus,
                }).tap((self) => { this._本文エリア = self; }),
            ])
        );
    }

    public get text(): string {
        return `${this._タイトルエリア.getText()}\n${this._本文エリア.getText()}`;
    }

    public setText(text: string): void {
        const 改行位置 = text.indexOf("\n");
        if (改行位置 === -1) {
            this._タイトルエリア.setValue(text);
            this._本文エリア.setValue("");
            return;
        }
        this._タイトルエリア.setValue(text.slice(0, 改行位置));
        this._本文エリア.setValue(text.slice(改行位置 + 1));
    }

    public get コンテンツデータ(): 付箋コンテンツデータ {
        return タイトル付きコンテンツを作る(this._タイトルエリア.getText(), this._本文エリア.getText());
    }

    public 設定を適用(設定: 付箋設定状態): void {
        this._タイトルエリア.setTextSize(設定.文字サイズ);
        this._本文エリア.setTextSize(設定.文字サイズ).set文字色(設定.文字色);
    }

    public AI操作に対応しているか(): boolean {
        return true;
    }

    public delete(): void {
        super.delete();
        this._formatterCleanup?.();
    }
}
