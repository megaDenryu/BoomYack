// ボード編集コマンド1件を最新版ボードへ適用する純粋関数群 (issue #4)。
// 状態を変更せず新しいボードを返す。付箋削除時はその付箋を参照する矢印も一緒に削除する
// (参照先を失った矢印を残すとUIの接続解決が壊れるため)。

import type { 最新版ボードJSON, 最新版配置物JSON, 最新版付箋JSON, 最新版折れ線矢印JSON } from '../保存形式/最新版保存形式';
import type { ボード編集コマンド, 付箋を追加する, 付箋を更新する, 接続を追加する } from './ボード編集コマンド';
import type { ボード操作失敗 } from './ボード操作結果';
import { 新規付箋の位置を決める, 新規付箋の既定サイズ, 既定の付箋設定状態, 接続の端点を導出する } from './配置の既定値を決める';

export type 編集結果 =
    | { readonly kind: '成功'; readonly ボード: 最新版ボードJSON }
    | Extract<ボード操作失敗, { kind: '対象不在' }>;

function 配置物リストを差し替える(ボード: 最新版ボードJSON, 配置物リスト: readonly 最新版配置物JSON[]): 最新版ボードJSON {
    return { ...ボード, 配置物リスト };
}

function 付箋を探す(ボード: 最新版ボードJSON, 付箋ID: string): 最新版付箋JSON | undefined {
    return ボード.配置物リスト.find((x): x is 最新版付箋JSON => x.type === '付箋' && x.id === 付箋ID);
}

function 付箋を追加を適用する(ボード: 最新版ボードJSON, コマンド: 付箋を追加する): 編集結果 {
    const 新規付箋: 最新版付箋JSON = {
        type: '付箋',
        id: コマンド.付箋ID,
        position: コマンド.position ?? 新規付箋の位置を決める(ボード),
        size: コマンド.size ?? 新規付箋の既定サイズ,
        コンテンツ: コマンド.コンテンツ,
        設定状態: コマンド.設定状態 ?? 既定の付箋設定状態,
    };
    return { kind: '成功', ボード: 配置物リストを差し替える(ボード, [...ボード.配置物リスト, 新規付箋]) };
}

function 付箋を更新を適用する(ボード: 最新版ボードJSON, コマンド: 付箋を更新する): 編集結果 {
    const 対象 = 付箋を探す(ボード, コマンド.付箋ID);
    if (対象 === undefined) return { kind: '対象不在', 対象の種類: '付箋', 対象ID: コマンド.付箋ID };
    const 更新後: 最新版付箋JSON = {
        ...対象,
        コンテンツ: コマンド.コンテンツ ?? 対象.コンテンツ,
        設定状態: {
            背景色: コマンド.背景色 ?? 対象.設定状態.背景色,
            文字サイズ: コマンド.文字サイズ ?? 対象.設定状態.文字サイズ,
            文字色: コマンド.文字色 ?? 対象.設定状態.文字色,
        },
        position: コマンド.position ?? 対象.position,
        size: コマンド.size ?? 対象.size,
    };
    return { kind: '成功', ボード: 配置物リストを差し替える(ボード, ボード.配置物リスト.map(x => (x === 対象 ? 更新後 : x))) };
}

function 矢印が付箋を参照している(配置物: 最新版配置物JSON, 付箋ID: string): boolean {
    if (配置物.type === '付箋') return false;
    return 配置物.startRef?.配置物ID === 付箋ID || 配置物.endRef?.配置物ID === 付箋ID;
}

function 付箋を削除を適用する(ボード: 最新版ボードJSON, 付箋ID: string): 編集結果 {
    if (付箋を探す(ボード, 付箋ID) === undefined) return { kind: '対象不在', 対象の種類: '付箋', 対象ID: 付箋ID };
    const 残す配置物 = ボード.配置物リスト.filter(x => !(x.type === '付箋' && x.id === 付箋ID) && !矢印が付箋を参照している(x, 付箋ID));
    return { kind: '成功', ボード: 配置物リストを差し替える(ボード, 残す配置物) };
}

function 接続を追加を適用する(ボード: 最新版ボードJSON, コマンド: 接続を追加する): 編集結果 {
    const from = 付箋を探す(ボード, コマンド.from付箋ID);
    if (from === undefined) return { kind: '対象不在', 対象の種類: '付箋', 対象ID: コマンド.from付箋ID };
    const to = 付箋を探す(ボード, コマンド.to付箋ID);
    if (to === undefined) return { kind: '対象不在', 対象の種類: '付箋', 対象ID: コマンド.to付箋ID };
    const 端点 = 接続の端点を導出する(from, to);
    const 新規矢印: 最新版折れ線矢印JSON = {
        type: '折れ線矢印',
        id: コマンド.矢印ID,
        start: 端点.start,
        中点リスト: [],
        end: 端点.end,
        startRef: { 配置物ID: from.id, 接続位置: 端点.start位置 },
        endRef: { 配置物ID: to.id, 接続位置: 端点.end位置 },
    };
    return { kind: '成功', ボード: 配置物リストを差し替える(ボード, [...ボード.配置物リスト, 新規矢印]) };
}

function 接続を削除を適用する(ボード: 最新版ボードJSON, 矢印ID: string): 編集結果 {
    const 対象 = ボード.配置物リスト.find(x => x.type !== '付箋' && x.id === 矢印ID);
    if (対象 === undefined) return { kind: '対象不在', 対象の種類: '矢印', 対象ID: 矢印ID };
    return { kind: '成功', ボード: 配置物リストを差し替える(ボード, ボード.配置物リスト.filter(x => x !== 対象)) };
}

export function ボード編集コマンドを適用する(ボード: 最新版ボードJSON, コマンド: ボード編集コマンド): 編集結果 {
    switch (コマンド.kind) {
        case '付箋を追加する': return 付箋を追加を適用する(ボード, コマンド);
        case '付箋を更新する': return 付箋を更新を適用する(ボード, コマンド);
        case '付箋を削除する': return 付箋を削除を適用する(ボード, コマンド.付箋ID);
        case '接続を追加する': return 接続を追加を適用する(ボード, コマンド);
        case '接続を削除する': return 接続を削除を適用する(ボード, コマンド.矢印ID);
    }
}
