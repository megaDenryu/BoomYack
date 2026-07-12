import { div, DivC, LV2HtmlComponentBase } from "SengenUI/index";
import { 配置物zIndex } from "../../I配置物";
import { 矢印コンテナ } from "./style.css";
import { 始点ハンドルView } from "./始点ハンドルView";
import { 終点ハンドルView } from "./終点ハンドルView";
import { 線分ハンドルView } from "./線分ハンドルView";

export class 矢印View extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    public readonly 始点ハンドルView: 始点ハンドルView;
    public readonly 終点ハンドルView: 終点ハンドルView;
    public readonly 線分ハンドルView: 線分ハンドルView;

    constructor(
        始点ハンドルView: 始点ハンドルView,
        終点ハンドルView: 終点ハンドルView,
        線分ハンドルView: 線分ハンドルView
    ) {
        super();
        this.始点ハンドルView = 始点ハンドルView;
        this.終点ハンドルView = 終点ハンドルView;
        this.線分ハンドルView = 線分ハンドルView;
        this._componentRoot = this._ルートを構築する();
    }
    protected _ルートを構築する(): DivC {
        return (
            div({class: 矢印コンテナ}).setStyleCSS({
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                    }).childs([
                        this.始点ハンドルView,
                        this.終点ハンドルView,
                        this.線分ハンドルView
                    ])
        );
    }

    public 選択状態のzIndexにする(): void {
        this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.選択中 });
    }

    public 通常状態のzIndexにする(): void {
        this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.未選択 });
    }
}
