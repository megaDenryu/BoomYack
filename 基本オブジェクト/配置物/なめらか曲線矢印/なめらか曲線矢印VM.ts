import { Canvas座標Base, 配置物座標点 } from "SengenUI/index";
import { なめらか曲線矢印ID } from "../../ID";
import { Iなめらか曲線矢印VM } from "../../I配置物";
import { なめらか曲線矢印データ, 座標データ, 接続参照データ } from "../../描画キャンバス/データクラス";

/**
 * なめらか曲線矢印のVM。折れ線矢印VMと同じ形だが中点リストを持たない
 * (なめらか曲線矢印は始点/終点のみで曲線形状を自動計算するため)。
 */
export class なめらか曲線矢印VM<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> implements Iなめらか曲線矢印VM {
    public readonly 配置物ID: なめらか曲線矢印ID;
    public start: 座標点T;
    public end: 座標点T;

    public constructor(id: なめらか曲線矢印ID, start: 座標点T, end: 座標点T) {
        this.配置物ID = id;
        this.start = start;
        this.end = end;
    }

    public toデータ(
        startRef?: 接続参照データ | null,
        endRef?: 接続参照データ | null
    ): なめらか曲線矢印データ {
        return なめらか曲線矢印データ.create(
            this.配置物ID,
            座標データ.fromPx2DVector(this.start.px2DVector),
            座標データ.fromPx2DVector(this.end.px2DVector),
            startRef,
            endRef
        );
    }

    public static fromデータ<座標点T extends Canvas座標Base<座標点T> & 配置物座標点>(
        data: なめらか曲線矢印データ,
        座標変換: (座標: 座標データ) => 座標点T
    ): なめらか曲線矢印VM<座標点T> {
        return new なめらか曲線矢印VM(
            data.id,
            座標変換(data.start),
            座標変換(data.end)
        );
    }
}
