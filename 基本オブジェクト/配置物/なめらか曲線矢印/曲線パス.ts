import { PathC, 配置物座標点 } from "SengenUI/index";
import { 曲線制御点 } from "./曲線制御点";

const 曲線ストローク色 = {
    通常: "#7cd3ff",
    選択中: "#94ff7f"
};

/**
 * なめらか曲線矢印のベジェ曲線を描くLV1拡張(SengenUIガイド: 後から動的更新が要る
 * 素部品はフィールド保持せずLV1拡張クラスへ昇格させる方針に従う)。
 */
export class 曲線パス extends PathC {
    public constructor() {
        super({
            fill: "none",
            stroke: 曲線ストローク色.通常,
            strokeWidth: 3,
            strokeLinecap: "round"
        });
        // 祖先のdivがpointerEvents:"none"でも、この要素自身にautoを指定すれば
        // ストローク上のポインタ操作(右クリックでの中間点ハンドル生成)を受け取れる。
        this.setStyleCSS({ pointerEvents: "auto" });
    }

    /** 始点/終点(配置物座標点)からベジェ曲線を再計算してpathへ反映する。中間点ハンドルがあればその形状を優先する */
    public 曲線を設定する(始点: 配置物座標点, 終点: 配置物座標点, 中間点: 配置物座標点 | null): this {
        const 制御点 = 曲線制御点.計算する(始点, 終点, 中間点);
        const 始点px = 始点.toビューポート座標値();
        const 終点px = 終点.toビューポート座標値();
        const 始点側px = 制御点.始点側.toビューポート座標値();
        const 終点側px = 制御点.終点側.toビューポート座標値();

        this.buildPath((builder) => {
            builder
                .moveTo(始点px.x.値, 始点px.y.値)
                .curveTo(始点側px.x.値, 始点側px.y.値, 終点側px.x.値, 終点側px.y.値, 終点px.x.値, 終点px.y.値);
        });
        return this;
    }

    public 選択色にする(): this {
        this.setStroke(曲線ストローク色.選択中, 3);
        return this;
    }

    public 通常色にする(): this {
        this.setStroke(曲線ストローク色.通常, 3);
        return this;
    }
}
