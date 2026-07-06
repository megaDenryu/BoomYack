import { div, DivC, LV2HtmlComponentBase, TypedEventListener } from "SengenUI/index";
import { I折れ線矢印View, 配置物zIndex } from "../../I配置物";
import { 始点ハンドルView } from "./始点ハンドルView";
import { 終点ハンドルView } from "./終点ハンドルView";
import { 中点ハンドルView } from "./中点ハンドルView";
import { 線分ハンドルView } from "./線分ハンドルView";

export class 折れ線矢印View extends LV2HtmlComponentBase implements I折れ線矢印View {
    protected _componentRoot: DivC;
    public readonly 始点ハンドルView: 始点ハンドルView;
    public readonly 終点ハンドルView: 終点ハンドルView;
    public readonly 中点ハンドルviewリスト: 中点ハンドルView[] = [];
    public readonly 線分ハンドルviewリスト: 線分ハンドルView[] = [];

    constructor(
        始点ハンドルView: 始点ハンドルView,
        終点ハンドルView: 終点ハンドルView,
    ) {
        super();
        this.始点ハンドルView = 始点ハンドルView;
        this.終点ハンドルView = 終点ハンドルView;
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): DivC {
        return (
            div()
                .setStyleCSS({
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                }).childs([
                    this.始点ハンドルView,
                    this.終点ハンドルView,
                ])
        );
    }

    public add中点ハンドル(view: 中点ハンドルView): this {
        this.中点ハンドルviewリスト.push(view);
        this._componentRoot.child(view);
        return this;
    }

    public add線分ハンドル(view: 線分ハンドルView): this {
        this.線分ハンドルviewリスト.push(view);
        this._componentRoot.child(view);
        return this;
    }

    /**
     * 選択時の処理: 中点表示、最前面化、線分の色変更
     */
    public select(): this {
        this.show中点ハンドル();
        this._componentRoot.setStyleCSS({ zIndex: "10000" });
        this.線分ハンドルviewリスト.forEach(view => {view.select(); });
        return this;
    }

    /**
     * 選択解除時の処理: 中点非表示、zIndex戻す、線分の色を元に戻す
     */
    public deselect(): this {
        this.hide中点ハンドル();
        this._componentRoot.setStyleCSS({ zIndex: "auto" });
        this.線分ハンドルviewリスト.forEach(view => {view.deselect();});
        return this;
    }

    /**
     * ホバー時の処理: 中点表示
     */
    public hover(): this {
        this.show中点ハンドル();
        return this;
    }

    /**
     * ホバー解除時の処理: 中点非表示
     */
    public unhover(): this {
        this.hide中点ハンドル();
        return this;
    }

    /**
     * 中点ハンドルを表示
     */
    private show中点ハンドル(): this {
        this.中点ハンドルviewリスト.forEach(view => {
            view.setStyleCSS({ display: "block" });
        });
        return this;
    }

    /**
     * 中点ハンドルを非表示
     */
    private hide中点ハンドル(): this {
        this.中点ハンドルviewリスト.forEach(view => {
            view.setStyleCSS({ display: "none" });
        });
        return this;
    }

    public onClick(callback: TypedEventListener<'click'>) {
        this._componentRoot.addDivEventListener("click", (e) => { callback(e);});
        return this;
    }

    public onHover(callback: TypedEventListener<'mouseover'>) {
        this._componentRoot.addDivEventListener("mouseover", (e) => {callback(e);});
        return this;
    }

    public 選択状態のzIndexにする(): void {
        this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.選択中 });
    }

    public 通常状態のzIndexにする(): void {
        this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.未選択 });
    }
}
