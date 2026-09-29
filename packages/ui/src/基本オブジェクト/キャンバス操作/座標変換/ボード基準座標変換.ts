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
 * さらにボードルートのスクロール量を足し、ボードルートの中身の座標(スクロールで一緒に動く座標)にする。
 * 付箋・メニュー・ダイアログ・配置物コンテナの拡縮中心はすべてこの中身の座標で置かれる。
 * ボードルート要素は 付箋グラフボード が所有するため、取得手段は
 * コンストラクタ注入のサンク（遅延評価）で受け取る。
 *
 * 注意: ボードルートは overflow:hidden だが、付箋の入力中にブラウザがカーソルを見せるためスクロールさせる。
 * スクロール量を足さないと、スクロール中はポインタの位置からスクロール量だけ上や左へずれて置かれる。
 */
export class ボード基準座標変換 {
    public constructor(private readonly ルート要素取得: () => HTMLElement) {}

    public ルート要素(): HTMLElement {
        return this.ルート要素取得();
    }

    /** ボードルートの中身が、見えている範囲に対して上と左へずれている量。 */
    public ルートのスクロール量(): Px2DVector {
        const ルート = this.ルート要素();
        return Px2DVector.fromNumbers(ルート.scrollLeft, ルート.scrollTop);
    }

    /** ボードルートの見えている範囲の大きさ(スクロールバーと枠線を除く)。 */
    public ルートの見えている大きさ(): Px2DVector {
        const ルート = this.ルート要素();
        return Px2DVector.fromNumbers(ルート.clientWidth, ルート.clientHeight);
    }

    /** ビューポート基準の点を、ボードルートの中身の座標(スクロール量を含む)へ変換する。 */
    public viewportPointを補正する(viewportX: number, viewportY: number): Px2DVector {
        const rect = this.ルート要素().getBoundingClientRect();
        const ルートの見えている左上からの位置 = Px2DVector.fromNumbers(viewportX - rect.left, viewportY - rect.top);
        return ルートの見えている左上からの位置.plus(this.ルートのスクロール量());
    }

    public 画面座標点を補正する(viewportX: number, viewportY: number): 画面座標点 {
        return 画面座標点.fromPx2DVector(this.viewportPointを補正する(viewportX, viewportY));
    }
}
