import { polygon, svg, PolygonC } from "SengenUI/index";
import { 点ハンドルViewBase } from "./点ハンドルViewBase";
import { Iハンドル操作実行時コマンド } from "./Iハンドル操作実行時コマンド";

/**
 * 終点用の矢印形状ハンドル
 */
export class 終点矢印ハンドルView extends 点ハンドルViewBase {
    private _arrow: PolygonC;

    public constructor(ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[]) {
        super(ハンドル操作実行時コマンドlist);
        this.addSvgContent(
            svg({ width: 20, height: 20, viewBox: "0 0 20 20" }).child(
                polygon({
                    points: [[18, 10], [2, 18], [2, 2]],
                    fill: "#FF5722",
                    stroke: "#D84315",
                    strokeWidth: 1.5,
                    strokeLinejoin: "round"
                }).tap((poly) => { this._arrow = poly; }
            )
        ));
    }

    protected onDragStyleChange(isDragging: boolean): void {
        if (isDragging) {
            this._arrow.setFill("#FF7043");
            this._arrow.setStroke("#E64A19", 2);
        } else {
            this._arrow.setFill("#FF5722");
            this._arrow.setStroke("#D84315", 1.5);
        }
    }

    protected onHoverStyleChange(isHovered: boolean): void {
        if (isHovered) {
            this._arrow.setFill("#FF8A65");
        } else {
            this._arrow.setFill("#FF5722");
        }
    }
}
