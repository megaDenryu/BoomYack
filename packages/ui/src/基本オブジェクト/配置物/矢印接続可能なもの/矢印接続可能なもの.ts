import {
    Canvas座標Base, div, DivC, HtmlComponentBase, LV2HtmlComponentBase,
    VectorNと見なせる, 配置物座標点, 表示切替
} from "SengenUI/index";

import { I接続点, I始終点矢印集約 } from "../../I配置物";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { 矢印ホバー用四角形 } from "./style.css";
import { I接続点親情報, I矢印接続可能なもの中央PositionState, 接続点 } from "./接続点";
import { 絶対矢印上下左右Position, 矢印上下左右Position } from "./矢印接続位置";
import { 矢印接続可能なもの依存関係 } from "./矢印接続可能なもの依存関係";
import { 矢印接続点群 } from "./矢印接続点群";

export type { 絶対矢印上下左右Position, 相対矢印上下左右Position, 矢印上下左右Position } from "./矢印接続位置";
export type { 矢印接続可能なもの依存関係 } from "./矢印接続可能なもの依存関係";

export class 矢印接続可能なもの<座標点T extends Canvas座標Base<座標点T> & 配置物座標点>
    extends LV2HtmlComponentBase implements I矢印接続可能なもの中央PositionState<座標点T> {
    private _中央pos: 座標点T;
    private readonly 接続点群: 矢印接続点群<座標点T>;
    private _ホバー用四角形: DivC;
    private readonly _i配置物選択機能集約: I配置物選択機能集約;

    public constructor(
        pos: 絶対矢印上下左右Position<座標点T>,
        依存: 矢印接続可能なもの依存関係<座標点T>,
        親情報: I接続点親情報<座標点T>
    ) {
        super();
        this._i配置物選択機能集約 = 依存.i配置物選択機能集約;
        this._中央pos = pos.上.plus(pos.下.px2DVector).divide(2);
        this.接続点群 = new 矢印接続点群(pos, 依存, this, 親情報);
        this._componentRoot = this._ルートを構築する();
    }

    public get 中央pos(): 座標点T { return this._中央pos; }
    public get 接続点_上(): 接続点<座標点T> { return this.接続点群.上; }
    public get 接続点_右(): 接続点<座標点T> { return this.接続点群.右; }
    public get 接続点_下(): 接続点<座標点T> { return this.接続点群.下; }
    public get 接続点_左(): 接続点<座標点T> { return this.接続点群.左; }

    protected _ルートを構築する(): HtmlComponentBase {
        return div({ class: 矢印ホバー用四角形 })
            .setStyleCSS({ position: "absolute", opacity: "0", transition: "opacity 0.2s ease-in-out" })
            .tap(self => this._ホバー用四角形 = self)
            .childs(this.接続点リスト());
    }

    public *接続点リスト(): Iterable<接続点<座標点T>> { yield* this.接続点群.リスト(); }
    public 接続している矢印リスト(): ReadonlyArray<I始終点矢印集約<座標点T>> {
        return this.接続点群.接続矢印リスト();
    }

    public update接続点座標(pos: 矢印上下左右Position<座標点T>): void {
        this._中央pos = pos.絶対.上.plus(pos.絶対.下.px2DVector).divide(2);
        this.接続点群.座標を更新する(pos);
    }

    public アニメーションさせながらshow(): void { this.表示する("1", false); }
    public アニメーションさせながらhide(): void { this.表示する("0", true); }

    public ほかの矢印接続可能な物と最も近い接続点のペアを取得する(other: this, option?: {
        自分の現在の接続点?: I接続点<座標点T>;
        相手の現在の接続点?: I接続点<座標点T>;
    }): { 自分の接続点: 接続点<座標点T>; 相手の接続点: 接続点<座標点T> } {
        const 自分to相手 = other.中央pos.px2DVector.minus(this.中央pos.px2DVector);
        return {
            自分の接続点: this.対象方向へもっとも成す角が小さい接続点を取得する(
                自分to相手, option?.自分の現在の接続点
            ),
            相手の接続点: other.対象方向へもっとも成す角が小さい接続点を取得する(
                自分to相手.times(-1), option?.相手の現在の接続点
            )
        };
    }

    public 対象方向へもっとも成す角が小さい接続点を取得する(
        方向: VectorNと見なせる<any>, 現在?: I接続点<座標点T>
    ): 接続点<座標点T> { return this.接続点群.方向から選ぶ(方向, 現在); }

    private 表示する(opacity: "0" | "1", hidden: boolean): void {
        this._ホバー用四角形.setStyleCSS({ opacity });
        for (const point of this.接続点リスト()) {
            if (hidden) point.setAttribute(表示切替.attribute, 表示切替.value.hidden);
            else point.toggleAttribute(表示切替.attribute, false);
        }
    }
}
