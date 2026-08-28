import { Canvas座標Base, I描画空間, 配置物座標点 } from "SengenUI/index";

import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { I矢印生成先 } from "../../配置物リポジトリ";

export interface 矢印接続可能なもの依存関係<
    座標点T extends Canvas座標Base<座標点T> & 配置物座標点
> {
    i矢印生成先: I矢印生成先<座標点T>;
    i描画空間: I描画空間;
    i配置物選択機能集約: I配置物選択機能集約;
}
