import { 描画座標点 } from "SengenUI/index";

import { I配置物集約 } from "../../I配置物";
import { 折れ線矢印VM, 折れ線矢印集約 } from "../../配置物";
import { なめらか曲線矢印VM } from "../../配置物/なめらか曲線矢印/なめらか曲線矢印VM";
import { なめらか曲線矢印集約 } from "../../配置物/なめらか曲線矢印/なめらか曲線矢印集約";
import { 付箋集約 } from "../../配置物/付箋2/付箋集約";

export type GraphEvent =
    | { type: "ADDED"; item: I配置物集約 }
    | { type: "REMOVED"; item: I配置物集約 }
    | { type: "CLEARED" }
    | { type: "UPDATED" };

export interface ICanvasItemFactory {
    create付箋(pos: 描画座標点, text?: string, id?: string): 付箋集約<描画座標点>;
    createタイトル付き付箋(pos: 描画座標点, id?: string): 付箋集約<描画座標点>;
    create札参照付箋(pos: 描画座標点, 札ID: string, id?: string): 付箋集約<描画座標点>;
    create折れ線矢印(vm: 折れ線矢印VM<描画座標点>): 折れ線矢印集約<描画座標点>;
    createなめらか曲線矢印(vm: なめらか曲線矢印VM<描画座標点>): なめらか曲線矢印集約<描画座標点>;
}
