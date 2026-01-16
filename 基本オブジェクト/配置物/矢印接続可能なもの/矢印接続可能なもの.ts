import { DivC, HtmlComponentBase, I描画空間, LV2HtmlComponentBase, Px2DVector, VectorN, VectorNと見なせる, dotVectorN, 配置物座標点 } from "SengenUI/index";


import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { I配置物リポジトリ } from "../../配置物リポジトリ";
import { I接続点親情報, I矢印接続可能なもの中央PositionState, 接続点, 接続点State } from "./接続点";
import { I折れ線矢印集約 } from "BoomYack/基本オブジェクト/I配置物";

export interface 絶対矢印上下左右Position<座標点T extends 配置物座標点> {
    上: 座標点T;
    右: 座標点T;
    下: 座標点T;
    左: 座標点T;
}

export interface 相対矢印上下左右Position {
    上: Px2DVector;
    右: Px2DVector;
    下: Px2DVector;
    左: Px2DVector;
}

export interface 矢印上下左右Position<座標点T extends 配置物座標点>{
    絶対: 絶対矢印上下左右Position<座標点T>, 
    相対: 相対矢印上下左右Position
}



export interface 矢印接続可能なもの依存関係<座標点T extends 配置物座標点> {
    i配置物リポジトリ: I配置物リポジトリ<座標点T>;
    i描画空間: I描画空間;
    i配置物選択機能集約:I配置物選択機能集約;
}

export class 矢印接続可能なもの<座標点T extends 配置物座標点> extends LV2HtmlComponentBase implements I矢印接続可能なもの中央PositionState<座標点T> {
    private _中央pos: 座標点T;
    public get 中央pos(): 座標点T {return this._中央pos;}
    private _接続点_上: 接続点<座標点T>;
    public get 接続点_上(): 接続点<座標点T> {return this._接続点_上;}
    private _接続点_右: 接続点<座標点T>;
    public get 接続点_右(): 接続点<座標点T> {return this._接続点_右;}
    private _接続点_下: 接続点<座標点T>;
    public get 接続点_下(): 接続点<座標点T> {return this._接続点_下;}
    private _接続点_左: 接続点<座標点T>;
    public get 接続点_左(): 接続点<座標点T> {return this._接続点_左;}
    private _ホバー用四角形: DivC;
    private _i配置物選択機能集約:I配置物選択機能集約
    public 接続している矢印リスト(): ReadonlyArray<I折れ線矢印集約<座標点T>> {
        return [
            ...this._接続点_上.接続している矢印リスト,
            ...this._接続点_右.接続している矢印リスト,
            ...this._接続点_下.接続している矢印リスト,
            ...this._接続点_左.接続している矢印リスト
        ]
    }
    
    public constructor(
        pos: 絶対矢印上下左右Position<座標点T>,
        依存: 矢印接続可能なもの依存関係<座標点T>,
        親情報: I接続点親情報<座標点T>
    ) {
        super();
        this._i配置物選択機能集約 = 依存.i配置物選択機能集約;
        this._中央pos = pos.上.plus(pos.下.px2DVector).divide(2) as 座標点T;
        this._接続点_上 = new 接続点<座標点T>(new 接続点State<座標点T>(pos.上, this), 依存.i配置物リポジトリ, 依存.i描画空間, "上", 親情報);
        this._接続点_右 = new 接続点<座標点T>(new 接続点State<座標点T>(pos.右, this), 依存.i配置物リポジトリ, 依存.i描画空間, "右", 親情報);
        this._接続点_下 = new 接続点<座標点T>(new 接続点State<座標点T>(pos.下, this), 依存.i配置物リポジトリ, 依存.i描画空間, "下", 親情報);
        this._接続点_左 = new 接続点<座標点T>(new 接続点State<座標点T>(pos.左, this), 依存.i配置物リポジトリ, 依存.i描画空間, "左", 親情報);
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): HtmlComponentBase {
        return new DivC({class:"矢印ホバー用四角形"}).setStyleCSS({
            position: "absolute",
            opacity: "0",
            transition: "opacity 0.2s ease-in-out"
        }).bind(self => this._ホバー用四角形 = self)
        .childs(this.接続点リスト());
    }

    public *接続点リスト(): Iterable<接続点<座標点T>> {
        yield this._接続点_上;
        yield this._接続点_右;
        yield this._接続点_下;
        yield this._接続点_左;
    }

    public update接続点座標(総合pos: 矢印上下左右Position<座標点T>): void {
        const pos = 総合pos.絶対;
        this._中央pos = pos.上.plus(pos.下.px2DVector).divide(2) as 座標点T;
        this._接続点_上.update位置(pos.上, 総合pos.相対.上);
        this._接続点_右.update位置(pos.右, 総合pos.相対.右);
        this._接続点_下.update位置(pos.下, 総合pos.相対.下);
        this._接続点_左.update位置(pos.左, 総合pos.相対.左);
    }


    public アニメーションさせながらshow():void {
        this._ホバー用四角形.setStyleCSS({ opacity: "1" });
        for (const 接続点 of this.接続点リスト()){
            接続点.show();
        }
    }

    public アニメーションさせながらhide():void {
        this._ホバー用四角形.setStyleCSS({ opacity: "0" });
        for (const 接続点 of this.接続点リスト()){
            接続点.hide();
        }
    }

    public ほかの矢印接続可能な物と最も近い接続点のペアを取得する(other: this): {
        自分の接続点: 接続点<座標点T>;
        相手の接続点: 接続点<座標点T>;
    }{
        const 自分to相手ベクトル = other.中央pos.px2DVector.minus(this.中央pos.px2DVector);
        const 相手へのベクトル = 自分to相手ベクトル.times(-1);
        return {
            自分の接続点: this.対象方向へもっとも成す角が小さい接続点を取得する(自分to相手ベクトル),
            相手の接続点: other.対象方向へもっとも成す角が小さい接続点を取得する(相手へのベクトル)
        };
        
    }

    public 対象方向へもっとも成す角が小さい接続点を取得する(対象方向: VectorNと見なせる<any>): 接続点<座標点T> {
        // 方向ベクトルと接続点のマッピング
        const 方向pair = [
            { ベクトル: new VectorN([0, 1]), 接続点:  this.接続点_上 },
            { ベクトル: new VectorN([1, 0]), 接続点:  this.接続点_右 },
            { ベクトル: new VectorN([0, -1]), 接続点: this.接続点_下 },
            { ベクトル: new VectorN([-1, 0]), 接続点: this.接続点_左 }
        ];

        // 各方向との内積を計算し、最大の内積を持つ方向を選択
        return 方向pair
            .map(pair => ({ 
                接続点: pair.接続点, 
                内積: dotVectorN(対象方向, pair.ベクトル) 
            }))
            .reduce((max, current) => current.内積 > max.内積 ? current : max)
            .接続点;
    }
}
