import { Canvas座標Base, 配置物座標点 } from "SengenUI/index";
import { 矢印ID } from "../../ID";
import { 矢印データ, 座標データ, 接続参照データ } from "../../描画キャンバス/データクラス";

export class 矢印VM<T extends Canvas座標Base<T> & 配置物座標点> {
    public constructor(
        public readonly id: 矢印ID,
        public readonly start: T,
        public readonly end: T
    ) { }

    public toデータ(startRef?: 接続参照データ | null, endRef?: 接続参照データ | null): 矢印データ {
        return 矢印データ.create(
            this.id,
            座標データ.fromPx2DVector(this.start.px2DVector),
            座標データ.fromPx2DVector(this.end.px2DVector),
            startRef,
            endRef
        );
    }

    public static fromデータ<T extends Canvas座標Base<T> & 配置物座標点>(
        data: 矢印データ,
        convert: (position: 座標データ) => T
    ): 矢印VM<T> {
        return new 矢印VM(data.id, convert(data.start), convert(data.end));
    }
}
