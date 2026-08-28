// AI向けの読み取り型 (issue #6)。保存JSONそのものは返さず、付箋=ノード・接続=エッジの
// 意味モデルとrevisionだけを返す。配置付き要約は座標・サイズを加えた版で、付箋の空間的な
// まとまりを読ませたい場面で使う。

import type { 座標JSON, サイズJSON } from '../保存形式/最新版保存形式';
import type { 付箋コンテンツ表現 } from './付箋コンテンツ表現';

export interface 付箋要約 {
    readonly id: string;
    readonly content: 付箋コンテンツ表現;
    readonly 背景色: string;
}

export interface 接続要約 {
    readonly 矢印ID: string;
    readonly from: string;
    readonly to: string;
}

export interface ボード要約 {
    readonly id: string;
    readonly name: string;
    readonly updatedAt: string;
    readonly revision: number;
    readonly 付箋一覧: readonly 付箋要約[];
    readonly 接続一覧: readonly 接続要約[];
    readonly 未接続矢印数: number;
}

export interface 配置付き付箋要約 extends 付箋要約 {
    readonly position: 座標JSON;
    readonly size: サイズJSON;
}

export interface 配置付きボード要約 extends Omit<ボード要約, '付箋一覧'> {
    readonly 付箋一覧: readonly 配置付き付箋要約[];
}
