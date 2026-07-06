import { LV2HtmlComponentBase, Degree角度, 配置物座標点 } from "SengenUI/index";
import { 点ハンドルView } from "./点ハンドルView";
import { 円ハンドルView } from "./円ハンドルView";
import { I点ハンドルView } from "./I点ハンドルView";
import { Iハンドル操作実行時コマンド } from "./Iハンドル操作実行時コマンド";

/**
 * 中点用のハンドルView（将来の拡張用）
 */
export class 中点ハンドルView extends LV2HtmlComponentBase implements I点ハンドルView {
    protected _componentRoot: 点ハンドルView;
    private _ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[];

    constructor(ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[]) {
        super();
        this._ハンドル操作実行時コマンドlist = ハンドル操作実行時コマンドlist;
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): 点ハンドルView {
        return new 円ハンドルView(this._ハンドル操作実行時コマンドlist) as unknown as 点ハンドルView;
    }

    public 位置を設定(pos: 配置物座標点): 中点ハンドルView {
        this._componentRoot.位置を設定(pos);
        return this;
    }

    public 回転角度を設定(angle: Degree角度): 中点ハンドルView {
        return this;
    }
}
