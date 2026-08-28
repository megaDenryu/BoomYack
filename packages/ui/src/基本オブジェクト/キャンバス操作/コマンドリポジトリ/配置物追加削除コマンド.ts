import { 描画座標点 } from "SengenUI/index";
import { I配置物集約, is始終点矢印集約 } from "../../I配置物";
import { CanvasGraphModel } from "../../描画キャンバス/描画キャンバスView分解/CanvasGraphModel";
import { Iキャンバスコマンド } from "./Iキャンバスコマンド";

export class 配置物追加コマンド implements Iキャンバスコマンド {
    private readonly items: I配置物集約[];
    public constructor(private readonly model: CanvasGraphModel,
        itemOrItems: I配置物集約 | I配置物集約[]) {
        this.items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    }
    public execute(): void { this.items.forEach(item => this.model.add配置物(item)); }
    public undo(): void { this.items.forEach(item => this.model.remove配置物(item)); }
}

export class 配置物削除コマンド implements Iキャンバスコマンド {
    private removedItems: I配置物集約[] = [];
    public constructor(private readonly model: CanvasGraphModel,
        private readonly targetItems: I配置物集約[]) {}

    public execute(): void {
        this.removedItems = [];
        const allItemsToRemove = new Set<I配置物集約>(this.targetItems);
        let addedNew: boolean;
        do {
            addedNew = false;
            for (const other of this.model.配置物リスト) {
                if (!is始終点矢印集約<描画座標点>(other) || allItemsToRemove.has(other)) continue;
                const startId = other.get始点接続付箋ID()?.id;
                const endId = other.get終点接続付箋ID()?.id;
                const dependent = Array.from(allItemsToRemove)
                    .some(item => item.idString === startId || item.idString === endId);
                if (dependent) { allItemsToRemove.add(other); addedNew = true; }
            }
        } while (addedNew);
        for (const item of this.model.配置物リスト)
            if (allItemsToRemove.has(item)) this.removedItems.push(item);
        this.targetItems.forEach(item => this.model.remove配置物(item));
    }

    public undo(): void { this.removedItems.forEach(item => this.model.add配置物(item)); }
}
