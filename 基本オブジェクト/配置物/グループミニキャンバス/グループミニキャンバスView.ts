import { DivC, LV2HtmlComponentBase } from "SengenUI/index";


import { IグループミニキャンバスView } from "../../I配置物";

export class グループミニキャンバスView extends LV2HtmlComponentBase implements IグループミニキャンバスView {
    protected _componentRoot: DivC;

    constructor() {
        super();
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): DivC {
        return new DivC({}).childs([
            // グループミニキャンバスの基本的な表示要素をここに追加
        ]);
    }
}
