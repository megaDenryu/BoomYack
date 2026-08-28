// UIの全量保存 (キャンバス全体のJSONをそのまま保存する既存の保存方式) を、
// revision照合付きの保存へ変換する準備の純粋関数 (issue #5 のUI対応)。
// 受け取った生データを版判別・移行してから、idと現在のrevisionを正典側の値で上書きする。

import type { 最新版ボードJSON } from '../保存形式/最新版保存形式';
import { 保存JSONから最新版ボードを読み込む } from '../保存形式/保存JSONから読み込む';

export type 全量保存の準備結果 =
    | { readonly kind: '成功'; readonly ボード: 最新版ボードJSON }
    | { readonly kind: '保存データ不正'; readonly 理由: string };

export function 全量保存の内容を準備する(ボードID: string, revision: number, 生データ: unknown): 全量保存の準備結果 {
    const 読み込み = 保存JSONから最新版ボードを読み込む(生データ);
    if (読み込み.kind === '保存データ不正') return 読み込み;
    return { kind: '成功', ボード: { ...読み込み.ボード, id: ボードID, revision } };
}
