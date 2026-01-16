import { CircleC, DivC, I描画空間, LV2HtmlComponentBase, Px2DVector, SvgC, 図形内座標点, 描画座標点, 配置物座標点 } from "SengenUI/index";




import { 矢印ID, 折れ線矢印ID, 配置物ID, 付箋ID } from "../../ID";
import {  接触判定可能な点, I点ハンドル, I接続点, 配置物zIndex, I折れ線矢印集約 } from "../../I配置物";

import { I配置物リポジトリ } from "../../配置物リポジトリ";
import { 折れ線矢印VM, 折れ線矢印集約 } from "../折れ線矢印";
import { 矢印VM } from "../折れ線矢印/矢印集約";
import { 接続参照データ, 接続点位置 } from "../../描画キャンバス/データクラス";
import { 矢印接続可能なもの } from "./矢印接続可能なもの";


/** 接続点の親情報を提供するインターフェース */
export interface I接続点親情報<座標点T extends 配置物座標点> {
    /** 親配置物のID */
    get 配置物ID(): 付箋ID;
    get 矢印接続可能なもの(): 矢印接続可能なもの<座標点T>;
}

export class 接続点<座標点T extends 配置物座標点> extends LV2HtmlComponentBase implements 接触判定可能な点, I接続点<座標点T>{
    private i配置物リポジトリ: I配置物リポジトリ<座標点T>;
    private _接続点state: 接続点State<座標点T>;
    private i描画基準座標を持つ: I描画空間;
    private 接続している点ハンドルのリスト: I点ハンドル<座標点T>[] = [];
    public get 接続している点ハンドルのリスト_(): ReadonlyArray<I点ハンドル<座標点T>> {return this.接続している点ハンドルのリスト;}
    public get 接続している矢印リスト(): ReadonlyArray<I折れ線矢印集約<座標点T>> {return this.接続している点ハンドルのリスト.map(点ハンドル=>点ハンドル.親の折れ線矢印集約);}
    private readonly _接続位置: 接続点位置;
    public readonly 親interface: I接続点親情報<座標点T>;
    
    public constructor( 
        接続点state: 接続点State<座標点T>, 
        i配置物リポジトリ: I配置物リポジトリ<座標点T>, 
        i描画基準座標を持つ: I描画空間,
        接続位置: 接続点位置,
        親情報: I接続点親情報<座標点T>
    ) {
        super();
        this._接続点state = 接続点state;
        this.i配置物リポジトリ = i配置物リポジトリ;
        this.i描画基準座標を持つ = i描画基準座標を持つ;
        this._接続位置 = 接続位置;
        this.親interface = 親情報;
        this._componentRoot = this.createComponentRoot();
    }

    /** この接続点の親配置物ID */
    public get 親配置物ID() : 付箋ID {
        return this.親interface.配置物ID;
    }

    /** この接続点の位置（上/下/左/右） */
    public get 接続位置(): 接続点位置 {
        return this._接続位置;
    }

    /** 接続参照データを生成 */
    public get接続参照データ(): 接続参照データ {
        return 接続参照データ.create(
            this.親配置物ID,
            this.接続位置
        );
    }

    public get 描画座標点(): 描画座標点{
        if (this._接続点state.pos instanceof 描画座標点){
            return this._接続点state.pos;
        } else {
            return this._接続点state.pos.to描画座標点();
        }
    }

    protected createComponentRoot(): DivC {
        // 2層構造:
        // 外側Div: ビューポート座標で位置管理（0px×0pxの基準点）
        // SVG: setStyleCSSでtranslate(-50%, -50%)を適用して中心配置
        
        return new DivC({class:"矢印接続可能なもの接続点View"})
            .setStyleCSS({
                position: "absolute",
                width: "0px",
                height: "0px",
                pointerEvents: "none",
            })
            .addDivEventListener("mouseover", () => {
                this.setStyleCSS({opacity: "1"});
            })
            .addDivEventListener("mouseout", () => {
                this.setStyleCSS({opacity: ""});
            })
            .setViewportPositionByTransform(this._接続点state.pos.toビューポート座標値())
            .child(
                new SvgC({ 
                    width: 40, 
                    height: 40,
                    viewBox: "0 0 40 40"
                })
                .setStyleCSS({
                    position: "absolute",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "auto",
                    cursor: "pointer"
                })
                .child(
                    new CircleC({
                        cx: 20,
                        cy: 20, 
                        r: 7,
                        fill: "rgba(100, 201, 255, 0.8)",
                        stroke: "blue",
                        strokeWidth: 3
                    })
                    .addSvgEventListener("click", () => this.onClick())
                )
            );
    }

    public onClick(): this {
        this.矢印作成();
        return this;
    }

    public 矢印作成(): 折れ線矢印集約<座標点T>{
        const arrow = this.i配置物リポジトリ.add折れ線矢印(this._接続点state.折れ線矢印vm);
        arrow.始点ハンドル.接続(this);
        return arrow;
    }

    public 判定(pos: Px2DVector): boolean {
        const length = this._接続点state.pos.px2DVector.minus(pos);
        return length.dot(length) <= 20 * 20;
    }

    /**
     * 接続点Viewの位置を更新する
     */
    public update位置(pos:座標点T, 相対pos: Px2DVector): void {
        this._接続点state.pos = pos;
        this._componentRoot.setTranslate(相対pos);
        this.i配置物リポジトリ.未接続の点ハンドルを接続点と接続をtryする(this);
        this.接続している点ハンドルのリスト.forEach(点ハンドル=>{
            点ハンドル.setPosition(pos);
        });
    }

    // 点ハンドルの中の接続メソッドから呼び出されたときのみ有効
    public 接続(点ハンドル: I点ハンドル<座標点T>): void {
        this.接続している点ハンドルのリスト.push(点ハンドル);
        点ハンドル.setPosition(this._接続点state.pos);
    }

    public 接続解除(点ハンドル: I点ハンドル<座標点T>): void {
        console.log("接続解除前の接続している点ハンドルの数:", this.接続している点ハンドルのリスト.length);
        this.接続している点ハンドルのリスト = this.接続している点ハンドルのリスト.filter(ah=>ah !== 点ハンドル);
        console.log("接続解除後の接続している点ハンドルの数:", this.接続している点ハンドルのリスト.length);
    }

    public show(): this {
        
        return this;
    }

    public hide(): this {
       
        return this;
    }
}


export interface I矢印接続可能なもの中央PositionState<座標点T extends 配置物座標点> {
    中央pos: 座標点T;
}

export class 接続点State<座標点T extends 配置物座標点> {
    public pos: 座標点T;
    public i矢印接続可能なもの中央PositionState:I矢印接続可能なもの中央PositionState<座標点T>;
    public constructor(pos: 座標点T, i矢印接続可能なもの中央PositionState:I矢印接続可能なもの中央PositionState<座標点T>) {
        this.pos = pos;
        this.i矢印接続可能なもの中央PositionState = i矢印接続可能なもの中央PositionState;
    }

    public get 矢印vm():矢印VM<座標点T> {
            return new 矢印VM<座標点T>(new 矢印ID(), this.pos, this.pos.times(2).minus(this.i矢印接続可能なもの中央PositionState.中央pos.px2DVector) as 座標点T);
        
    }

    public get 折れ線矢印vm(): 折れ線矢印VM<座標点T> {
        return new 折れ線矢印VM<座標点T>(
                new 折れ線矢印ID(),
                this.pos,
                [],
                this.pos.times(2).minus(this.i矢印接続可能なもの中央PositionState.中央pos.px2DVector) as 座標点T,
            );
    }
}
