import { 描画座標点 } from "SengenUI/index";
import { 付箋集約 } from "../../配置物/付箋2/付箋集約";
import { 付箋設定パネル, 付箋設定状態 } from "../../配置物/設定パネル";
import { ボード基準座標変換 } from "../../キャンバス操作/座標変換/ボード基準座標変換";
import { CanvasGraphModel } from "./CanvasGraphModel";
import { 配置物衝突判定サービス } from "./配置物衝突判定サービス";

export class 付箋設定パネル表示 {
    private readonly _衝突判定 = new 配置物衝突判定サービス();

    public constructor(private readonly _model: CanvasGraphModel,
        private readonly _座標変換: ボード基準座標変換) {}

    public 表示する(付箋: 付箋集約<描画座標点>, 中心位置: 描画座標点): void {
        const 表示位置 = this._衝突判定.被らない位置を探す(
            中心位置, 220, 250, this._model.配置物リスト, 付箋, this._model.描画基準座標);
        const パネル = new 付箋設定パネル({
            position: 表示位置,
            初期設定: 付箋.get設定状態(),
            on設定変更: (設定: 付箋設定状態) => 付箋.設定を適用(設定),
            on閉じる: () => パネル.dom.element.remove(),
        });
        this._座標変換.ルート要素().appendChild(パネル.dom.element);
    }
}
