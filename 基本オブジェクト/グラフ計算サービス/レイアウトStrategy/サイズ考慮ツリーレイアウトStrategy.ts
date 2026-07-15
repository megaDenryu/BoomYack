import { IDMap } from "TypeScriptBenriKakuchou/DDDBase/IDBase";

import { 付箋ID } from "BoomYack/基本オブジェクト/ID";
import { Iグラフ配置先 } from "BoomYack/基本オブジェクト/配置物リポジトリ";
import { node付箋pair } from "../ValueObjects/node付箋pair";
import { レイアウト設定 } from "../ValueObjects/レイアウト設定";
import { I後処理位置調整Strategy } from "./IStrategy";
import { ツリーレイアウト計算 } from "./ツリーレイアウト計算";

export class サイズ考慮ツリーレイアウトStrategy implements I後処理位置調整Strategy {
    public constructor(private readonly 設定: レイアウト設定) {}

    public 実行(pairMap: IDMap<付箋ID, node付箋pair>, 配置先: Iグラフ配置先): void {
        new ツリーレイアウト計算(pairMap, this.設定, 配置先).実行する();
    }
}
