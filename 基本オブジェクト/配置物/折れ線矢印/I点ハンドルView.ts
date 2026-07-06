import { Degree角度, 配置物座標点 } from "SengenUI/index";

export interface I点ハンドルView {
    回転角度を設定(angle: Degree角度): I点ハンドルView;
    位置を設定(pos: 配置物座標点): I点ハンドルView;
}
