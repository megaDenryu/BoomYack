import { Canvas座標Base, Drag中値, I配線可能, Px2DVector, 配置物座標点, 描画座標点 } from "SengenUI/index";
import { I点state } from "./配置物/折れ線矢印/折れ線矢印state";
import { I点ハンドルView } from "./配置物/折れ線矢印/折れ線矢印View";
import { I配置物集約, Iドラッグ移動可能 } from "./I配置物集約";
import { 付箋ID } from "./ID";

/**
 * 始点と終点を持つ矢印系配置物の共通契約。
 * 折れ線矢印(中点付き)となめらか曲線矢印(中点なし)の両方が実装する。
 * 接続点・付箋リサイズ追従の仕組み(接続点.ts / 矢印接続可能なもの.ts / カスケード削除)は
 * この共通契約だけを要求するよう一般化してあり、矢印の種類が増えても書き換え不要。
 */
export interface I矢印集約配線 {
    onハンドルドラッグ開始(): void;
    onハンドルドラッグ終了(): void;
}

export interface I始終点矢印集約<座標点T extends Canvas座標Base<座標点T> & 配置物座標点>
    extends I配置物集約, I配線可能<I矢印集約配線> {
    type: "折れ線矢印" | "なめらか曲線矢印";
    始点と終点の付箋の接続点を最短のものに切り替える(): void;
    /** 始点に接続している付箋のID。未接続のnull */
    get始点接続付箋ID(): 付箋ID | null;
    /** 終点に接続している付箋のID。未接続のnull */
    get終点接続付箋ID(): 付箋ID | null;
    ハンドルドラッグ開始を通知する(): void;
    ハンドルドラッグ終了を通知する(): void;
}

/**
 * I配置物集約をtype判別子でI始終点矢印集約(折れ線矢印/なめらか曲線矢印の共通契約)へ絞り込む型ガード。
 * カスケード削除・グラフ走査など「矢印の種類を問わず始点/終点接続だけ見たい」処理で使う。
 */
export function is始終点矢印集約<座標点T extends Canvas座標Base<座標点T> & 配置物座標点>(item: I配置物集約): item is I始終点矢印集約<座標点T> {
    return item.type === "折れ線矢印" || item.type === "なめらか曲線矢印";
}

export interface I点と線のリポジトリ<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> {
    get点ハンドルByIndex(index: number): I点ハンドル<座標点T> | null;
    get線分ハンドルByIndex(index: number): I線分ハンドル<座標点T> | null;
    insert中点(insertIndex: number, pos: 座標点T): this;
    delete中点(index: number): this;
}

export interface I点ハンドル<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> extends Iドラッグ移動可能 {
    ドラッグ移動処理(e: Drag中値): this;
    render(): this;
    移動終了(e: Drag中値): void;
    move(diff: Px2DVector): this;
    移動開始(e: Drag中値): void;
    setPosition(pos: 配置物座標点): this
    state: I点state<座標点T>;
    view: I点ハンドルView;
    get next線分ハンドル(): I線分ハンドル<座標点T> | null;
    get prev線分ハンドル(): I線分ハンドル<座標点T> | null;
    get 描画座標点(): 描画座標点;
    index: number;
    親の折れ線矢印集約: I始終点矢印集約<座標点T>;
}

export interface I接続点と接続可能 {

}

export interface I線分ハンドル<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> extends Iドラッグ移動可能 {
    ドラッグ移動処理(e: Drag中値): this;
    render(): this;
    set親の集約(親: I点と線のリポジトリ<座標点T>): void;
    set線分の位置(位置: number): void;
}
