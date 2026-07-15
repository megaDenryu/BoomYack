import { Iキャンバスコマンド } from "./Iキャンバスコマンド";
import { CanvasGraphModel } from "../../描画キャンバス/描画キャンバスView分解/CanvasGraphModel";
import { 描画座標点 } from "SengenUI/index";
import { I折れ線矢印集約, Iなめらか曲線矢印集約 } from "../../I配置物";
import { なめらか曲線矢印データ } from "../../描画キャンバス/データクラス";
export { 配置物追加コマンド, 配置物削除コマンド } from "./配置物追加削除コマンド";

export interface I位置設定可能な配置物 {
    位置を設定(pos: 描画座標点): void;
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

export class 配置物なめらか曲線矢印変更コマンド implements Iキャンバスコマンド {
    constructor(
        private readonly arrow: Iなめらか曲線矢印集約<描画座標点>,
        private readonly oldData: なめらか曲線矢印データ,
        private readonly newData: なめらか曲線矢印データ,
        private readonly model: CanvasGraphModel
    ) {}

    execute(): void {
        this.arrow.updateStateFromData(this.newData, this.model.描画基準座標);
    }

    undo(): void {
        this.arrow.updateStateFromData(this.oldData, this.model.描画基準座標);
    }
}
