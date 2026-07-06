import { div, HtmlComponentBase, LV2HtmlComponentBase, PointerWife } from "SengenUI/index";

import {
    auto_resize_handle_left,
    auto_resize_handle_right,
} from "../付箋/付箋View/style.css";

export class リサイズハンドル extends LV2HtmlComponentBase {
    protected _componentRoot: HtmlComponentBase;
    private _mouseWife!: PointerWife;
    public get mouseWife(): PointerWife { return this._mouseWife; }

    public constructor(左右: 'left' | 'right') {
        super();
        this._componentRoot = this.createComponentRoot(左右);
    }

    protected createComponentRoot(左右: 'left' | 'right'): HtmlComponentBase {
        return (
            div({ class: 左右 == 'left' ? auto_resize_handle_left : auto_resize_handle_right })
                .tap((handle) => { this._mouseWife = new PointerWife(handle); })
        );
    }
}
