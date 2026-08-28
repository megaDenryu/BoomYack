import { DivC, div } from "SengenUI/index";

import { Fudaba札DTO } from "./Fudaba札DTO";
import { Fudaba札バッジ } from "./Fudaba札バッジ";
import { 種別に対応する配色を取得する, 状態に対応する配色を取得する } from "./Fudaba札配色";
import { 検索結果行, 検索結果行タイトル, 検索結果行バッジ行 } from "./style.css";

/**
 * 検索ダイアログの一覧に並ぶ1件分の行。動的に生成される項目自体を独立したLV1拡張へ
 * 切り出すSengenUIガイド第4条の方針に従い、親(Fudaba札検索ダイアログ)は
 * 「引数を受けてDOMツリーを返す」私有メソッドを持たない。
 */
export class Fudaba札検索結果行 extends DivC {
    public constructor(札: Fudaba札DTO, on選択: (札ID: string) => void) {
        super({ class: 検索結果行 });
        this.childs([
            div({ class: 検索結果行タイトル, text: 札.タイトル || `(無題 #${札.id})` }),
            div({ class: 検索結果行バッジ行 }).childs([
                new Fudaba札バッジ(札.種別, 種別に対応する配色を取得する(札.種別)),
                new Fudaba札バッジ(札.状態, 状態に対応する配色を取得する(札.状態))
            ])
        ]);
        this.onClick(() => { on選択(String(札.id)); });
    }
}
