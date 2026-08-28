// 旧版 (版1) の保存JSONへ絞り込む型ガード。旧版は text のみ付箋・コンテンツのみ付箋・
// まっすぐ矢印・middlePoints省略をすべて受理する (受理した揺れの正規化は移行が担当する)。

import type { 旧版付箋JSON, 旧版まっすぐ矢印JSON, 旧版折れ線矢印JSON, 旧版なめらか曲線矢印JSON, 旧版配置物JSON, 旧版ボードJSON } from './旧版保存形式';
import { isオブジェクト, is座標JSON, isサイズJSON, is接続参照JSONまたは不在, is座標JSONの配列, is付箋コンテンツJSON, isボード共通メタ } from './共通型ガード';

export function is旧版付箋JSON(value: unknown): value is 旧版付箋JSON {
    if (!isオブジェクト(value)) return false;
    if (value.type !== '付箋') return false;
    if (typeof value.id !== 'string') return false;
    if (!is座標JSON(value.position)) return false;
    if (!isサイズJSON(value.size)) return false;
    const text有効 = value.text === undefined || typeof value.text === 'string';
    const コンテンツ有効 = value.コンテンツ === undefined || is付箋コンテンツJSON(value.コンテンツ);
    const 中身が読める = typeof value.text === 'string' || is付箋コンテンツJSON(value.コンテンツ);
    return text有効 && コンテンツ有効 && 中身が読める;
}

export function is旧版まっすぐ矢印JSON(value: unknown): value is 旧版まっすぐ矢印JSON {
    if (!isオブジェクト(value)) return false;
    if (value.type !== 'まっすぐ矢印') return false;
    if (typeof value.id !== 'string') return false;
    if (!is座標JSON(value.start)) return false;
    if (!is座標JSON(value.end)) return false;
    return is接続参照JSONまたは不在(value.startRef) && is接続参照JSONまたは不在(value.endRef);
}

export function is旧版折れ線矢印JSON(value: unknown): value is 旧版折れ線矢印JSON {
    if (!isオブジェクト(value)) return false;
    if (value.type !== '折れ線矢印') return false;
    if (typeof value.id !== 'string') return false;
    if (!is座標JSON(value.start)) return false;
    if (!is座標JSON(value.end)) return false;
    if (!is座標JSONの配列(value.中点リスト)) return false;
    return is接続参照JSONまたは不在(value.startRef) && is接続参照JSONまたは不在(value.endRef);
}

export function is旧版なめらか曲線矢印JSON(value: unknown): value is 旧版なめらか曲線矢印JSON {
    if (!isオブジェクト(value)) return false;
    if (value.type !== 'なめらか曲線矢印') return false;
    if (typeof value.id !== 'string') return false;
    if (!is座標JSON(value.start)) return false;
    if (!is座標JSON(value.end)) return false;
    if (value.middlePoints !== undefined && !is座標JSONの配列(value.middlePoints)) return false;
    return is接続参照JSONまたは不在(value.startRef) && is接続参照JSONまたは不在(value.endRef);
}

export function is旧版配置物JSON(value: unknown): value is 旧版配置物JSON {
    return is旧版付箋JSON(value) || is旧版まっすぐ矢印JSON(value)
        || is旧版折れ線矢印JSON(value) || is旧版なめらか曲線矢印JSON(value);
}

export function is旧版ボードJSON(value: unknown): value is 旧版ボードJSON {
    if (!isオブジェクト(value)) return false;
    if (!isボード共通メタ(value)) return false;
    return (value.配置物リスト as unknown[]).every(is旧版配置物JSON);
}
