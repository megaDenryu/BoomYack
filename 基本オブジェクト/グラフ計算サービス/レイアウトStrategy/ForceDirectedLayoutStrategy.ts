import { Px2DVector, 描画座標点 } from "SengenUI/index";
// ========================================
// Strategy実装: Force-Directed Layout（後処理型）
// ========================================

import { IDMap } from "Extend/DDDBase/IDBase";
import { 付箋ID } from "BoomYack/基本オブジェクト/ID";
import { CanvasGraphModel } from "BoomYack/基本オブジェクト/描画キャンバス/描画キャンバスView分解/CanvasGraphModel";
import { 力ベクトル } from "../ValueObjects/力ベクトル";
import { node付箋pair } from "../ValueObjects/node付箋pair";
import { I後処理位置調整Strategy } from "./IStrategy";


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

    public 実行(pairMap: IDMap<付箋ID, node付箋pair>, model: CanvasGraphModel): void {
        const pairs = Array.from(pairMap.values());
        
        // 初期位置をランダムに配置
        pairs.forEach((pair, index) => {
            const 初期位置 = new 描画座標点(
                Px2DVector.fromNumbers(
                    Math.random() * 800 + 100,
                    Math.random() * 600 + 100
                ),
                model.描画基準座標
            );
            pair.付箋.view.位置を設定(初期位置);
        });

        // 力学シミュレーション
        for (let iter = 0; iter < this.イテレーション回数; iter++) {
            const 力Map = new Map<string, 力ベクトル>();

            // 各ノードの力を初期化
            pairs.forEach(pair => {
                力Map.set(pair.node.id, 力ベクトル.zero());
            });

            // 反発力計算（全ノード間）
            for (let i = 0; i < pairs.length; i++) {
                for (let j = i + 1; j < pairs.length; j++) {
                    const pair1 = pairs[i];
                    const pair2 = pairs[j];

                    const pos1 = pair1.付箋.view.position.px2DVector;
                    const pos2 = pair2.付箋.view.position.px2DVector;

                    const 差分 = pos1.minus(pos2);
                    const 距離 = Math.sqrt(差分.x.値 ** 2 + 差分.y.値 ** 2);

                    if (距離 < 1) continue; // ゼロ除算回避

                    const 反発力の大きさ = this.反発係数 / (距離 * 距離);
                    const 正規化された差分 = 力ベクトル.from(差分).正規化();

                    const 反発力 = 正規化された差分.scale(反発力の大きさ);

                    力Map.set(pair1.node.id, 力Map.get(pair1.node.id)!.add(反発力));
                    力Map.set(pair2.node.id, 力Map.get(pair2.node.id)!.add(反発力.scale(-1)));
                }
            }

            // 引力計算（エッジで接続されたノード間）
            pairs.forEach(pair => {
                pair.node.linkNode.nextIDs.forEach(nextId => {
                    const nextPair = pairs.find(p => p.node.id === nextId);
                    if (!nextPair) return;

                    const pos1 = pair.付箋.view.position.px2DVector;
                    const pos2 = nextPair.付箋.view.position.px2DVector;

                    const 差分 = pos2.minus(pos1);
                    const 引力 = 力ベクトル.from(差分).scale(this.引力係数);

                    力Map.set(pair.node.id, 力Map.get(pair.node.id)!.add(引力));
                    力Map.set(nextPair.node.id, 力Map.get(nextPair.node.id)!.add(引力.scale(-1)));
                });
            });

            // 位置更新
            pairs.forEach(pair => {
                const 力 = 力Map.get(pair.node.id)!;
                const 現在位置 = pair.付箋.view.position.px2DVector;
                
                const 移動量 = 力.scale(this.減衰係数);
                const 新しい位置 = 現在位置.plus(移動量.ベクトル);

                pair.付箋.view.位置を設定(
                    new 描画座標点(新しい位置, model.描画基準座標)
                );
            });
        }

        // 最終的に再描画
        pairs.forEach(pair => pair.付箋.再描画());
    }
}
