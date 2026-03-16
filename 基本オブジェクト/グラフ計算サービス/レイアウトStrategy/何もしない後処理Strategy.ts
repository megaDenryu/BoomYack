// ========================================
// Strategy実装: 何もしない後処理
// ========================================

import { IDMap } from "TypeScriptBenriKakuchou/DDDBase/IDBase";
import { 付箋ID } from "BoomYack/基本オブジェクト/ID";
import { Iグラフ配置先 } from "BoomYack/基本オブジェクト/配置物リポジトリ";
import { ノード付箋ペア } from "../ValueObjects/ノード付箋ペア";
import { I後処理位置調整Strategy } from "./IStrategy";

export class 何もしない後処理Strategy implements I後処理位置調整Strategy {
    public 実行(_pairMap: IDMap<付箋ID, ノード付箋ペア>, _配置先: Iグラフ配置先): void {
        // 何もしない
    }
}