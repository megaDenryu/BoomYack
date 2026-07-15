import { Canvas座標Base, dotVectorN, VectorN, VectorNと見なせる, 配置物座標点 } from "SengenUI/index";

import { I接続点 } from "../../I配置物";
import { 接続点 } from "./接続点";

export interface 上下左右接続点<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> {
    上: 接続点<座標点T>;
    右: 接続点<座標点T>;
    下: 接続点<座標点T>;
    左: 接続点<座標点T>;
}

export function 対象方向の接続点を選ぶ<
    座標点T extends Canvas座標Base<座標点T> & 配置物座標点
>(
    対象方向: VectorNと見なせる<any>,
    接続点一覧: 上下左右接続点<座標点T>,
    現在の接続点?: I接続点<座標点T>
): 接続点<座標点T> {
    const 方向pair = [
        { ベクトル: new VectorN([0, 1]), 接続点: 接続点一覧.上 },
        { ベクトル: new VectorN([1, 0]), 接続点: 接続点一覧.右 },
        { ベクトル: new VectorN([0, -1]), 接続点: 接続点一覧.下 },
        { ベクトル: new VectorN([-1, 0]), 接続点: 接続点一覧.左 }
    ];
    const 慣性ゲイン = 0.1;
    return 方向pair
        .map(pair => ({
            接続点: pair.接続点,
            スコア: dotVectorN(対象方向, pair.ベクトル)
                + (pair.接続点 === 現在の接続点 ? 慣性ゲイン : 0)
        }))
        .reduce((max, current) => current.スコア > max.スコア ? current : max)
        .接続点;
}
