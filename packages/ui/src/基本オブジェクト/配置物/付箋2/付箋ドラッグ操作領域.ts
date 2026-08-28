import {
    div, DivC, Drag中値, I配線可能, LV2HtmlComponentBase, PointerWife, 配線ポート,
} from "SengenUI/index";
import {
    上ドラッグハンドル, 下ドラッグハンドル, 付箋ドラッグ操作枠,
    右ドラッグハンドル, 左ドラッグハンドル,
} from "./付箋ドラッグ操作領域style.css";

export interface I付箋ドラッグ操作領域配線 {
    onPointerDown(e: PointerEvent): void;
    onContextMenu(e: MouseEvent): void;
    onドラッグ開始(): void;
    onドラッグ中(e: Drag中値): void;
    onドラッグ終了(): void;
}

type ドラッグハンドル方向 = "上" | "右" | "下" | "左";

/** 黄色い本体と重ならない、上下左右4本のドラッグハンドル。 */
export class 付箋ドラッグ操作領域 extends LV2HtmlComponentBase
    implements I配線可能<I付箋ドラッグ操作領域配線> {
    protected _componentRoot: DivC;
    private readonly _配線 = new 配線ポート<I付箋ドラッグ操作領域配線>("付箋ドラッグ操作領域");
    private readonly _pointerWife: PointerWife;

    public constructor(ariaLabel: string) {
        super();
        this._componentRoot = div({ class: 付箋ドラッグ操作枠 })
            .setAttribute("aria-label", ariaLabel)
            .setAttribute("data-boomyack-role", "付箋ドラッグ操作領域")
            .addDivEventListener("pointerdown", e => this._配線.先.onPointerDown(e))
            .addDivEventListener("contextmenu", e => this._配線.先.onContextMenu(e))
            .childs([
                this._ハンドル(上ドラッグハンドル, "上"),
                this._ハンドル(右ドラッグハンドル, "右"),
                this._ハンドル(下ドラッグハンドル, "下"),
                this._ハンドル(左ドラッグハンドル, "左"),
            ]);
        this._pointerWife = new PointerWife(this._componentRoot).ドラッグ連動登録({
            onドラッグ開始: () => this._配線.先.onドラッグ開始(),
            onドラッグ中: e => this._配線.先.onドラッグ中(e),
            onドラッグ終了: () => this._配線.先.onドラッグ終了(),
        });
    }

    private _ハンドル(className: string, direction: ドラッグハンドル方向): DivC {
        return div({ class: className })
            .setAttribute("data-boomyack-drag-handle", direction)
            .setAttribute("aria-hidden", "true");
    }

    public 配線する(配線: I付箋ドラッグ操作領域配線): this {
        this._配線.配線する(配線);
        return this;
    }

    public アウトラインを設定する(outline: string): void {
        this._componentRoot.setStyleCSS({ outline });
    }
}
