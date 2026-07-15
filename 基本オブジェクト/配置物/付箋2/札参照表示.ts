import { div, DivC } from "SengenUI/index";

import { Fudaba札バッジ } from "../../Fudaba連携/Fudaba札バッジ";
import { 種別に対応する配色を取得する, 状態に対応する配色を取得する } from "../../Fudaba連携/Fudaba札配色";
import { 札参照タイトル, 札参照バッジ行, 札参照担当者, 札参照案内文 } from "../../Fudaba連携/style.css";
import { 札参照表示状態 } from "./札参照コンテンツ仕様";

export const 札参照表示を更新する = (
    root: DivC,
    state: 札参照表示状態,
    札ID: string,
    onHeightChange: (height: number) => void
): void => {
    root.clearChildren();
    if (state.種別 === "読込中") {
        root.child(div({ class: 札参照案内文, text: "Fudaba札を読み込み中..." }));
    } else if (state.種別 === "参照解決不可") {
        root.childs([
            div({ class: 札参照タイトル, text: `Fudaba札#${札ID}` }),
            div({ class: 札参照案内文, text: state.理由 })
        ]);
    } else {
        const 札 = state.札;
        root.childs([
            div({ class: 札参照タイトル, text: 札.タイトル }),
            div({ class: 札参照バッジ行 }).childs([
                new Fudaba札バッジ(札.種別, 種別に対応する配色を取得する(札.種別)),
                new Fudaba札バッジ(札.状態, 状態に対応する配色を取得する(札.状態))
            ]),
            div({ class: 札参照担当者, text: 札.担当者 !== null ? `担当: ${札.担当者}` : "担当者未割当" })
        ]);
    }
    setTimeout(() => onHeightChange(root.getBoundingClientRect().height), 0);
};
