import { circle, div, DivC, svg, ビューポート座標値 } from "SengenUI/index";

import { 矢印接続可能なもの接続点View as 接続点CSS } from "./style.css";

export function 接続点Viewを作る(pos: ビューポート座標値, onClick: () => void): DivC {
    const root = div({ class: 接続点CSS }).setStyleCSS({
        position: "absolute",
        width: "0px",
        height: "0px",
        pointerEvents: "none"
    });
    root.addDivEventListener("mouseover", () => root.setStyleCSS({ opacity: "1" }));
    root.addDivEventListener("mouseout", () => root.setStyleCSS({ opacity: "" }));
    root.setViewportPositionByTransform(pos).child(
        svg({ width: 40, height: 40, viewBox: "0 0 40 40" })
            .setStyleCSS({
                position: "absolute",
                transform: "translate(-50%, -50%)",
                pointerEvents: "auto",
                cursor: "pointer"
            })
            .child(
                circle({
                    cx: 20,
                    cy: 20,
                    r: 7,
                    fill: "rgba(100, 201, 255, 0.8)",
                    stroke: "blue",
                    strokeWidth: 3
                })
                    .addSvgEventListener("pointerdown", event => event.stopPropagation())
                    .addSvgEventListener("click", onClick)
            )
    );
    return root;
}
