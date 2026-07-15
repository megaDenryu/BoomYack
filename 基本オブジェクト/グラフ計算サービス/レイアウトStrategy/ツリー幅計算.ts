import { node付箋pair } from "../ValueObjects/node付箋pair";
import { レイアウト設定 } from "../ValueObjects/レイアウト設定";

export class ツリー幅計算 {
    public readonly subtreeWidths = new Map<string, number>();
    private readonly calculated = new Set<string>();

    public constructor(
        private readonly nodeIDMap: Map<string, node付箋pair>,
        private readonly 設定: レイアウト設定
    ) {}

    public 計算する(pair: node付箋pair): void {
        if (!this.calculated.has(pair.node.id)) this.再帰計算する(pair);
    }

    private 再帰計算する(pair: node付箋pair): number {
        this.calculated.add(pair.node.id);
        const children = this.未計算の子を取得する(pair);
        let childrenTotalWidth = 0;
        if (children.length > 0) {
            children.forEach(child => childrenTotalWidth += this.再帰計算する(child));
            childrenTotalWidth += this.設定.横間隔.value * (children.length - 1);
        }
        const subtreeWidth = Math.max(pair.付箋.size.x.value, childrenTotalWidth);
        this.subtreeWidths.set(pair.node.id, subtreeWidth);
        return subtreeWidth;
    }

    private 未計算の子を取得する(pair: node付箋pair): node付箋pair[] {
        const children: node付箋pair[] = [];
        pair.node.linkNode.nextIDs.forEach(nextID => {
            const nextPair = this.nodeIDMap.get(nextID);
            if (nextPair && !this.calculated.has(nextID)) children.push(nextPair);
        });
        return children;
    }
}
