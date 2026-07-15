import {
    div, DivC, Drag中値, I配線可能, LV2部品集約Base, Px2DVector, 描画座標点, 配線ポート,
} from "SengenUI/index";
import { 付箋召喚寸法, 付箋召喚操作領域, 付箋召喚本体 } from "./付箋召喚UIstyle.css";
import { 付箋ドラッグ操作領域 } from "./付箋ドラッグ操作領域";
import { 付箋ドラッグ枠線 } from "./付箋操作仕様";
import { 付箋召喚入力欄 } from "./付箋召喚入力欄";

export interface 付箋召喚ドラッグ対象 { ドラッグ中(e: Drag中値): void; }
export interface I付箋召喚UI配線 {
    on召喚開始(text: string): 付箋召喚ドラッグ対象;
    onHover開始(): void;
}
interface 付箋召喚UI部品 {
    readonly 入力欄: 付箋召喚入力欄;
    readonly 本体: DivC;
    readonly ドラッグ操作領域: 付箋ドラッグ操作領域;
}

/** 配置物ではない付箋生成UI。ドラッグ開始時に初めて実付箋を生成する。 */
export class 付箋召喚UI extends LV2部品集約Base<付箋召喚UI部品>
    implements I配線可能<I付箋召喚UI配線> {
    protected _componentRoot: DivC;
    private readonly _配線 = new 配線ポート<I付箋召喚UI配線>("付箋召喚UI");
    private readonly _部品: 付箋召喚UI部品;
    private _text = "";
    private _ホバー中 = false;
    private _ドラッグ対象: 付箋召喚ドラッグ対象 | null = null;

    public constructor(private readonly _position: 描画座標点) {
        super();
        const 入力欄 = new 付箋召喚入力欄();
        this._部品 = {
            入力欄,
            本体: div({ class: 付箋召喚本体 }),
            ドラッグ操作領域: new 付箋ドラッグ操作領域("付箋をドラッグして作成"),
        };
        this._componentRoot = this._ルートを構築する(this._部品);
        this.再描画();
    }

    protected _ルートを構築する(部品: 付箋召喚UI部品): DivC {
        return div({ class: 付箋召喚操作領域 })
            .setAttribute("data-boomyack-role", "付箋召喚UI")
            .addDivEventListener("mouseover", () => this._ホバーした())
            .childs([
                部品.ドラッグ操作領域.配線する({
                    onPointerDown: () => {}, onContextMenu: () => {},
                    onドラッグ開始: () => this._召喚を開始する(),
                    onドラッグ中: e => this._ドラッグ対象?.ドラッグ中(e),
                    onドラッグ終了: () => { this._ドラッグ対象 = null; },
                }),
                部品.本体.child(部品.入力欄.配線する({
                    on入力: (text, height) => { this._text = text; this._高さを設定する(height); },
                })),
            ]);
    }

    private _召喚を開始する(): void {
        this.ホバー表示を解除する();
        this._ドラッグ対象 = this._配線.先.on召喚開始(this._text);
        this._text = "";
        this._部品.入力欄.内容を消去する();
        this._高さを設定する(付箋召喚寸法.本体最小高さ);
    }

    private _ホバーした(): void {
        if (this._ホバー中) return;
        this._ホバー中 = true;
        this._配線.先.onHover開始();
        this._部品.ドラッグ操作領域.アウトラインを設定する(付箋ドラッグ枠線.ホバー);
    }

    private _高さを設定する(本体高さ: number): void {
        this._部品.本体.setStyleCSS({ height: `${本体高さ}px` });
        this._componentRoot.setStyleCSS({ height: `${本体高さ + 付箋召喚寸法.操作余白 * 2}px` });
    }

    public 配線する(配線: I付箋召喚UI配線): this { this._配線.配線する(配線); return this; }
    public 再描画(): void {
        const 余白 = 付箋召喚寸法.操作余白;
        this._componentRoot.setViewportPositionByTransform(
            this._position.minus(Px2DVector.fromNumbers(余白, 余白)).toビューポート座標値());
    }
    public ホバー表示を解除する(): void {
        this._ホバー中 = false;
        this._部品.ドラッグ操作領域.アウトラインを設定する("");
    }
}
