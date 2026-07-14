import { Px2DVector, 配置物座標点 } from "SengenUI/index";

/**
 * なめらか曲線矢印の3次ベジェ制御点。始点/終点だけから自動計算する
 * (設計2026-07-14: 「制御点は自動計算でよい。過剰実装しない」方針)。
 *
 * 始点と終点の差分が大きい軸(dxとdyのうち絶対値が大きい方)へ向けて
 * 制御点を各端点から半分だけ押し出すことで、向きを問わず滑らかなS字カーブになる。
 * React Flow等のノードエディタで一般的な「デフォルトベジェ」と同じ考え方。
 */
export class 曲線制御点 {
    public readonly 始点側: 配置物座標点;
    public readonly 終点側: 配置物座標点;

    private constructor(始点側: 配置物座標点, 終点側: 配置物座標点) {
        this.始点側 = 始点側;
        this.終点側 = 終点側;
    }

    public static 計算する(始点: 配置物座標点, 終点: 配置物座標点): 曲線制御点 {
        const dx = 終点.px2DVector.x.値 - 始点.px2DVector.x.値;
        const dy = 終点.px2DVector.y.値 - 始点.px2DVector.y.値;

        const 主軸は水平か = Math.abs(dx) >= Math.abs(dy);
        const 押し出し量 = (主軸は水平か ? dx : dy) * 0.5;

        const 始点側 = 主軸は水平か
            ? 始点.plus(Px2DVector.fromNumbers(押し出し量, 0))
            : 始点.plus(Px2DVector.fromNumbers(0, 押し出し量));
        const 終点側 = 主軸は水平か
            ? 終点.plus(Px2DVector.fromNumbers(-押し出し量, 0))
            : 終点.plus(Px2DVector.fromNumbers(0, -押し出し量));

        return new 曲線制御点(始点側, 終点側);
    }
}
