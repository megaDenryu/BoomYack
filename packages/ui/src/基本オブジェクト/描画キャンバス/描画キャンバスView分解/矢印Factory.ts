import { 描画座標点 } from "SengenUI/index";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { Iキャンバスコマンド } from "../../キャンバス操作/コマンドリポジトリ/Iキャンバスコマンド";
import { 配置物なめらか曲線矢印変更コマンド, 配置物矢印変更コマンド } from "../../キャンバス操作/コマンドリポジトリ/具体的なコマンド群";
import { 折れ線矢印VM, 折れ線矢印集約 } from "../../配置物";
import { なめらか曲線矢印VM } from "../../配置物/なめらか曲線矢印/なめらか曲線矢印VM";
import { なめらか曲線矢印集約 } from "../../配置物/なめらか曲線矢印/なめらか曲線矢印集約";
import { 折れ線矢印データ, なめらか曲線矢印データ, 座標データ } from "../データクラス";
import { CanvasGraphModel } from "./CanvasGraphModel";
import { 矢印ドラッグ履歴を作る } from "./矢印ドラッグ履歴";

export class 矢印Factory {
    public constructor(private readonly _model: CanvasGraphModel,
        private readonly _selection: I配置物選択機能集約,
        private readonly _commandを積む: ((command: Iキャンバスコマンド) => void) | undefined) {}

    public create折れ線矢印(vm: 折れ線矢印VM<描画座標点>): 折れ線矢印集約<描画座標点> {
        const arrow = new 折れ線矢印集約(vm, this._model, this._model, this._selection);
        return arrow.配線する(矢印ドラッグ履歴を作る(arrow,
            (start, end) => new 配置物矢印変更コマンド(arrow, start, end, this._model), this._commandを積む));
    }

    public create折れ線矢印FromData(data: 折れ線矢印データ): 折れ線矢印集約<描画座標点> {
        return this.create折れ線矢印(new 折れ線矢印VM(data.id,
            this._座標へ変換する(data.start), data.中点リスト.map(point => this._座標へ変換する(point)),
            this._座標へ変換する(data.end)));
    }

    public createなめらか曲線矢印(vm: なめらか曲線矢印VM<描画座標点>): なめらか曲線矢印集約<描画座標点> {
        const arrow = new なめらか曲線矢印集約(vm, this._model, this._model, this._selection);
        return arrow.配線する(矢印ドラッグ履歴を作る(arrow,
            (start, end) => new 配置物なめらか曲線矢印変更コマンド(
                arrow, start, end, this._model), this._commandを積む));
    }

    public createなめらか曲線矢印FromData(data: なめらか曲線矢印データ): なめらか曲線矢印集約<描画座標点> {
        return this.createなめらか曲線矢印(new なめらか曲線矢印VM(data.id,
            this._座標へ変換する(data.start), this._座標へ変換する(data.end),
            data.middlePoints.map(point => this._座標へ変換する(point))));
    }

    private _座標へ変換する(data: 座標データ): 描画座標点 {
        return 描画座標点.fromPx2DVector(data.toPx2DVector(), this._model.描画基準座標);
    }
}
