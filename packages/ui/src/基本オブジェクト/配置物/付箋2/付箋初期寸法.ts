import { Px2DVector, Px長さ } from "SengenUI/index";
import type { 付箋コンテンツデータ } from "../../描画キャンバス/付箋コンテンツデータ";

export const 自由テキスト付箋初期寸法 = {
    サイズ: Px2DVector.fromNumbers(200, 52),
    最小高さ: new Px長さ(52),
} as const;

export const タイトル付き付箋初期寸法 = {
    サイズ: Px2DVector.fromNumbers(220, 70),
    最小高さ: new Px長さ(70),
} as const;

export const 札参照付箋初期寸法 = {
    サイズ: Px2DVector.fromNumbers(220, 90),
    最小高さ: new Px長さ(90),
} as const;

export function コンテンツ種別の最小高さを取得する(コンテンツ: 付箋コンテンツデータ): Px長さ {
    switch (コンテンツ.種別) {
        case "自由テキスト": return 自由テキスト付箋初期寸法.最小高さ;
        case "タイトル付き": return タイトル付き付箋初期寸法.最小高さ;
        case "札参照": return 札参照付箋初期寸法.最小高さ;
    }
}
