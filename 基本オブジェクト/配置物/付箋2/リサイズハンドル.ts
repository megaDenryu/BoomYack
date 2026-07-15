import {
    div, Drag中値, HtmlComponentBase, I配線可能, LV2HtmlComponentBase,
    PointerWife, 配線ポート,
} from "SengenUI/index";

import {
    auto_resize_handle_left,
    auto_resize_handle_right,
} from "./自動リサイズ付箋style.css";

export interface Iリサイズハンドル配線 {
    onドラッグ中(e: Drag中値): void;
}

export class リサイズハンドル extends LV2HtmlComponentBase
    implements I配線可能<Iリサイズハンドル配線> {
    protected _componentRoot: HtmlComponentBase;
    private readonly _配線 = new 配線ポート<Iリサイズハンドル配線>("リサイズハンドル");

    public constructor(左右: 'left' | 'right') {
        super();
        this._componentRoot = this._ルートを構築する(左右);
    }

    protected _ルートを構築する(左右: 'left' | 'right'): HtmlComponentBase {
        return div({ class: 左右 == 'left' ? auto_resize_handle_left : auto_resize_handle_right })
            .tap(handle => new PointerWife(handle).ドラッグ連動登録({
                onドラッグ開始: () => {},
                onドラッグ中: e => this._配線.先.onドラッグ中(e),
                onドラッグ終了: () => {},
            }));
    }

    public 配線する(配線: Iリサイズハンドル配線): this {
        this._配線.配線する(配線);
        return this;
    }
}
