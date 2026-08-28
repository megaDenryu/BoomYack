import { Px2DVector, Px長さ, 描画座標点 } from "SengenUI/index";
import { I配置物集約 } from "../I配置物";
import { CanvasGraphModel } from "../描画キャンバス/描画キャンバスView分解/CanvasGraphModel";
import { 付箋集約 } from "../配置物/付箋2/付箋集約";

export const AI続き付箋を作る = (
    model: CanvasGraphModel,
    起点: 付箋集約<描画座標点>,
    text: string
): I配置物集約[] => {
    const position = 起点.描画座標点.plus(
        new Px2DVector(new Px長さ(300), new Px長さ(0))
    );
    const note = model.描画座標点でadd付箋(position, text);
    return [note, 起点.別の付箋へ矢印を作る(note)];
};

export const AI分解付箋を作る = (
    model: CanvasGraphModel,
    親: 付箋集約<描画座標点>,
    texts: string[]
): I配置物集約[] => texts.flatMap((text, index) => {
    const position = 親.描画座標点.plus(
        new Px2DVector(new Px長さ(300), new Px長さ(150 + index * 200))
    );
    const note = model.描画座標点でadd付箋(position, text);
    return [note, 親.別の付箋へ矢印を作る(note)];
});
