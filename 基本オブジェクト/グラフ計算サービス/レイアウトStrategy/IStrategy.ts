import { 描画座標点 } from "SengenUI/index";
import { IDMap } from "TypeScriptBenriKakuchou/DDDBase/IDBase";
import { 付箋ID } from "BoomYack/基本オブジェクト/ID";
import { Iグラフ配置先 } from "BoomYack/基本オブジェクト/配置物リポジトリ";
import { テキスト用グラフノード, 付箋text } from "BoomYack/基本オブジェクト/描画キャンバス/配置物グラフ/テキスト化情報";
import { ノード付箋ペア } from "../ValueObjects/ノード付箋ペア";


export interface I前処理位置調整Strategy {
    ノード位置を計算(node: テキスト用グラフノード<付箋text>): 描画座標点;
}

export interface I後処理位置調整Strategy {
    実行(pairMap: IDMap<付箋ID, ノード付箋ペア>, 配置先: Iグラフ配置先): void;
}