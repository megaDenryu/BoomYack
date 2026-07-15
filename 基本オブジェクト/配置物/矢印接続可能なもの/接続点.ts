import {
    Canvas座標Base, DivC, I描画空間, LV2HtmlComponentBase, Px2DVector,
    配置物座標点, 描画座標点
} from "SengenUI/index";

import { I始終点矢印集約, I接続点, I点ハンドル, 接触判定可能な点 } from "../../I配置物";
import { 付箋ID } from "../../ID";
import { 接続参照データ, 接続点位置 } from "../../描画キャンバス/データクラス";
import { I矢印生成先 } from "../../配置物リポジトリ";
import { 折れ線矢印集約 } from "../折れ線矢印";
import { I接続点親情報 } from "./接続点契約";
import { 接続点State } from "./接続点State";
import { 接続点Viewを作る } from "./接続点View";

export type { I接続点親情報, I矢印接続可能なもの中央PositionState } from "./接続点契約";
export { 接続点State } from "./接続点State";

export class 接続点<座標点T extends Canvas座標Base<座標点T> & 配置物座標点>
    extends LV2HtmlComponentBase implements 接触判定可能な点, I接続点<座標点T> {
    private 接続中ハンドル: I点ハンドル<座標点T>[] = [];

    public constructor(
        private readonly state: 接続点State<座標点T>,
        private readonly 矢印生成先: I矢印生成先<座標点T>,
        _描画空間: I描画空間,
        private readonly _接続位置: 接続点位置,
        public readonly 親interface: I接続点親情報<座標点T>
    ) {
        super();
        this._componentRoot = this._ルートを構築する();
    }

    public get 接続している点ハンドルのリスト_(): ReadonlyArray<I点ハンドル<座標点T>> {
        return this.接続中ハンドル;
    }

    public get 接続している矢印リスト(): ReadonlyArray<I始終点矢印集約<座標点T>> {
        return this.接続中ハンドル.map(handle => handle.親の折れ線矢印集約);
    }

    public get 親配置物ID(): 付箋ID { return this.親interface.配置物ID; }
    public get 接続位置(): 接続点位置 { return this._接続位置; }

    public get 描画座標点(): 描画座標点 {
        return this.state.pos instanceof 描画座標点 ? this.state.pos : this.state.pos.to描画座標点();
    }

    protected _ルートを構築する(): DivC {
        return 接続点Viewを作る(this.state.pos.toビューポート座標値(), () => this.onClick());
    }

    public get接続参照データ(): 接続参照データ {
        return 接続参照データ.create(this.親配置物ID, this.接続位置);
    }

    public onClick(): this {
        this.矢印作成();
        return this;
    }

    public 矢印作成(): 折れ線矢印集約<座標点T> {
        const arrow = this.矢印生成先.add折れ線矢印(this.state.折れ線矢印vm);
        arrow.始点ハンドル.接続(this);
        return arrow;
    }

    public 判定(pos: Px2DVector): boolean {
        const length = this.state.pos.px2DVector.minus(pos);
        return length.dot(length) <= 20 * 20;
    }

    public update位置(pos: 座標点T, 相対pos: Px2DVector): void {
        this.state.pos = pos;
        this._componentRoot.setTranslate(相対pos);
        this.矢印生成先.未接続の点ハンドルを接続点と接続をtryする(this);
        this.接続中ハンドル.forEach(handle => handle.setPosition(pos));
    }

    public 接続(handle: I点ハンドル<座標点T>): void {
        this.接続中ハンドル.push(handle);
        handle.setPosition(this.state.pos);
    }

    public 接続解除(handle: I点ハンドル<座標点T>): void {
        console.log("接続解除前の接続している点ハンドルの数:", this.接続中ハンドル.length);
        this.接続中ハンドル = this.接続中ハンドル.filter(candidate => candidate !== handle);
        console.log("接続解除後の接続している点ハンドルの数:", this.接続中ハンドル.length);
    }

    public show(): this { return this; }
    public hide(): this { return this; }
}
