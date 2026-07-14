import { div, DivC, LV2HtmlComponentBase, svg, TypedEventListener, ビューポート座標値, 配置物座標点 } from "SengenUI/index";
import { Iなめらか曲線矢印View, 配置物zIndex } from "../../I配置物";
import { 始点ハンドルView } from "../折れ線矢印/始点ハンドルView";
import { 終点ハンドルView } from "../折れ線矢印/終点ハンドルView";
import { 中点ハンドルView } from "../折れ線矢印/中点ハンドルView";
import { 曲線パス } from "./曲線パス";

/**
 * なめらか曲線矢印の描画View。折れ線矢印View(線分ハンドルの集合)と異なり、
 * 始点/終点の2つのハンドルとSVG pathの3次ベジェ曲線1本だけで構成される。
 * pathのd属性はビューポート座標値の生ピクセル値で書く(点ハンドルと同じ
 * setViewportPositionByTransformの仕組みに乗せ、position:fixed化された
 * 祖先のtransformを通じて配置物コンテナ基準の座標系に揃える)。
 */
export class なめらか曲線矢印View extends LV2HtmlComponentBase implements Iなめらか曲線矢印View {
    protected _componentRoot: DivC;
    public readonly 始点ハンドルView: 始点ハンドルView;
    public readonly 終点ハンドルView: 終点ハンドルView;
    private readonly _曲線パス = new 曲線パス();

    constructor(
        始点ハンドルView: 始点ハンドルView,
        終点ハンドルView: 終点ハンドルView
    ) {
        super();
        this.始点ハンドルView = 始点ハンドルView;
        this.終点ハンドルView = 終点ハンドルView;
        this._componentRoot = this._ルートを構築する();
    }

    protected _ルートを構築する(): DivC {
        return (
            div()
                .setStyleCSS({
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                })
                .childs([
                    div()
                        .setStyleCSS({
                            position: "absolute",
                            width: "0px",
                            height: "0px",
                            pointerEvents: "none",
                            zIndex: 配置物zIndex.矢印内部構造.線分,
                        })
                        .tap((self) => {
                            self.setViewportPositionByTransform(ビューポート座標値.fromNumbers(0, 0));
                        })
                        .child(
                            svg({ width: 1, height: 1 })
                                .setStyleCSS({
                                    position: "absolute",
                                    top: "0px",
                                    left: "0px",
                                    overflow: "visible",
                                    pointerEvents: "none",
                                })
                                .child(this._曲線パス)
                        ),
                    this.始点ハンドルView,
                    this.終点ハンドルView,
                ])
        );
    }

    /** 始点/終点(配置物座標点)からベジェ曲線を再計算してpathへ反映する。中間点ハンドルがあればその形状を優先する */
    public pathを更新する(始点: 配置物座標点, 終点: 配置物座標点, 中間点: 配置物座標点 | null): this {
        this._曲線パス.曲線を設定する(始点, 終点, 中間点);
        return this;
    }

    /** 曲線上での右クリックを購読する(中間点ハンドル生成のトリガー) */
    public on曲線右クリック(callback: TypedEventListener<'contextmenu'>): this {
        this._曲線パス.addSvgEventListener('contextmenu', callback);
        return this;
    }

    /** 中間点ハンドルのViewをDOMへ追加する */
    public add中間点ハンドル(中間点ハンドルView: 中点ハンドルView): this {
        this._componentRoot.child(中間点ハンドルView);
        return this;
    }

    public select(): this {
        this._曲線パス.選択色にする();
        this._componentRoot.setStyleCSS({ zIndex: "10000" });
        return this;
    }

    public deselect(): this {
        this._曲線パス.通常色にする();
        this._componentRoot.setStyleCSS({ zIndex: "auto" });
        return this;
    }

    public hover(): this {
        return this;
    }

    public unhover(): this {
        return this;
    }

    public onClick(callback: TypedEventListener<'click'>) {
        this._componentRoot.addDivEventListener("click", (e) => { callback(e); });
        return this;
    }

    public onHover(callback: TypedEventListener<'mouseover'>) {
        this._componentRoot.addDivEventListener("mouseover", (e) => { callback(e); });
        return this;
    }

    public 選択状態のzIndexにする(): void {
        this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.選択中 });
    }

    public 通常状態のzIndexにする(): void {
        this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.未選択 });
    }
}
