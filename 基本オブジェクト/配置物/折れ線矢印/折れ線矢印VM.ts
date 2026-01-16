import { 配置物座標点 } from "SengenUI/index";
import { 折れ線矢印ID } from "../../ID";
import { エッジVM, エッジVMと見なせる } from "../../グラフモデル/グラフVM";
import { I配置物 } from "../../グラフモデル/グラフVM標準";
import { I折れ線矢印VM } from "../../I配置物";

import { 折れ線矢印データ, 座標データ, 接続参照データ } from "../../描画キャンバス/データクラス";

export class 折れ線矢印VM<座標点T extends 配置物座標点> implements I配置物, I折れ線矢印VM, エッジVMと見なせる {
    public readonly 配置物ID: 折れ線矢印ID;
    public readonly 配置物種別 = '折れ線矢印' as const;
    public start: 座標点T;
    public 中点リスト: 座標点T[];
    public end: 座標点T;
    
    public constructor(id: 折れ線矢印ID, start: 座標点T, 中点リスト: 座標点T[], end: 座標点T) {
        this.配置物ID = id;
        this.start = start;
        this.中点リスト = 中点リスト;
        this.end = end;
    }

    public get エッジVM(): エッジVM {
        throw new Error("Method not implemented.");
    }

    /**
     * シリアライズ用データに変換
     */
    public toデータ(
        startRef?: 接続参照データ | null,
        endRef?: 接続参照データ | null
    ): 折れ線矢印データ {
        return 折れ線矢印データ.create(
            this.配置物ID,
            座標データ.fromPx2DVector(this.start.px2DVector),
            this.中点リスト.map(中点 => 座標データ.fromPx2DVector(中点.px2DVector)),
            座標データ.fromPx2DVector(this.end.px2DVector),
            startRef,
            endRef
        );
    }

    /**
     * データクラスから折れ線矢印VMを作成
     */
    public static fromデータ<座標点T extends 配置物座標点>(
        data: 折れ線矢印データ,
        座標変換: (座標: 座標データ) => 座標点T
    ): 折れ線矢印VM<座標点T> {
        return new 折れ線矢印VM(
            data.id,
            座標変換(data.start),
            data.中点リスト.map(座標変換),
            座標変換(data.end)
        );
    }
}

