import { Px2DVector, 画面座標点 } from "SengenUI/index";

/**
 * マウス／タッチイベントの clientX/clientY はブラウザビューポート基準で届く。
 * 単体アプリではボードルートがビューポート全域を占めるため、そのまま
 * 使っても数値的に一致していた。だがタブ埋め込み時はボードルートが
 * ビューポート内の一部矩形になるため、ビューポート基準の値を
 * そのまま描画座標系（画面座標点/描画座標点）の入力に使うと
 * ボードルートの左上とずれた分だけ配置物やメニューの位置がずれる。
 *
 * この変換はボードルート要素の getBoundingClientRect() を都度取得し、
 * その left/top を引くことでビューポート基準の値をボードルート基準へ補正する。
 * ボードルート要素は 付箋グラフボード が所有するため、取得手段は
 * コンストラクタ注入のサンク（遅延評価）で受け取る。
 */
export class ボード基準座標変換 {
    public constructor(private readonly ルート要素取得: () => HTMLElement) {}

    public ルート要素(): HTMLElement {
        return this.ルート要素取得();
    }

    public viewportPointを補正する(viewportX: number, viewportY: number): Px2DVector {
        const rect = this.ルート要素().getBoundingClientRect();
        return Px2DVector.fromNumbers(viewportX - rect.left, viewportY - rect.top);
    }

    public 画面座標点を補正する(viewportX: number, viewportY: number): 画面座標点 {
        return 画面座標点.fromPx2DVector(this.viewportPointを補正する(viewportX, viewportY));
    }
}
