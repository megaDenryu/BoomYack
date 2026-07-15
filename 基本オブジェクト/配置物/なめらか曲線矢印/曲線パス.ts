import { PathC, Px2DVector, 配置物座標点 } from "SengenUI/index";
import { 曲線制御点 } from "./曲線制御点";

const 曲線色 = {
    通常: "#7cd3ff", 未選択ホバー: "#2d7a99",
    選択中: "#94ff7f", 選択中ホバー: "#5a9558",
};

abstract class ベジェ曲線パス extends PathC {
    public 曲線を設定する(始点: 配置物座標点, 終点: 配置物座標点,
        中間点リスト: readonly 配置物座標点[]): this {
        const 区間リスト = 曲線制御点.区間リストを計算する(始点, 終点, 中間点リスト);
        const start = 始点.toビューポート座標値();
        this.buildPath(builder => {
            builder.moveTo(start.x.値, start.y.値);
            区間リスト.forEach(区間 => {
                const cp1 = 区間.始点側制御点.toビューポート座標値();
                const cp2 = 区間.終点側制御点.toビューポート座標値();
                const end = 区間.終点.toビューポート座標値();
                builder.curveTo(cp1.x.値, cp1.y.値, cp2.x.値, cp2.y.値, end.x.値, end.y.値);
            });
        });
        return this;
    }
}

export class 曲線表示パス extends ベジェ曲線パス {
    private _選択中 = false;
    private _ホバー中 = false;

    public constructor() {
        super({ fill: "none", stroke: 曲線色.通常, strokeWidth: 3, strokeLinecap: "round" });
        this.setStyleCSS({ pointerEvents: "none" });
    }

    public 選択状態を設定する(value: boolean): void { this._選択中 = value; this._色を反映する(); }
    public ホバー状態を設定する(value: boolean): void { this._ホバー中 = value; this._色を反映する(); }
    private _色を反映する(): void {
        const color = this._選択中
            ? (this._ホバー中 ? 曲線色.選択中ホバー : 曲線色.選択中)
            : (this._ホバー中 ? 曲線色.未選択ホバー : 曲線色.通常);
        this.setStroke(color, 3);
    }
}

export class 曲線操作パス extends ベジェ曲線パス {
    public constructor() {
        super({ fill: "none", stroke: "transparent", strokeWidth: 20, strokeLinecap: "round" });
        this.setStyleCSS({ pointerEvents: "stroke", cursor: "pointer" });
    }

    public イベントのローカル座標(e: MouseEvent): Px2DVector {
        const path = this._svgDom.element as SVGPathElement;
        const matrix = path.getScreenCTM();
        if (matrix === null) throw new Error("曲線操作パスの画面変換行列を取得できません");
        const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
        return Px2DVector.fromNumbers(point.x, point.y);
    }
}
