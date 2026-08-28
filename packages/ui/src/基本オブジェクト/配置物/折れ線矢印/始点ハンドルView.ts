import { LV2HtmlComponentBase, Degree角度, I配線可能, 配置物座標点 } from "SengenUI/index";
import { 点ハンドルView } from "./点ハンドルView";
import { 円ハンドル形状 } from "./円ハンドル形状";
import { I点ハンドルView } from "./I点ハンドルView";
import { IハンドルView配線 } from "./IハンドルView配線";

export class 始点ハンドルView extends LV2HtmlComponentBase
    implements I点ハンドルView, I配線可能<IハンドルView配線> {
    protected _componentRoot: 点ハンドルView;

    constructor() {
        super();
        this._componentRoot = this._ルートを構築する();
    }

    protected _ルートを構築する(): 点ハンドルView {
        return new 点ハンドルView(new 円ハンドル形状());
    }

    public 配線する(配線: IハンドルView配線): this { this._componentRoot.配線する(配線); return this; }

    public 位置を設定(pos: 配置物座標点): this {
        this._componentRoot.位置を設定(pos);
        return this;
    }

    public 回転角度を設定(angle: Degree角度): this {
        return this;
    }

    public 見た目を接続状態にする(): this {
        // 将来の拡張用
        return this;
    }
}
