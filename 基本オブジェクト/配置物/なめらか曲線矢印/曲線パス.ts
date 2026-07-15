import { PathC, 配置物座標点 } from "SengenUI/index";
import { 曲線制御点 } from "./曲線制御点";

const 曲線色 = {
    通常: "#7cd3ff", 未選択ホバー: "#2d7a99",
    選択中: "#94ff7f", 選択中ホバー: "#5a9558",
};

abstract class ベジェ曲線パス extends PathC {
    public 曲線を設定する(始点: 配置物座標点, 終点: 配置物座標点,
        中間点: 配置物座標点 | null): this {
        const 制御点 = 曲線制御点.計算する(始点, 終点, 中間点);
        const start = 始点.toビューポート座標値();
        const end = 終点.toビューポート座標値();
        const startControl = 制御点.始点側.toビューポート座標値();
        const endControl = 制御点.終点側.toビューポート座標値();
        this.buildPath(builder => builder.moveTo(start.x.値, start.y.値).curveTo(
            startControl.x.値, startControl.y.値, endControl.x.値, endControl.y.値,
            end.x.値, end.y.値));
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
}
