import { div, DivC, LV2HtmlComponentBase } from "SengenUI/index";


import { IグループミニキャンバスView } from "../../I配置物";

export class グループミニキャンバスView extends LV2HtmlComponentBase implements IグループミニキャンバスView {
    protected _componentRoot: DivC;

    constructor() {
        super();
        this._componentRoot = this._ルートを構築する();
    }

    protected _ルートを構築する(): DivC {
        return (
          div({}).childs([
              // グループミニキャンバスの基本的な表示要素をここに追加
          ])
        );
    }
}
