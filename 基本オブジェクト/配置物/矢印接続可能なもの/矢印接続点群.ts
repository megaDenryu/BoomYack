import { Canvas座標Base, VectorNと見なせる, 配置物座標点 } from "SengenUI/index";

import { I接続点, I始終点矢印集約 } from "../../I配置物";
import { I接続点親情報, I矢印接続可能なもの中央PositionState, 接続点, 接続点State } from "./接続点";
import { 対象方向の接続点を選ぶ } from "./接続点方向選択";
import { 矢印上下左右Position, 絶対矢印上下左右Position } from "./矢印接続位置";
import { 矢印接続可能なもの依存関係 } from "./矢印接続可能なもの依存関係";

export class 矢印接続点群<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> {
    public readonly 上: 接続点<座標点T>;
    public readonly 右: 接続点<座標点T>;
    public readonly 下: 接続点<座標点T>;
    public readonly 左: 接続点<座標点T>;

    public constructor(
        pos: 絶対矢印上下左右Position<座標点T>,
        依存: 矢印接続可能なもの依存関係<座標点T>,
        中央PositionState: I矢印接続可能なもの中央PositionState<座標点T>,
        親情報: I接続点親情報<座標点T>
    ) {
        const 作る = (位置: 座標点T, 接続位置: "上" | "右" | "下" | "左") => new 接続点(
            new 接続点State(位置, 中央PositionState),
            依存.i矢印生成先,
            依存.i描画空間,
            接続位置,
            親情報
        );
        this.上 = 作る(pos.上, "上");
        this.右 = 作る(pos.右, "右");
        this.下 = 作る(pos.下, "下");
        this.左 = 作る(pos.左, "左");
    }

    public *リスト(): Iterable<接続点<座標点T>> {
        yield this.上;
        yield this.右;
        yield this.下;
        yield this.左;
    }

    public 接続矢印リスト(): ReadonlyArray<I始終点矢印集約<座標点T>> {
        return [
            ...this.上.接続している矢印リスト,
            ...this.右.接続している矢印リスト,
            ...this.下.接続している矢印リスト,
            ...this.左.接続している矢印リスト
        ];
    }

    public 座標を更新する(pos: 矢印上下左右Position<座標点T>): void {
        this.上.update位置(pos.絶対.上, pos.相対.上);
        this.右.update位置(pos.絶対.右, pos.相対.右);
        this.下.update位置(pos.絶対.下, pos.相対.下);
        this.左.update位置(pos.絶対.左, pos.相対.左);
    }

    public 方向から選ぶ(方向: VectorNと見なせる<any>, 現在?: I接続点<座標点T>): 接続点<座標点T> {
        return 対象方向の接続点を選ぶ(方向, this, 現在);
    }
}
