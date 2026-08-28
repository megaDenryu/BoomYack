import { Degree角度, Px長さ, 配置物座標点 } from "SengenUI/index";

export class 始点中心線分情報 {
    public readonly 始点: 配置物座標点;
    public readonly length: Px長さ;
    public readonly angle: Degree角度;

    constructor(始点: 配置物座標点, length: Px長さ, angle: Degree角度) {
        this.始点 = 始点;
        this.length = length;
        this.angle = angle;
    }

    public static 計算(始点pos: 配置物座標点, 終点pos: 配置物座標点): 始点中心線分情報 {
        const delta = 終点pos.px2DVector.minus(始点pos.px2DVector);
        const length = new Px長さ(Math.sqrt(delta.dot(delta)));
        const angle = new Degree角度(Math.atan2(delta.y.値, delta.x.値) * 180 / Math.PI);
        return new 始点中心線分情報(始点pos, length, angle);
    }
}
