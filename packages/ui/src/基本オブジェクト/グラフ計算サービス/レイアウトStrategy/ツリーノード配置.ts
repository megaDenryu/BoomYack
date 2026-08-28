import { Px2DVector, Px長さ, 描画座標点 } from "SengenUI/index";

import { Iグラフ配置先 } from "BoomYack/基本オブジェクト/配置物リポジトリ";
import { node付箋pair } from "../ValueObjects/node付箋pair";
import { レイアウト設定 } from "../ValueObjects/レイアウト設定";

export class ツリーノード配置 {
    private readonly visited = new Set<string>();

    public constructor(
        private readonly nodeIDMap: Map<string, node付箋pair>,
        private readonly subtreeWidths: Map<string, number>,
        private readonly 設定: レイアウト設定,
        private readonly 配置先: Iグラフ配置先
    ) {}

    public 配置する(pair: node付箋pair, centerX: number, y: number): void {
        const nodeWidth = pair.付箋.size.x.value;
        const nodeHeight = pair.付箋.size.y.value;
        const pos = new 描画座標点(
            new Px2DVector(new Px長さ(centerX - nodeWidth / 2), new Px長さ(y)),
            this.配置先.描画基準座標
        );
        pair.付箋.位置を設定(pos);

        const children = this.未配置の子を取得する(pair);
        this.visited.add(pair.node.id);
        if (children.length === 0) return;

        let childrenTotalWidth = 0;
        children.forEach(child => childrenTotalWidth += this.subtreeWidths.get(child.node.id) ?? 0);
        childrenTotalWidth += this.設定.横間隔.value * (children.length - 1);
        let currentChildX = centerX - childrenTotalWidth / 2;
        const nextY = y + nodeHeight + this.設定.縦間隔.value;
        children.forEach(child => {
            const childWidth = this.subtreeWidths.get(child.node.id) ?? 0;
            this.配置する(child, currentChildX + childWidth / 2, nextY);
            currentChildX += childWidth + this.設定.横間隔.value;
        });
    }

    private 未配置の子を取得する(pair: node付箋pair): node付箋pair[] {
        const children: node付箋pair[] = [];
        pair.node.linkNode.nextIDs.forEach(nextID => {
            const nextPair = this.nodeIDMap.get(nextID);
            if (nextPair && !this.visited.has(nextID)) children.push(nextPair);
        });
        return children;
    }
}
