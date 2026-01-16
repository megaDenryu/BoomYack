// ========================================
// Strategy実装: 何もしない後処理
// ========================================

import { IDMap } from "TypeScriptBenriKakuchou/DDDBase/IDBase";
import { 付箋ID } from "BoomYack/基本オブジェクト/ID";
import { CanvasGraphModel } from "BoomYack/基本オブジェクト/描画キャンバス/描画キャンバスView分解/CanvasGraphModel";
import { node付箋pair } from "../ValueObjects/node付箋pair";
import { I後処理位置調整Strategy } from "./IStrategy";

export class 何もしない後処理Strategy implements I後処理位置調整Strategy {
    public 実行(pairMap: IDMap<付箋ID, node付箋pair>, model: CanvasGraphModel): void {
        // 何もしない
    }
}