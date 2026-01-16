import { Px2DVector, Px長さ, 描画座標点 } from "SengenUI/index";
import { CanvasGraphModel } from "BoomYack/基本オブジェクト/描画キャンバス/描画キャンバスView分解/CanvasGraphModel";
import { node付箋pair } from "../ValueObjects/node付箋pair";
import { I後処理位置調整Strategy } from "./IStrategy";
import { IDMap } from "TypeScriptBenriKakuchou/DDDBase/IDBase";
import { 付箋ID } from "BoomYack/基本オブジェクト/ID";
import { レイアウト設定 } from "../ValueObjects/レイアウト設定";


export class サイズ考慮ツリーレイアウトStrategy implements I後処理位置調整Strategy {
    private readonly 設定: レイアウト設定;

    public constructor(設定: レイアウト設定) {
        this.設定 = 設定;
    }

    public 実行(pairMap: IDMap<付箋ID, node付箋pair>, model: CanvasGraphModel): void {
        const layoutContext = new TreeLayoutContext(pairMap, this.設定, model);
        layoutContext.execute();
    }
}

class TreeLayoutContext {
    private readonly pairMap: IDMap<付箋ID, node付箋pair>;
    private readonly nodeIDMap: Map<string, node付箋pair>;
    private readonly config: レイアウト設定;
    private readonly model: CanvasGraphModel;
    private readonly visited = new Set<string>();
    private readonly subtreeWidths = new Map<string, number>();

    constructor(
        pairMap: IDMap<付箋ID, node付箋pair>,
        config: レイアウト設定,
        model: CanvasGraphModel
    ) {
        this.pairMap = pairMap;
        this.config = config;
        this.model = model;
        this.nodeIDMap = new Map();

        // NodeIDで引けるようにマップを作成
        for (const pair of pairMap.values()) {
            this.nodeIDMap.set(pair.node.id, pair);
        }
    }

    public execute(): void {
        const roots = this.findRoots();
        if (roots.length === 0 && this.nodeIDMap.size > 0) {
            // サイクルのみの場合など、ルートが見つからない場合は適当なノードをルートにする
            const firstKey = this.nodeIDMap.keys().next().value;
            if (firstKey) {
                const root = this.nodeIDMap.get(firstKey);
                if (root) roots.push(root);
            }
        }

        let currentX = this.config.開始位置.x.value;
        const startY = this.config.開始位置.y.value;

        for (const root of roots) {
            this.calculateSubtreeWidth(root);

            // ルートノードの配置
            // 部分木の幅の中心に配置する
            const rootWidth = this.subtreeWidths.get(root.node.id) ?? root.付箋.size.x.value;
            const centerX = currentX + rootWidth / 2;

            this.placeNode(root, centerX, startY);

            currentX += rootWidth + this.config.横間隔.value;
        }
    }

    private findRoots(): node付箋pair[] {
        const candidates = new Set(this.nodeIDMap.values());

        this.nodeIDMap.forEach(pair => {
            pair.node.linkNode.nextIDs.forEach(nextID => {
                const nextPair = this.nodeIDMap.get(nextID);
                if (nextPair) {
                    candidates.delete(nextPair);
                }
            });
        });

        return Array.from(candidates);
    }



    // calculateSubtreeWidth用のvisited
    private calculated = new Set<string>();

    private getUnvisitedChildren(pair: node付箋pair): node付箋pair[] {
        const children: node付箋pair[] = [];
        pair.node.linkNode.nextIDs.forEach(nextID => {
            const nextPair = this.nodeIDMap.get(nextID);
            if (nextPair && !this.calculated.has(nextID)) {
                children.push(nextPair);
            }
        });
        return children;
    }

    // calculateSubtreeWidthを修正
    // このメソッドは、pair以下の未計算ノードのサイズを計算し、calculatedに追加する。
    // 戻り値は、pairとその子供たち（今回計算したもの）を含む部分木の幅。
    private calculateSubtreeWidth_Recursive(pair: node付箋pair): number {
        this.calculated.add(pair.node.id);

        const children = this.getUnvisitedChildren(pair);

        let childrenTotalWidth = 0;
        if (children.length > 0) {
            children.forEach(child => {
                childrenTotalWidth += this.calculateSubtreeWidth_Recursive(child);
            });
            childrenTotalWidth += this.config.横間隔.value * (children.length - 1);
        }

        const nodeWidth = pair.付箋.size.x.value;
        const subtreeWidth = Math.max(nodeWidth, childrenTotalWidth);

        this.subtreeWidths.set(pair.node.id, subtreeWidth);
        return subtreeWidth;
    }

    // ラッパー
    private calculateSubtreeWidth(pair: node付箋pair): void {
        if (!this.calculated.has(pair.node.id)) {
            this.calculateSubtreeWidth_Recursive(pair);
        }
    }

    private placeNode(pair: node付箋pair, centerX: number, y: number): void {
        // ノードの位置設定
        // centerXは部分木の中心。ノード自体の中心もここにする。
        const nodeWidth = pair.付箋.size.x.value;
        const nodeHeight = pair.付箋.size.y.value;

        const x = centerX - nodeWidth / 2;

        // 描画座標点を作成してセット
        const pos = new 描画座標点(
            new Px2DVector(new Px長さ(x), new Px長さ(y)),
            this.model.描画基準座標
        );
        pair.付箋.位置を設定(pos);

        // 子供の配置
        // 子供たちは centerX を中心に、全体幅で配置される
        // 子供リストは calculateSubtreeWidth で使ったのと同じロジックで取得する必要がある
        // しかし calculated は既に埋まっている。
        // なので、subtreeWidths にエントリがある子供だけを対象にする？
        // いや、subtreeWidths は全ノード持っている。

        // ここで「このノードの子供として扱われたノード」を知る必要がある。
        // あるいは、placeNode でも visited を使って、「まだ配置されていない子供」を配置する。

        const children: node付箋pair[] = [];
        pair.node.linkNode.nextIDs.forEach(nextID => {
            const nextPair = this.nodeIDMap.get(nextID);
            if (nextPair && !this.visited.has(nextID)) {
                children.push(nextPair);
            }
        });

        this.visited.add(pair.node.id); // 自分を訪問済みに

        if (children.length === 0) return;

        // 子供全体の幅を再計算（subtreeWidthsを使う）
        let childrenTotalWidth = 0;
        children.forEach(child => {
            childrenTotalWidth += this.subtreeWidths.get(child.node.id) ?? 0;
        });
        childrenTotalWidth += this.config.横間隔.value * (children.length - 1);

        let currentChildX = centerX - childrenTotalWidth / 2;
        const nextY = y + nodeHeight + this.config.縦間隔.value;

        children.forEach(child => {
            const childWidth = this.subtreeWidths.get(child.node.id) ?? 0;
            const childCenterX = currentChildX + childWidth / 2;

            this.placeNode(child, childCenterX, nextY);

            currentChildX += childWidth + this.config.横間隔.value;
        });
    }
}
