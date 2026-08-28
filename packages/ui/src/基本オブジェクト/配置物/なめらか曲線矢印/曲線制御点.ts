import { Degree角度, Px2DVector, 配置物座標点 } from "SengenUI/index";
import { 始点中心線分情報 } from "../折れ線矢印/始点中心線分情報";

export interface 曲線区間 {
    readonly 始点: 配置物座標点;
    readonly 始点側制御点: 配置物座標点;
    readonly 終点側制御点: 配置物座標点;
    readonly 終点: 配置物座標点;
}

export class 曲線制御点 {
    public static 区間リストを計算する(始点: 配置物座標点, 終点: 配置物座標点,
        中間点リスト: readonly 配置物座標点[]): 曲線区間[] {
        if (中間点リスト.length === 0) return [this._自動区間(始点, 終点)];
        if (中間点リスト.length === 1) return this._単一中間点区間(始点, 中間点リスト[0], 終点);
        const 点列 = [始点, ...中間点リスト, 終点];
        return 点列.slice(0, -1).map((現在, index) => {
            const 前 = 点列[index - 1] ?? 現在;
            const 次 = 点列[index + 1];
            const 次の次 = 点列[index + 2] ?? 次;
            return {
                始点: 現在,
                始点側制御点: 現在.plus(次.px2DVector.minus(前.px2DVector).times(1 / 6)),
                終点側制御点: 次.plus(現在.px2DVector.minus(次の次.px2DVector).times(1 / 6)),
                終点: 次,
            };
        });
    }

    public static 終点の接線角度を計算する(始点: 配置物座標点, 終点: 配置物座標点,
        中間点リスト: readonly 配置物座標点[]): Degree角度 {
        const 区間 = this.区間リストを計算する(始点, 終点, 中間点リスト).at(-1);
        if (区間 === undefined) throw new Error("曲線区間が存在しません");
        return 始点中心線分情報.計算(区間.終点側制御点, 区間.終点).angle;
    }

    private static _自動区間(始点: 配置物座標点, 終点: 配置物座標点): 曲線区間 {
        const dx = 終点.px2DVector.x.値 - 始点.px2DVector.x.値;
        const dy = 終点.px2DVector.y.値 - 始点.px2DVector.y.値;
        const 水平 = Math.abs(dx) >= Math.abs(dy);
        const amount = (水平 ? dx : dy) * 0.5;
        const offset = 水平 ? Px2DVector.fromNumbers(amount, 0) : Px2DVector.fromNumbers(0, amount);
        return { 始点, 始点側制御点: 始点.plus(offset), 終点側制御点: 終点.plus(offset.times(-1)), 終点 };
    }

    private static _単一中間点区間(始点: 配置物座標点, 中間点: 配置物座標点,
        終点: 配置物座標点): 曲線区間[] {
        const 両端の中点 = 始点.px2DVector.plus(終点.px2DVector).times(0.5);
        const 二次制御点 = 中間点.px2DVector.times(2).minus(両端の中点);
        const cp1 = 始点.plus(二次制御点.minus(始点.px2DVector).times(2 / 3));
        const cp2 = 終点.plus(二次制御点.minus(終点.px2DVector).times(2 / 3));
        const p01 = 始点.newFromPx2DVector(始点.px2DVector.plus(cp1.px2DVector).times(0.5));
        const p12 = 始点.newFromPx2DVector(cp1.px2DVector.plus(cp2.px2DVector).times(0.5));
        const p23 = 始点.newFromPx2DVector(cp2.px2DVector.plus(終点.px2DVector).times(0.5));
        const p012 = 始点.newFromPx2DVector(p01.px2DVector.plus(p12.px2DVector).times(0.5));
        const p123 = 始点.newFromPx2DVector(p12.px2DVector.plus(p23.px2DVector).times(0.5));
        return [
            { 始点, 始点側制御点: p01, 終点側制御点: p012, 終点: 中間点 },
            { 始点: 中間点, 始点側制御点: p123, 終点側制御点: p23, 終点 },
        ];
    }
}
