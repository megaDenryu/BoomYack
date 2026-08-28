import { IDMap } from "TypeScriptBenriKakuchou/DDDBase/IDBase";

import { 付箋ID } from "BoomYack/基本オブジェクト/ID";
import { Iグラフ配置先 } from "BoomYack/基本オブジェクト/配置物リポジトリ";
import { node付箋pair } from "../ValueObjects/node付箋pair";
import { レイアウト設定 } from "../ValueObjects/レイアウト設定";
import { ツリー幅計算 } from "./ツリー幅計算";
import { ツリーノード配置 } from "./ツリーノード配置";

export class ツリーレイアウト計算 {
    private readonly nodeIDMap = new Map<string, node付箋pair>();

    public constructor(
        pairMap: IDMap<付箋ID, node付箋pair>,
        private readonly 設定: レイアウト設定,
        private readonly 配置先: Iグラフ配置先
    ) {
        for (const pair of pairMap.values()) this.nodeIDMap.set(pair.node.id, pair);
    }

    public 実行する(): void {
        const roots = this.ルートを取得する();
        if (roots.length === 0 && this.nodeIDMap.size > 0) {
            const firstKey = this.nodeIDMap.keys().next().value;
            if (firstKey) {
                const root = this.nodeIDMap.get(firstKey);
                if (root) roots.push(root);
            }
        }

        const 幅計算 = new ツリー幅計算(this.nodeIDMap, this.設定);
        const ノード配置 = new ツリーノード配置(
            this.nodeIDMap, 幅計算.subtreeWidths, this.設定, this.配置先
        );
        let currentX = this.設定.開始位置.x.value;
        const startY = this.設定.開始位置.y.value;
        for (const root of roots) {
            幅計算.計算する(root);
            const rootWidth = 幅計算.subtreeWidths.get(root.node.id) ?? root.付箋.size.x.value;
            ノード配置.配置する(root, currentX + rootWidth / 2, startY);
            currentX += rootWidth + this.設定.横間隔.value;
        }
    }

    private ルートを取得する(): node付箋pair[] {
        const candidates = new Set(this.nodeIDMap.values());
        this.nodeIDMap.forEach(pair => pair.node.linkNode.nextIDs.forEach(nextID => {
            const nextPair = this.nodeIDMap.get(nextID);
            if (nextPair) candidates.delete(nextPair);
        }));
        return Array.from(candidates);
    }
}
