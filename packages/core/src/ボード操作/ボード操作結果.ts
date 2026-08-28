// ボード操作サービスの各操作が返す結果の判別共用体 (issue #4・#5)。
// 失敗は握り潰さず、何が・なぜ失敗したかを型で運ぶ。revision競合は楽観ロックの検出結果で、
// 受け取った側は最新を読み直してから操作をやり直す。

import type { 最新版ボードJSON } from '../保存形式/最新版保存形式';

export type ボード操作失敗 =
    | { readonly kind: 'ボード不在'; readonly ボードID: string }
    | { readonly kind: '保存データ不正'; readonly ボードID: string; readonly 理由: string }
    | { readonly kind: '対象不在'; readonly 対象の種類: '付箋' | '矢印'; readonly 対象ID: string }
    | { readonly kind: 'revision競合'; readonly ボードID: string; readonly expectedRevision: number; readonly 現在のrevision: number };

export type ボード操作成功 = { readonly kind: '成功'; readonly ボード: 最新版ボードJSON };

export type ボード操作結果 = ボード操作成功 | ボード操作失敗;

export type ボード削除結果 =
    | { readonly kind: '成功' }
    | Exclude<ボード操作失敗, { readonly kind: '対象不在' }>;
