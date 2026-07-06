import { circle, svg } from "SengenUI/index";
import { 点ハンドルViewBase } from "./点ハンドルViewBase";
import { Iハンドル操作実行時コマンド } from "./Iハンドル操作実行時コマンド";

export class 点ハンドルView extends 点ハンドルViewBase {
    constructor(ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[]) {
        super(ハンドル操作実行時コマンドlist);
        this.addSvgContent(
            svg({ width: 20, height: 20, viewBox: "0 0 20 20" }).child(
                circle({
                    cx: 10,
                    cy: 10,
                    r: 8,
                    fill: "#4CAF50",
                    stroke: "#2E7D32",
                    strokeWidth: 2
                })
            ));
    }
}
