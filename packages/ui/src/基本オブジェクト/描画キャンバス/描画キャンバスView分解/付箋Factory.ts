import { 描画座標点 } from "SengenUI/index";
import { 付箋ID } from "../../ID";
import { 付箋集約 } from "../../配置物/付箋2/付箋集約";
import { コンテンツ種別の最小高さを取得する, タイトル付き付箋初期寸法, 札参照付箋初期寸法, 自由テキスト付箋初期寸法 } from "../../配置物/付箋2/付箋初期寸法";
import { 付箋データ } from "../データクラス";
import { 自由テキストコンテンツを作る, タイトル付きコンテンツを作る, 札参照コンテンツを作る } from "../付箋コンテンツデータ";
import { CanvasGraphModel } from "./CanvasGraphModel";
import { 付箋構築依存関係, 付箋を構築する } from "./付箋構築";

export class 付箋Factory {
    public constructor(private readonly _model: CanvasGraphModel,
        private readonly _dep: 付箋構築依存関係) {}

    public create付箋(pos: 描画座標点, text?: string, id?: string): 付箋集約<描画座標点> {
        return 付箋を構築する(pos, 自由テキスト付箋初期寸法.サイズ,
            自由テキスト付箋初期寸法.最小高さ, 自由テキストコンテンツを作る(text ?? ""), new 付箋ID(id), this._dep);
    }

    public createタイトル付き付箋(pos: 描画座標点, id?: string): 付箋集約<描画座標点> {
        return 付箋を構築する(pos, タイトル付き付箋初期寸法.サイズ,
            タイトル付き付箋初期寸法.最小高さ, タイトル付きコンテンツを作る("", ""), new 付箋ID(id), this._dep);
    }

    public create札参照付箋(pos: 描画座標点, 札ID: string, id?: string): 付箋集約<描画座標点> {
        return 付箋を構築する(pos, 札参照付箋初期寸法.サイズ,
            札参照付箋初期寸法.最小高さ, 札参照コンテンツを作る(札ID), new 付箋ID(id), this._dep);
    }

    public create付箋FromData(data: 付箋データ): 付箋集約<描画座標点> {
        const pos = 描画座標点.fromPx2DVector(data.position.toPx2DVector(), this._model.描画基準座標);
        const note = 付箋を構築する(pos, data.size.toPx2DVector(),
            コンテンツ種別の最小高さを取得する(data.コンテンツ), data.コンテンツ, data.id, this._dep);
        note.設定を適用(data.設定状態);
        return note;
    }
}
