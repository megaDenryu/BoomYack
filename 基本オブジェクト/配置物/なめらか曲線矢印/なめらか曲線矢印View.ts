import {
    div, DivC, I配線可能, LV2部品集約Base, svg, ビューポート座標値,
    配置物座標点, 配線ポート,
} from "SengenUI/index";
import { Iなめらか曲線矢印View, 配置物zIndex } from "../../I配置物";
import { 中点ハンドルView } from "../折れ線矢印/中点ハンドルView";
import { 始点ハンドルView } from "../折れ線矢印/始点ハンドルView";
import { 終点ハンドルView } from "../折れ線矢印/終点ハンドルView";
import { 曲線操作パス, 曲線表示パス } from "./曲線パス";

interface なめらか曲線矢印View部品 {
    readonly 始点: 始点ハンドルView;
    readonly 終点: 終点ハンドルView;
    readonly 表示パス: 曲線表示パス;
    readonly 操作パス: 曲線操作パス;
}
export interface Iなめらか曲線矢印View配線 {
    on選択(e: MouseEvent): void;
    onHover(): void;
    on曲線右クリック(e: MouseEvent): void;
}

export class なめらか曲線矢印View extends LV2部品集約Base<なめらか曲線矢印View部品>
    implements Iなめらか曲線矢印View, I配線可能<Iなめらか曲線矢印View配線> {
    protected _componentRoot: DivC;
    private readonly _配線 = new 配線ポート<Iなめらか曲線矢印View配線>("なめらか曲線矢印View");
    private readonly _部品: なめらか曲線矢印View部品;
    private _中間点: 中点ハンドルView | null = null;

    public constructor(始点: 始点ハンドルView, 終点: 終点ハンドルView) {
        super();
        this._部品 = { 始点, 終点, 表示パス: new 曲線表示パス(), 操作パス: new 曲線操作パス() };
        this._componentRoot = this._ルートを構築する(this._部品);
    }

    protected _ルートを構築する(部品: なめらか曲線矢印View部品): DivC {
        return div().setStyleCSS({ position: "absolute", width: "100%", height: "100%", pointerEvents: "none" })
            .addDivEventListener("click", e => this._配線.先.on選択(e))
            .addDivEventListener("mouseover", () => this._配線.先.onHover())
            .childs([
                div().setStyleCSS({ position: "absolute", width: "0px", height: "0px",
                    pointerEvents: "none", zIndex: 配置物zIndex.矢印内部構造.線分 })
                    .tap(self => self.setViewportPositionByTransform(ビューポート座標値.fromNumbers(0, 0)))
                    .child(svg({ width: 1, height: 1 }).setStyleCSS({ position: "absolute", top: "0px",
                        left: "0px", overflow: "visible", pointerEvents: "none" })
                        .childs([部品.表示パス, 部品.操作パス
                            .addSvgEventListener("contextmenu", e => this._配線.先.on曲線右クリック(e))])),
                部品.始点, 部品.終点,
            ]);
    }

    public 配線する(配線: Iなめらか曲線矢印View配線): this { this._配線.配線する(配線); return this; }
    public pathを更新する(start: 配置物座標点, end: 配置物座標点, middle: 配置物座標点 | null): this {
        this._部品.表示パス.曲線を設定する(start, end, middle);
        this._部品.操作パス.曲線を設定する(start, end, middle);
        return this;
    }
    public add中間点ハンドル(view: 中点ハンドルView): this { this._中間点 = view; this._componentRoot.child(view); return this; }
    public select(): this { this._部品.表示パス.選択状態を設定する(true); this._中間点を表示する(true); return this; }
    public deselect(): this { this._部品.表示パス.選択状態を設定する(false); this._中間点を表示する(false); return this; }
    public hover(): this { this._部品.表示パス.ホバー状態を設定する(true); this._中間点を表示する(true); return this; }
    public unhover(): this { this._部品.表示パス.ホバー状態を設定する(false); this._中間点を表示する(false); return this; }
    private _中間点を表示する(show: boolean): void { this._中間点?.setStyleCSS({ display: show ? "block" : "none" }); }
    public 選択状態のzIndexにする(): void { this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.選択中 }); }
    public 通常状態のzIndexにする(): void { this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.未選択 }); }
}
