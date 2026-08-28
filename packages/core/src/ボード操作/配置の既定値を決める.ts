// 座標・サイズが省略されたときの既定値の導出 (issue #4)。
// 新規付箋の自動配置は「既存付箋群の右端よりさらに右」の末尾オフセット方式で、
// 既存のどの付箋とも矩形が重ならないことを配置履歴の形に関わらず保証できる。

import type { 座標JSON, サイズJSON, 最新版ボードJSON, 最新版付箋JSON, 付箋設定状態JSON } from '../保存形式/最新版保存形式';

const 新規付箋の余白px = 40;

export const 新規付箋の既定サイズ: サイズJSON = { width: 200, height: 100 };

export const 既定の付箋設定状態: 付箋設定状態JSON = { 背景色: '#ffffd0', 文字サイズ: 14, 文字色: '#000000' };

export function 新規付箋の位置を決める(ボード: 最新版ボードJSON): 座標JSON {
    const 既存付箋群 = ボード.配置物リスト.filter((x): x is 最新版付箋JSON => x.type === '付箋');
    if (既存付箋群.length === 0) {
        return { x: ボード.描画原点.x, y: ボード.描画原点.y };
    }
    const 右端の最大値 = Math.max(...既存付箋群.map(付箋 => 付箋.position.x + 付箋.size.width));
    const 上端の最小値 = Math.min(...既存付箋群.map(付箋 => 付箋.position.y));
    return { x: 右端の最大値 + 新規付箋の余白px, y: 上端の最小値 };
}

// 接続矢印の端点は from付箋の右辺中央 → to付箋の左辺中央 とする。接続済み矢印の描画位置は
// UIが接続参照 (startRef/endRef) から再解決するため、この座標は初期表示用の近似でよい。
export function 接続の端点を導出する(from: 最新版付箋JSON, to: 最新版付箋JSON): {
    start: 座標JSON; end: 座標JSON; start位置: '右'; end位置: '左';
} {
    return {
        start: { x: from.position.x + from.size.width, y: from.position.y + from.size.height / 2 },
        end: { x: to.position.x, y: to.position.y + to.size.height / 2 },
        start位置: '右',
        end位置: '左',
    };
}
