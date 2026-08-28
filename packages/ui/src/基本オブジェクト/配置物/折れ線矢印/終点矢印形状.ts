import { polygon, svg, PolygonC, SvgC } from "SengenUI/index";
import { Iハンドル形状 } from "./Iハンドル形状";

/**
 * 終点用の矢印形状。点ハンドルViewへ注入して使う。
 */
export class 終点矢印形状 implements Iハンドル形状 {
    private _arrow: PolygonC;
    public readonly svg: SvgC;

    public constructor() {
        this.svg = (
            svg({ width: 20, height: 20, viewBox: "0 0 20 20" }).child(
                polygon({
                    points: [[18, 10], [2, 18], [2, 2]],
                    fill: "#FF5722",
                    stroke: "#D84315",
                    strokeWidth: 1.5,
                    strokeLinejoin: "round"
                }).tap((poly) => { this._arrow = poly; }))
        );
    }

    public ドラッグ時のスタイル変更(isDragging: boolean): void {
        if (isDragging) {
            this._arrow.setFill("#FF7043");
            this._arrow.setStroke("#E64A19", 2);
        } else {
            this._arrow.setFill("#FF5722");
            this._arrow.setStroke("#D84315", 1.5);
        }
    }

    public ホバー時のスタイル変更(isHovered: boolean): void {
        if (isHovered) {
            this._arrow.setFill("#FF8A65");
        } else {
            this._arrow.setFill("#FF5722");
        }
    }
}
