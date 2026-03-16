import { div, DivC, LV2HtmlComponentBase } from "SengenUI/index";

import { 円状コンテキストメニューコンテナ as 円状コンテキストメニューコンテナcss } from "../style.css";
import { Iコンテキストメニュー, 円状コンテキストメニュー } from "./円状コンテキストメニュー";

export class コンテキストメニューコンテナ extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private _コンテキストメニューList: Iコンテキストメニュー[] = [];

    constructor() {
        super();
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): DivC {
        return (
          div({class: 円状コンテキストメニューコンテナcss})
              .setStyleCSS({
                  position: 'absolute', top: '0', left: '0', width: '10px', height: '10px',
              })
        );
    }

    public zIndex(zIndex: string): this {
        this._componentRoot.setStyleCSS({ zIndex: zIndex });
        return this;
    }

    public async すべてのコンテキストメニューを非表示にする(): Promise<void> {
        const 非表示Promises = this._コンテキストメニューList.map(cm => cm.非表示(10));
        return Promise.all(非表示Promises).then(() => {});
    }

    public コンテキストメニュー追加(コンテキストメニュー: Iコンテキストメニュー & LV2HtmlComponentBase): this {
        コンテキストメニュー.他のコンテキストメニューを全て非表示にする = async () => {await this.すべてのコンテキストメニューを非表示にする()};
        コンテキストメニュー.onDestroy = () => { this._コンテキストメニューList = this._コンテキストメニューList.filter(cm => cm !== コンテキストメニュー);};
        this._componentRoot.child(コンテキストメニュー);
        this._コンテキストメニューList.push(コンテキストメニュー);
        return this
    }
}