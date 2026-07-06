import { circle, svg, CircleC } from "SengenUI/index";
import { 点ハンドルViewBase } from "./点ハンドルViewBase";
import { Iハンドル操作実行時コマンド } from "./Iハンドル操作実行時コマンド";

/**
 * 始点や中点用の小さな円ハンドル
 */
export class 円ハンドルView extends 点ハンドルViewBase {
    private _circle: CircleC;

    public constructor(ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[]) {
        super(ハンドル操作実行時コマンドlist);
        this.addSvgContent(
            svg({ width: 12, height: 12, viewBox: "0 0 12 12" }).child(
                circle({
                    cx: 6,
                    cy: 6,
                    r: 5,
                    fill: "#4CAF50",
                    stroke: "#2E7D32",
                    strokeWidth: 1.5
                }).tap((circle) => { this._circle = circle; }
            )
        ));
    }

    protected onDragStyleChange(isDragging: boolean): void {
        if (isDragging) {
            this._circle.setFill("#66BB6A");
            this._circle.setStroke("#388E3C", 2);
        } else {
            this._circle.setFill("#4CAF50");
            this._circle.setStroke("#2E7D32", 1.5);
        }
    }

    protected onHoverStyleChange(isHovered: boolean): void {
        if (isHovered) {
            this._circle.setFill("#81C784");
        } else {
            this._circle.setFill("#4CAF50");
        }
    }
}
