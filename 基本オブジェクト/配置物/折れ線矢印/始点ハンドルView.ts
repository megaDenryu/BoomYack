import { LV2HtmlComponentBase, Degree角度, 配置物座標点 } from "SengenUI/index";
import { 円ハンドルView } from "./円ハンドルView";
import { I点ハンドルView } from "./I点ハンドルView";
import { Iハンドル操作実行時コマンド } from "./Iハンドル操作実行時コマンド";

export class 始点ハンドルView extends LV2HtmlComponentBase implements I点ハンドルView {
    protected _componentRoot: 円ハンドルView;
    private _ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[];

    constructor(ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[]) {
        super();
        this._ハンドル操作実行時コマンドlist = ハンドル操作実行時コマンドlist;
        this._componentRoot = this.createComponentRoot();
    }
    
    protected createComponentRoot(): 円ハンドルView {
        return new 円ハンドルView(this._ハンドル操作実行時コマンドlist);
    }

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
