import { div, DivC, I配線可能, LV2部品集約Base, 配線ポート } from "SengenUI/index";
import { I折れ線矢印View, 配置物zIndex } from "../../I配置物";
import { 始点ハンドルView } from "./始点ハンドルView";
import { 終点ハンドルView } from "./終点ハンドルView";
import { 中点ハンドルView } from "./中点ハンドルView";
import { 線分ハンドルView } from "./線分ハンドルView";

interface 折れ線矢印View部品 {
    readonly 始点: 始点ハンドルView;
    readonly 終点: 終点ハンドルView;
    readonly 中点リスト: 中点ハンドルView[];
    readonly 線分リスト: 線分ハンドルView[];
}
export interface I折れ線矢印View配線 {
    on選択(e: MouseEvent): void;
    onHover(): void;
}

export class 折れ線矢印View extends LV2部品集約Base<折れ線矢印View部品>
    implements I折れ線矢印View, I配線可能<I折れ線矢印View配線> {
    protected _componentRoot: DivC;
    private readonly _配線 = new 配線ポート<I折れ線矢印View配線>("折れ線矢印View");
    private readonly _部品: 折れ線矢印View部品;

    constructor(
        始点ハンドルView: 始点ハンドルView,
        終点ハンドルView: 終点ハンドルView,
    ) {
        super();
        this._部品 = { 始点: 始点ハンドルView, 終点: 終点ハンドルView,
            中点リスト: [], 線分リスト: [] };
        this._componentRoot = this._ルートを構築する(this._部品);
    }

    protected _ルートを構築する(部品: 折れ線矢印View部品): DivC {
        return div().setStyleCSS({ position: "absolute", width: "100%", height: "100%",
            pointerEvents: "none" })
            .addDivEventListener("click", e => this._配線.先.on選択(e))
            .addDivEventListener("mouseover", () => this._配線.先.onHover())
            .childs([部品.始点, 部品.終点]);
    }

    public 配線する(配線: I折れ線矢印View配線): this { this._配線.配線する(配線); return this; }

    public add中点ハンドル(view: 中点ハンドルView): this {
        this._部品.中点リスト.push(view);
        this._componentRoot.child(view);
        return this;
    }

    public add線分ハンドル(view: 線分ハンドルView): this {
        this._部品.線分リスト.push(view);
        this._componentRoot.child(view);
        return this;
    }

    public select(): this {
        this.show中点ハンドル();
        this._componentRoot.setStyleCSS({ zIndex: "10000" });
        this._部品.線分リスト.forEach(view => view.select());
        return this;
    }

    public deselect(): this {
        this.hide中点ハンドル();
        this._componentRoot.setStyleCSS({ zIndex: "auto" });
        this._部品.線分リスト.forEach(view => view.deselect());
        return this;
    }

    public hover(): this {
        this.show中点ハンドル();
        return this;
    }

    public unhover(): this {
        this.hide中点ハンドル();
        return this;
    }

    private show中点ハンドル(): this {
        this._部品.中点リスト.forEach(view => view.setStyleCSS({ display: "block" }));
        return this;
    }

    private hide中点ハンドル(): this {
        this._部品.中点リスト.forEach(view => view.setStyleCSS({ display: "none" }));
        return this;
    }

    public 選択状態のzIndexにする(): void {
        this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.選択中 });
    }

    public 通常状態のzIndexにする(): void {
        this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.未選択 });
    }
}
