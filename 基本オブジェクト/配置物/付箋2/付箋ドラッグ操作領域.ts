import {
    div, DivC, Iドラッグに連動可能, LV2HtmlComponentBase, PointerWife,
} from "SengenUI/index";
import {
    上ドラッグハンドル, 下ドラッグハンドル, 付箋ドラッグ操作枠,
    右ドラッグハンドル, 左ドラッグハンドル,
} from "./付箋ドラッグ操作領域style.css";

export interface 付箋ドラッグ操作領域オプション extends Iドラッグに連動可能 {
    ariaLabel: string;
    onPointerDown?: (e: PointerEvent) => void;
    onContextMenu?: (e: MouseEvent) => void;
}

type ドラッグハンドル方向 = "上" | "右" | "下" | "左";

/** 黄色い本体と重ならない、上下左右4本の付箋ドラッグハンドル。 */
export class 付箋ドラッグ操作領域 extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private readonly _pointerWife: PointerWife;

    public constructor(option: 付箋ドラッグ操作領域オプション) {
        super();
        this._componentRoot = div({ class: 付箋ドラッグ操作枠 })
            .setAttribute("aria-label", option.ariaLabel)
            .setAttribute("data-boomyack-role", "付箋ドラッグ操作領域")
            .childs([
                this._ハンドルを構築する(上ドラッグハンドル, "上"),
                this._ハンドルを構築する(右ドラッグハンドル, "右"),
                this._ハンドルを構築する(下ドラッグハンドル, "下"),
                this._ハンドルを構築する(左ドラッグハンドル, "左"),
            ]);
        if (option.onPointerDown) {
            this._componentRoot.addDivEventListener("pointerdown", option.onPointerDown);
        }
        if (option.onContextMenu) {
            this._componentRoot.addDivEventListener("contextmenu", option.onContextMenu);
        }
        this._pointerWife = new PointerWife(this._componentRoot).ドラッグ連動登録(option);
    }

    private _ハンドルを構築する(className: string, direction: ドラッグハンドル方向): DivC {
        return div({ class: className })
            .setAttribute("data-boomyack-drag-handle", direction)
            .setAttribute("aria-hidden", "true");
    }

    public onHover(callback: (e: MouseEvent) => void): this {
        this._componentRoot.addDivEventListener("mouseover", callback);
        return this;
    }

    public onHoverEnd(callback: (e: MouseEvent) => void): this {
        this._componentRoot.addDivEventListener("mouseleave", callback);
        return this;
    }

    public アウトラインを設定する(outline: string): void {
        this._componentRoot.setStyleCSS({ outline });
    }
}
