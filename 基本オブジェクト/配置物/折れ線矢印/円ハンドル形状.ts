import { circle, svg, CircleC, SvgC } from "SengenUI/index";
import { Iハンドル形状 } from "./Iハンドル形状";

/**
 * 始点・中間点用の小さな円形状。点ハンドルViewへ注入して使う。
 */
export class 円ハンドル形状 implements Iハンドル形状 {
    private _circle: CircleC;
    public readonly svg: SvgC;

    public constructor() {
        this.svg = (
            svg({ width: 12, height: 12, viewBox: "0 0 12 12" }).child(
                circle({
                    cx: 6,
                    cy: 6,
                    r: 5,
                    fill: "#4CAF50",
                    stroke: "#2E7D32",
                    strokeWidth: 1.5
                }).tap((c) => { this._circle = c; }))
        );
    }

    public ドラッグ時のスタイル変更(isDragging: boolean): void {
        if (isDragging) {
            this._circle.setFill("#66BB6A");
            this._circle.setStroke("#388E3C", 2);
        } else {
            this._circle.setFill("#4CAF50");
            this._circle.setStroke("#2E7D32", 1.5);
        }
    }

    public ホバー時のスタイル変更(isHovered: boolean): void {
        if (isHovered) {
            this._circle.setFill("#81C784");
        } else {
            this._circle.setFill("#4CAF50");
        }
    }
}
