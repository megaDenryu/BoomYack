// 旧版 (版1) のボードJSONを最新版 (版2) へ変換する。版ごとの揺れをここで1回だけ吸収し、
// 以降のコードには最新版だけを流す (「版ごとの型+最新への変換」様式)。
// - text のみの付箋は自由テキストコンテンツへ変換する
// - 設定状態の欠落はUIの既定値 (付箋設定状態.create と同値) で補完する
// - 廃止された「まっすぐ矢印」は中点なしの折れ線矢印へ変換する (見た目は同じ直線になる)
// - revision は 0 から開始する

import { 最新版のversion } from './最新版保存形式';
import type { 最新版付箋JSON, 最新版折れ線矢印JSON, 最新版なめらか曲線矢印JSON, 最新版配置物JSON, 最新版ボードJSON, 付箋コンテンツJSON } from './最新版保存形式';
import type { 旧版付箋JSON, 旧版まっすぐ矢印JSON, 旧版なめらか曲線矢印JSON, 旧版配置物JSON, 旧版ボードJSON } from './旧版保存形式';

const 既定の付箋設定状態 = { 背景色: '#ffffd0', 文字サイズ: 14, 文字色: '#000000' } as const;

function 旧版付箋のコンテンツを決める(付箋: 旧版付箋JSON): 付箋コンテンツJSON {
    if (付箋.コンテンツ !== undefined) return 付箋.コンテンツ;
    return { 種別: '自由テキスト', text: 付箋.text ?? '' };
}

function 旧版付箋を移行する(付箋: 旧版付箋JSON): 最新版付箋JSON {
    return {
        type: '付箋',
        id: 付箋.id,
        position: 付箋.position,
        size: 付箋.size,
        コンテンツ: 旧版付箋のコンテンツを決める(付箋),
        設定状態: {
            背景色: 付箋.設定状態?.背景色 ?? 既定の付箋設定状態.背景色,
            文字サイズ: 付箋.設定状態?.文字サイズ ?? 既定の付箋設定状態.文字サイズ,
            文字色: 付箋.設定状態?.文字色 ?? 既定の付箋設定状態.文字色,
        },
    };
}

function まっすぐ矢印を折れ線矢印へ移行する(矢印: 旧版まっすぐ矢印JSON): 最新版折れ線矢印JSON {
    return {
        type: '折れ線矢印',
        id: 矢印.id,
        start: 矢印.start,
        中点リスト: [],
        end: 矢印.end,
        startRef: 矢印.startRef,
        endRef: 矢印.endRef,
    };
}

function なめらか曲線矢印を移行する(矢印: 旧版なめらか曲線矢印JSON): 最新版なめらか曲線矢印JSON {
    return { ...矢印, middlePoints: 矢印.middlePoints ?? [] };
}

function 旧版配置物を移行する(配置物: 旧版配置物JSON): 最新版配置物JSON {
    switch (配置物.type) {
        case '付箋': return 旧版付箋を移行する(配置物);
        case 'まっすぐ矢印': return まっすぐ矢印を折れ線矢印へ移行する(配置物);
        case '折れ線矢印': return 配置物;
        case 'なめらか曲線矢印': return なめらか曲線矢印を移行する(配置物);
    }
}

export function 旧版ボードを最新版へ移行する(ボード: 旧版ボードJSON): 最新版ボードJSON {
    return {
        version: 最新版のversion,
        id: ボード.id,
        name: ボード.name,
        createdAt: ボード.createdAt,
        updatedAt: ボード.updatedAt,
        revision: 0,
        描画原点: ボード.描画原点,
        配置物リスト: ボード.配置物リスト.map(旧版配置物を移行する),
    };
}
