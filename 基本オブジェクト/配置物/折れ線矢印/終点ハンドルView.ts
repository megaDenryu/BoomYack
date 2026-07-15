import { LV2HtmlComponentBase, Degree角度, 配置物座標点 } from "SengenUI/index";
import { 点ハンドルView } from "./点ハンドルView";
import { 終点矢印形状 } from "./終点矢印形状";
import { I点ハンドルView } from "./I点ハンドルView";
import { Iハンドル操作実行時コマンド } from "./Iハンドル操作実行時コマンド";

export class 終点ハンドルView extends LV2HtmlComponentBase implements I点ハンドルView {
    protected _componentRoot: 点ハンドルView;
    private _ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[];

    constructor(ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[]) {
        super();
        this._ハンドル操作実行時コマンドlist = ハンドル操作実行時コマンドlist;
        this._componentRoot = this._ルートを構築する();
    }

    protected _ルートを構築する(): 点ハンドルView {
        return new 点ハンドルView(this._ハンドル操作実行時コマンドlist, new 終点矢印形状());
    }

    public 位置を設定(pos: 配置物座標点): this {
        this._componentRoot.位置を設定(pos);
        return this;
    }

    /**
     * 矢印の向きを設定（度数法）
     */
    public 回転角度を設定(angle: Degree角度): this {
        this._componentRoot.回転角度を設定(angle);
        return this;
    }

    public 見た目を接続状態にする(): this {
        // 将来の拡張用
        return this;
    }
}
