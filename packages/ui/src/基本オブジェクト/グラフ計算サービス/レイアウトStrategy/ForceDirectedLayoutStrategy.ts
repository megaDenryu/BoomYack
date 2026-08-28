import { IDMap } from "TypeScriptBenriKakuchou/DDDBase/IDBase";

import { 付箋ID } from "BoomYack/基本オブジェクト/ID";
import { Iグラフ配置先 } from "BoomYack/基本オブジェクト/配置物リポジトリ";
import { node付箋pair } from "../ValueObjects/node付箋pair";
import { I後処理位置調整Strategy } from "./IStrategy";
import { 力指向レイアウト計算 } from "./力指向レイアウト計算";

export class ForceDirectedLayoutStrategy implements I後処理位置調整Strategy {
    private constructor(
        private readonly 反発係数: number = 5000,
        private readonly 引力係数: number = 0.05,
        private readonly イテレーション回数: number = 300,
        private readonly 減衰係数: number = 0.95
    ) {}

    public static create(
        反発係数: number = 5000,
        引力係数: number = 0.05,
        イテレーション回数: number = 300 * 100
    ): ForceDirectedLayoutStrategy {
        return new ForceDirectedLayoutStrategy(反発係数, 引力係数, イテレーション回数);
    }

    public 実行(pairMap: IDMap<付箋ID, node付箋pair>, 配置先: Iグラフ配置先): void {
        new 力指向レイアウト計算(
            Array.from(pairMap.values()),
            配置先,
            this.反発係数,
            this.引力係数,
            this.イテレーション回数,
            this.減衰係数
        ).実行する();
    }
}
