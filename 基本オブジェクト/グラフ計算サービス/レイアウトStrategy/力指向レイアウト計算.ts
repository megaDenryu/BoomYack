import { Px2DVector, 描画座標点 } from "SengenUI/index";

import { Iグラフ配置先 } from "BoomYack/基本オブジェクト/配置物リポジトリ";
import { 力ベクトル } from "../ValueObjects/力ベクトル";
import { node付箋pair } from "../ValueObjects/node付箋pair";

export class 力指向レイアウト計算 {
    public constructor(
        private readonly pairs: node付箋pair[],
        private readonly 配置先: Iグラフ配置先,
        private readonly 反発係数: number,
        private readonly 引力係数: number,
        private readonly イテレーション回数: number,
        private readonly 減衰係数: number
    ) {}

    public 実行する(): void {
        this.pairs.forEach(pair => pair.付箋.view.位置を設定(new 描画座標点(
            Px2DVector.fromNumbers(Math.random() * 800 + 100, Math.random() * 600 + 100),
            this.配置先.描画基準座標
        )));
        for (let iter = 0; iter < this.イテレーション回数; iter++) {
            const 力Map = this.力を初期化する();
            this.反発力を加える(力Map);
            this.引力を加える(力Map);
            this.位置を更新する(力Map);
        }
        this.pairs.forEach(pair => pair.付箋.再描画());
    }

    private 力を初期化する(): Map<string, 力ベクトル> {
        const 力Map = new Map<string, 力ベクトル>();
        this.pairs.forEach(pair => 力Map.set(pair.node.id, 力ベクトル.zero()));
        return 力Map;
    }

    private 反発力を加える(力Map: Map<string, 力ベクトル>): void {
        for (let i = 0; i < this.pairs.length; i++) {
            for (let j = i + 1; j < this.pairs.length; j++) {
                const pair1 = this.pairs[i];
                const pair2 = this.pairs[j];
                const 差分 = pair1.付箋.view.position.px2DVector.minus(pair2.付箋.view.position.px2DVector);
                const 距離 = Math.sqrt(差分.x.値 ** 2 + 差分.y.値 ** 2);
                if (距離 < 1) continue;
                const 反発力 = 力ベクトル.from(差分).正規化().scale(this.反発係数 / (距離 * 距離));
                力Map.set(pair1.node.id, 力Map.get(pair1.node.id)!.add(反発力));
                力Map.set(pair2.node.id, 力Map.get(pair2.node.id)!.add(反発力.scale(-1)));
            }
        }
    }

    private 引力を加える(力Map: Map<string, 力ベクトル>): void {
        this.pairs.forEach(pair => pair.node.linkNode.nextIDs.forEach(nextID => {
            const nextPair = this.pairs.find(candidate => candidate.node.id === nextID);
            if (!nextPair) return;
            const 差分 = nextPair.付箋.view.position.px2DVector.minus(pair.付箋.view.position.px2DVector);
            const 引力 = 力ベクトル.from(差分).scale(this.引力係数);
            力Map.set(pair.node.id, 力Map.get(pair.node.id)!.add(引力));
            力Map.set(nextPair.node.id, 力Map.get(nextPair.node.id)!.add(引力.scale(-1)));
        }));
    }

    private 位置を更新する(力Map: Map<string, 力ベクトル>): void {
        this.pairs.forEach(pair => {
            const 現在位置 = pair.付箋.view.position.px2DVector;
            const 移動量 = 力Map.get(pair.node.id)!.scale(this.減衰係数);
            pair.付箋.view.位置を設定(new 描画座標点(
                現在位置.plus(移動量.ベクトル), this.配置先.描画基準座標
            ));
        });
    }
}
