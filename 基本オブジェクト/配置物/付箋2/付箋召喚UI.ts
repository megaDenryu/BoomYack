import {
    div, DivC, Drag中値, LV2HtmlComponentBase,
    Px2DVector, TextAreaC, 描画座標点,
} from "SengenUI/index";
import {
    付箋召喚寸法, 付箋召喚操作領域, 付箋召喚テキストエリア, 付箋召喚本体,
} from "./付箋召喚UIstyle.css";
import { 付箋ドラッグ操作領域 } from "./付箋ドラッグ操作領域";

export interface 付箋召喚ドラッグ対象 {
    ドラッグ中(e: Drag中値): void;
}

export interface 付箋召喚UIオプション {
    position: 描画座標点;
    on召喚開始(text: string): 付箋召喚ドラッグ対象;
}

/** 配置物ではない付箋生成UI。ドラッグ開始時に初めて実付箋を生成する。 */
export class 付箋召喚UI extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private readonly _position: 描画座標点;
    private readonly _textArea: TextAreaC;
    private readonly _付箋本体: DivC;
    private _text = "";
    private _ドラッグ対象: 付箋召喚ドラッグ対象 | null = null;

    public constructor(option: 付箋召喚UIオプション) {
        super();
        this._position = option.position;
        this._textArea = this._テキストエリアを構築する();
        this._付箋本体 = div({ class: 付箋召喚本体 }).child(this._textArea);
        this._componentRoot = div({ class: 付箋召喚操作領域 })
            .setAttribute("data-boomyack-role", "付箋召喚UI")
            .childs([
                new 付箋ドラッグ操作領域({
                    ariaLabel: "付箋をドラッグして作成",
                    onドラッグ開始: () => {
                        this._ドラッグ対象 = option.on召喚開始(this._text);
                        this._text = "";
                        this._textArea.setValue("");
                        this._高さを設定する(付箋召喚寸法.本体最小高さ);
                    },
                    onドラッグ中: e => this._ドラッグ対象?.ドラッグ中(e),
                    onドラッグ終了: () => {
                        this._ドラッグ対象 = null;
                    },
                }),
                this._付箋本体,
            ]);
        this.再描画();
    }

    private _テキストエリアを構築する(): TextAreaC {
        return new TextAreaC({
            placeholder: "付箋の内容を入力...",
            class: 付箋召喚テキストエリア,
            rows: 1,
            spellcheck: false,
        })
            .addTextAreaEventListener("input", e => {
                this._text = (e.target as HTMLTextAreaElement).value;
                if (this._text.length === 0) {
                    this._textArea.setStyleCSS({ height: `${付箋召喚寸法.本体最小高さ}px` });
                    this._高さを設定する(付箋召喚寸法.本体最小高さ);
                    return;
                }
                this._textArea.autoFitToContent();
                this._高さを設定する(this._textArea.高さPxを取得する());
            })
            .addTextAreaEventListener("focus", e => {
                (e.target as HTMLTextAreaElement).style.outline = "2px solid #2196f3";
            })
            .addTextAreaEventListener("blur", e => {
                (e.target as HTMLTextAreaElement).style.outline = "none";
            })
            .addTextAreaEventListener("keydown", e => e.stopPropagation())
            .addTextAreaEventListener("pointerdown", e => e.stopPropagation())
            .addTextAreaEventListener("pointerup", e => e.stopPropagation())
            .addTextAreaEventListener("click", e => e.stopPropagation());
    }

    private _高さを設定する(本体高さ: number): void {
        this._付箋本体.setStyleCSS({ height: `${本体高さ}px` });
        this._componentRoot.setStyleCSS({
            height: `${本体高さ + 付箋召喚寸法.操作余白 * 2}px`,
        });
    }

    public 再描画(): void {
        const 余白 = 付箋召喚寸法.操作余白;
        const offset = this._position.minus(Px2DVector.fromNumbers(余白, 余白));
        this._componentRoot.setViewportPositionByTransform(offset.toビューポート座標値());
    }
}
