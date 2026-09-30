import { 画面座標点 } from "SengenUI/index";

import { グローバルイベント購読 } from "BoomYack/基本オブジェクト/グローバルイベント購読";
import { ボード購読台帳 } from "BoomYack/基本オブジェクト/ボード購読台帳";
import { CanvasView } from "BoomYack/基本オブジェクト/描画キャンバス/描画キャンバスView分解/CanvasView";
import { GlobalMouseManager, WindowSizeScaleObserver } from "./付箋グラフボード入力";

/**
 * ウインドウの大きさが変わったとき、ポインタの位置を中心に描画の原点をずらして、見えている付箋の位置を保つ。
 * 購読は常に動かす側に置く。操作対象でないボードも大きさの変化の比率を取りこぼさないためである。
 */
export class ウインドウの大きさの変化への追従 {
    private readonly 大きさの観測 = new WindowSizeScaleObserver();

    public constructor(
        private readonly 描画キャンバスView: CanvasView,
        private readonly ポインタ: GlobalMouseManager,
        購読台帳: ボード購読台帳
    ) {
        購読台帳.常に動くものとして登録する(グローバルイベント購読.作成する(window, "resize", () => this.大きさの変化に合わせる()));
    }

    private 大きさの変化に合わせる(): void {
        const 大きさの変化 = this.大きさの観測.updateWindowSize();
        const 新しい原点: 画面座標点 = this.描画キャンバスView.描画基準座標.描画原点
            .plus(this.ポインタ.mousePos.px2DVector.times(大きさの変化.拡縮率 - 1));
        this.描画キャンバスView.update描画基準座標原点(新しい原点);
    }
}
