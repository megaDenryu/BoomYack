import {
    div, DivC, I配線可能, LV2部品集約Base, svg, ビューポート座標値,
    Px2DVector, 配置物座標点, 配線ポート,
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
    private readonly _中間点リスト: 中点ハンドルView[] = [];
    private _選択中 = false;
    private _ホバー中 = false;

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
    public pathを更新する(start: 配置物座標点, end: 配置物座標点,
        middleList: readonly 配置物座標点[]): this {
        this._部品.表示パス.曲線を設定する(start, end, middleList);
        this._部品.操作パス.曲線を設定する(start, end, middleList);
        return this;
    }
    public add中間点ハンドル(view: 中点ハンドルView): this {
        this._中間点リスト.push(view);
        view.setStyleCSS({ display: this._選択中 || this._ホバー中 ? "block" : "none" });
        this._componentRoot.child(view); return this;
    }
    public remove中間点ハンドル(view: 中点ハンドルView): this {
        const index = this._中間点リスト.indexOf(view);
        if (index >= 0) this._中間点リスト.splice(index, 1);
        view.delete(); return this;
    }
    public 曲線ローカル座標を取得する(e: MouseEvent): Px2DVector {
        return this._部品.操作パス.イベントのローカル座標(e);
    }
    public select(): this { this._選択中 = true; this._部品.表示パス.選択状態を設定する(true); this._中間点表示を反映する(); return this; }
    public deselect(): this { this._選択中 = false; this._部品.表示パス.選択状態を設定する(false); this._中間点表示を反映する(); return this; }
    public hover(): this { this._ホバー中 = true; this._部品.表示パス.ホバー状態を設定する(true); this._中間点表示を反映する(); return this; }
    public unhover(): this { this._ホバー中 = false; this._部品.表示パス.ホバー状態を設定する(false); this._中間点表示を反映する(); return this; }
    private _中間点表示を反映する(): void {
        const display = this._選択中 || this._ホバー中 ? "block" : "none";
        this._中間点リスト.forEach(view => view.setStyleCSS({ display }));
    }
    public 選択状態のzIndexにする(): void { this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.選択中 }); }
    public 通常状態のzIndexにする(): void { this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.未選択 }); }
}
