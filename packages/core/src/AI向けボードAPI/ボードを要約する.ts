// 最新版ボードJSONをAI向けの要約へ射影する純粋関数 (issue #6)。
// 矢印は両端が接続参照を持つものだけを接続として数え、それ以外は未接続矢印数へ集計する。

import type { 最新版ボードJSON, 最新版付箋JSON } from '../保存形式/最新版保存形式';
import { 保存形式のコンテンツを表現へ変換する } from './付箋コンテンツ表現';
import type { ボード要約, 配置付きボード要約, 接続要約, 付箋要約, 配置付き付箋要約 } from './ボード要約型';

function is付箋(x: 最新版ボードJSON['配置物リスト'][number]): x is 最新版付箋JSON {
    return x.type === '付箋';
}

function 付箋を要約する(付箋: 最新版付箋JSON): 付箋要約 {
    return {
        id: 付箋.id,
        content: 保存形式のコンテンツを表現へ変換する(付箋.コンテンツ),
        背景色: 付箋.設定状態.背景色,
    };
}

function 接続と未接続数を集計する(ボード: 最新版ボードJSON): { 接続一覧: 接続要約[]; 未接続矢印数: number } {
    const 接続一覧: 接続要約[] = [];
    let 未接続矢印数 = 0;
    for (const 配置物 of ボード.配置物リスト) {
        if (配置物.type === '付箋') continue;
        if (配置物.startRef && 配置物.endRef) {
            接続一覧.push({ 矢印ID: 配置物.id, from: 配置物.startRef.配置物ID, to: 配置物.endRef.配置物ID });
        } else {
            未接続矢印数 += 1;
        }
    }
    return { 接続一覧, 未接続矢印数 };
}

export function ボードを要約する(ボード: 最新版ボードJSON): ボード要約 {
    const { 接続一覧, 未接続矢印数 } = 接続と未接続数を集計する(ボード);
    return {
        id: ボード.id,
        name: ボード.name,
        updatedAt: ボード.updatedAt,
        revision: ボード.revision,
        付箋一覧: ボード.配置物リスト.filter(is付箋).map(付箋を要約する),
        接続一覧,
        未接続矢印数,
    };
}

export function ボードを配置付きで要約する(ボード: 最新版ボードJSON): 配置付きボード要約 {
    const 要約 = ボードを要約する(ボード);
    const 配置付き付箋一覧: 配置付き付箋要約[] = ボード.配置物リスト.filter(is付箋).map(付箋 => ({
        ...付箋を要約する(付箋),
        position: 付箋.position,
        size: 付箋.size,
    }));
    return { ...要約, 付箋一覧: 配置付き付箋一覧 };
}
