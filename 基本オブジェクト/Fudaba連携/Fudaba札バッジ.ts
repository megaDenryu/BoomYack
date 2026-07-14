import { SpanC } from "SengenUI/index";

import { fudaba札バッジ } from "./style.css";

/**
 * 種別バッジ・状態バッジで共通して使う、ラベル+背景色を表示するだけの小さなLV1拡張。
 * 背景色は種別/状態ごとに動的なため、色そのものはインスタンスごとにsetStyleCSSで与える。
 */
export class Fudaba札バッジ extends SpanC {
    public constructor(ラベル: string, 背景色: string) {
        super({ class: fudaba札バッジ, text: ラベル });
        this.setStyleCSS({ backgroundColor: 背景色 });
    }
}
