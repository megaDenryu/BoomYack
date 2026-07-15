import { Canvas座標Base, 描画座標点, 配置物座標点 } from "SengenUI/index";
import { I接続点親情報, 接続点 } from "./配置物/矢印接続可能なもの/接続点";
import { 接触判定可能な点 } from "./I配置物集約";
import { I点ハンドル } from "./I矢印共通";
import { 接続参照データ, 接続点位置 } from "./描画キャンバス/データクラス";
import { 付箋ID } from "./ID";

export interface I接触点を教えてくれる人<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> {
    接触点を取得(pos: 描画座標点): 接触判定可能な点 | null;
    接続点を取得(pos: 描画座標点): I接続点<座標点T> | null;
    未接続の点ハンドルを接続点と接続をtryする(接続点: 接続点<座標点T>): void;

    add配置物(node: 接触判定可能な点): void;
    add接続点(接続点: 接続点<座標点T>): void;
}

export interface リスト配置可能<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> {
    add配置物リスト(nodes: Iterable<接触判定可能な点>): void;
    add接続点リスト(接続点リスト: Iterable<接続点<座標点T>>): void;
}

export interface I接続点<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> {
    接続(点ハンドル: I点ハンドル<座標点T>): void;
    接続解除(点ハンドル: I点ハンドル<座標点T>): void;
    親interface: I接続点親情報<座標点T>;
    /** この接続点の親配置物ID */
    get 親配置物ID(): 付箋ID;
    /** この接続点の位置（上/下/左/右） */
    get 接続位置(): 接続点位置;
    /** 接続参照データを生成 */
    get接続参照データ(): 接続参照データ;
}
