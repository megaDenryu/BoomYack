import { Iキャンバスコマンド } from "./Iキャンバスコマンド";
import { CanvasGraphModel } from "../../描画キャンバス/描画キャンバスView分解/CanvasGraphModel";
import { Px2DVector, 描画座標点 } from "SengenUI/index";
import { I折れ線矢印集約, I配置物集約 } from "../../I配置物";

export class 配置物追加コマンド implements Iキャンバスコマンド {
    private readonly items: I配置物集約[];

    constructor(
        private readonly model: CanvasGraphModel,
        itemOrItems: I配置物集約 | I配置物集約[]
    ) {
        this.items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    }

    execute(): void {
        for (const item of this.items) {
            this.model.add配置物(item);
        }
    }

    undo(): void {
        for (const item of this.items) {
            this.model.remove配置物(item);
        }
    }
}

export interface I位置設定可能な配置物 {
    位置を設定(pos: 描画座標点): void;
}

export class 配置物削除コマンド implements Iキャンバスコマンド {
    private removedItems: I配置物集約[] = [];

    constructor(
        private readonly model: CanvasGraphModel,
        private readonly targetItems: I配置物集約[]
    ) {}

    execute(): void {
        this.removedItems = [];
        // キャンバスのGraphModel.remove配置物はカスケード削除を含むため、
        // 削除前に現在のキャンバス状態から、実際に削除される予定のアイテムを特定するのが理想ですが、
        // 単純化のため、イベント等から削除されたアイテムを集めるか、
        // 事前に依存関係を特定して記録しておきます。
        
        // 事前に削除対象とその依存関係をすべて抽出します。
        const allItemsToRemove = new Set<I配置物集約>(this.targetItems);
        let addedNew;
        do {
            addedNew = false;
            for (const other of this.model.配置物リスト) {
                if (other.type === "折れ線矢印" && !allItemsToRemove.has(other)) {
                    const arrow = other as unknown as I折れ線矢印集約<描画座標点>;
                    const startId = arrow.get始点接続付箋ID()?.id;
                    const endId = arrow.get終点接続付箋ID()?.id;
                    const isDependent = Array.from(allItemsToRemove).some(i => i.idString === startId || i.idString === endId);
                    if (isDependent) {
                        allItemsToRemove.add(other);
                        addedNew = true;
                    }
                }
            }
        } while (addedNew);

        // トポロジカルソートの逆順、つまり矢印→付箋の順に削除するための整理は model 内部でやってくれますが、
        // 再配置時は 付箋→矢印 の順に追加する必要があります。
        // this.model.配置物リスト に入っている順序で記録しておけば、元の順序で復元できます。
        for (const item of this.model.配置物リスト) {
            if (allItemsToRemove.has(item)) {
                this.removedItems.push(item);
            }
        }
        
        // 実際の削除実行
        for (const item of this.targetItems) {
            this.model.remove配置物(item);
        }
    }

    undo(): void {
        // execute時に記録したアイテムを順番に追加しなおします。
        for (const item of this.removedItems) {
            this.model.add配置物(item);
        }
    }
}

export class 配置物移動コマンド implements Iキャンバスコマンド {
    constructor(
        private readonly item: I位置設定可能な配置物,
        private readonly startPos: 描画座標点,
        private readonly endPos: 描画座標点
    ) {}

    execute(): void {
        this.item.位置を設定(this.endPos);
    }

    undo(): void {
        this.item.位置を設定(this.startPos);
    }
}

export interface Iテキスト設定可能な配置物 {
    setText(text: string): void;
}

export class 配置物テキスト変更コマンド implements Iキャンバスコマンド {
    constructor(
        private readonly item: Iテキスト設定可能な配置物,
        private readonly oldText: string,
        private readonly newText: string
    ) {}

    execute(): void {
        this.item.setText(this.newText);
    }

    undo(): void {
        this.item.setText(this.oldText);
    }
}

export class 配置物矢印変更コマンド implements Iキャンバスコマンド {
    constructor(
        private readonly arrow: I折れ線矢印集約<描画座標点>,
        private readonly oldData: any, // 折れ線矢印データ
        private readonly newData: any, // 折れ線矢印データ
        private readonly model: CanvasGraphModel
    ) {}

    execute(): void {
        this.arrow.updateStateFromData(this.newData, this.model.描画基準座標);
        // 接続状態の更新が必要な場合は、ここで行う
    }

    undo(): void {
        this.arrow.updateStateFromData(this.oldData, this.model.描画基準座標);
    }
}
