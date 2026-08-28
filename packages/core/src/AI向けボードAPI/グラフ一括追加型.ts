// グラフ (付箋N枚+接続M本) を1回の操作として追加するための指示と結果の型 (issue #6)。
// 付箋には呼び出し側が決める一時キーを付け、接続の端点は一時キーでも既存の付箋IDでもよい。
// 端点の解決は一時キーを先に探し、無ければ既存の付箋IDとして扱う (実在しなければ対象不在で
// 全体が失敗する)。実IDの発番はサービス側が行い、結果のcreatedIdsで一時キーとの対応を返す。

import type { 座標JSON, サイズJSON } from '../保存形式/最新版保存形式';
import type { 付箋コンテンツ表現 } from './付箋コンテンツ表現';
import type { ボード操作失敗 } from '../ボード操作/ボード操作結果';

export interface 追加する付箋の指示 {
    readonly key: string;
    readonly content: 付箋コンテンツ表現;
    readonly position?: 座標JSON;
    readonly size?: サイズJSON;
    readonly 背景色?: string;
}

export interface 追加する接続の指示 {
    readonly from: string;
    readonly to: string;
}

export interface グラフ一括追加の指示 {
    readonly expectedRevision: number;
    readonly notes: readonly 追加する付箋の指示[];
    readonly edges: readonly 追加する接続の指示[];
}

export type グラフ一括追加結果 =
    | { readonly kind: '成功'; readonly revision: number; readonly createdIds: Readonly<Record<string, string>> }
    | { readonly kind: '一時キー不正'; readonly 理由: string }
    | ボード操作失敗;
