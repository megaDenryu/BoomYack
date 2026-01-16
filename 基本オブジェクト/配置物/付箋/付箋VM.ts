import { Px2DVector } from "SengenUI/index";
import { 付箋ID, 配置物ID } from "../../ID";
import { I配置物 } from "../../グラフモデル/グラフVM標準";
import { I付箋VM } from "../../I配置物";

import { 付箋データ, 座標データ, サイズデータ } from "../../描画キャンバス/データクラス";

export class 付箋VM implements I配置物, I付箋VM {
    public readonly id: 付箋ID;
    public readonly 配置物ID: 配置物ID;
    public readonly 配置物種別 = '付箋' as const;
    public position: Px2DVector;
    public size: Px2DVector;
    public text: string;
    
    public constructor(
        id: 付箋ID,
        position: Px2DVector,
        size: Px2DVector,
        text: string
    ) {
        this.id = id;
        this.配置物ID = id;
        this.position = position;
        this.size = size;
        this.text = text;
    }

    /**
     * シリアライズ用データに変換
     */
    public toデータ(): 付箋データ {
        return 付箋データ.create(
            this.id,
            座標データ.fromPx2DVector(this.position),
            サイズデータ.fromPx2DVector(this.size),
            this.text
        );
    }

    /**
     * データクラスから付箋VMを作成
     */
    public static fromデータ(data: 付箋データ): 付箋VM {
        return new 付箋VM(
            data.id,
            data.position.toPx2DVector(),
            data.size.toPx2DVector(),
            data.text
        );
    }
}