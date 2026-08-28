import { 描画座標点 } from "SengenUI/index";

import { I接続点, 接触判定可能な点 } from "../../I配置物";
import { 無分割管理 } from "../../接触点を教えてくれる人/無分割管理";
import { 接続点 } from "../../配置物/矢印接続可能なもの/接続点";

export class Canvas接触点管理 {
    private 管理 = new 無分割管理<描画座標点>();

    public リセットする(): void { this.管理 = new 無分割管理(); }
    public add配置物(item: 接触判定可能な点): void { this.管理.add配置物(item); }
    public add接続点(point: 接続点<描画座標点>): void { this.管理.add接続点(point); }
    public add配置物リスト(items: Iterable<接触判定可能な点>): void { this.管理.add配置物リスト(items); }
    public add接続点リスト(points: Iterable<接続点<描画座標点>>): void { this.管理.add接続点リスト(points); }
    public 接触点を取得(pos: 描画座標点): 接触判定可能な点 | null { return this.管理.接触点を取得(pos); }
    public 接続点を取得(pos: 描画座標点): I接続点<描画座標点> | null { return this.管理.接続点を取得(pos); }
    public 未接続ハンドルを接続する(point: 接続点<描画座標点>): void {
        this.管理.未接続の点ハンドルを接続点と接続をtryする(point);
    }
}
