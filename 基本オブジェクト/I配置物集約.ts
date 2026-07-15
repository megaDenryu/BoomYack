import { Drag中値, LV2HtmlComponentBase, Px2DVector, 描画座標点 } from "SengenUI/index";
import { 接続点 } from "./配置物/矢印接続可能なもの/接続点";
import { 配置物データ } from "./描画キャンバス/データクラス";

export type 配置物type = "折れ線矢印" | "まっすぐ矢印" | "なめらか曲線矢印" | "付箋" | "自動リサイズ付箋" | "グループミニキャンバス";

export interface Iドラッグ移動可能 {
    ドラッグ移動処理(e: Drag中値): this;
}

export interface Iシリアライズ可能配置物<T extends 配置物データ = 配置物データ> {
    toシリアライズデータ(): T;
}

export interface I選択可能配置物 {
    選択された時の処理(): void;
    選択解除された時の処理(): void;
    ホバーされたときの処理(): void;
    ホバー解除されたときの処理(): void;
    接続点を表示非表示切り替え?(表示する: boolean): void;
}

export interface I衝突判定可能 {
    get衝突判定用矩形(): { 位置: 描画座標点; サイズ: Px2DVector };
}

export interface 接触判定可能な点 {
    判定(pos: Px2DVector): boolean;
    描画座標点: 描画座標点;
}

/** 接触判定システムへの登録先。instanceof分岐を各配置物側に閉じ込めるためのポリモーフィズム口 */
export interface I接触点登録先 {
    add配置物(node: 接触判定可能な点): void;
    add接続点リスト(接続点リスト: Iterable<接続点<any>>): void;
}

export interface I配置物集約 extends I選択可能配置物, Iシリアライズ可能配置物, I衝突判定可能 {
    type: 配置物type;
    readonly view: LV2HtmlComponentBase
    /** IDの生文字列。異種IDMapを横断検索するためのエスケープハッチ（IDMapのhasString()と組み合わせる） */
    readonly idString: string;
    再描画(): void;
    選択状態のzIndexにする(): void;
    通常状態のzIndexにする(): void;
    /** 接触判定システムへ自身の判定対象を登録する。型分岐をここに閉じ込める */
    接触判定対象を登録する(target: I接触点登録先): void;
    /** ドラッグ移動対象を収集する。付箋はviewを、矢印は点ハンドルリストを返す。除外するviewを指定可能 */
    ドラッグ移動対象を収集する(除外view?: LV2HtmlComponentBase): Iドラッグ移動可能[];
}
