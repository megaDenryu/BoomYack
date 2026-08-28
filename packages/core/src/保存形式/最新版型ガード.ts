// 最新版 (版2) の保存JSONへ絞り込む型ガード。最新版は揺れを許容しない:
// 付箋はコンテンツ+設定状態が必須、矢印は折れ線となめらか曲線のみ、revisionが必須。

import { 最新版のversion } from './最新版保存形式';
import type { 最新版付箋JSON, 最新版折れ線矢印JSON, 最新版なめらか曲線矢印JSON, 最新版配置物JSON, 最新版ボードJSON } from './最新版保存形式';
import { isオブジェクト, is座標JSON, isサイズJSON, is接続参照JSONまたは不在, is座標JSONの配列, is付箋コンテンツJSON, is付箋設定状態JSON, isボード共通メタ } from './共通型ガード';

export function is最新版付箋JSON(value: unknown): value is 最新版付箋JSON {
    if (!isオブジェクト(value)) return false;
    if (value.type !== '付箋') return false;
    if (typeof value.id !== 'string') return false;
    if (!is座標JSON(value.position)) return false;
    if (!isサイズJSON(value.size)) return false;
    return is付箋コンテンツJSON(value.コンテンツ) && is付箋設定状態JSON(value.設定状態);
}

export function is最新版折れ線矢印JSON(value: unknown): value is 最新版折れ線矢印JSON {
    if (!isオブジェクト(value)) return false;
    if (value.type !== '折れ線矢印') return false;
    if (typeof value.id !== 'string') return false;
    if (!is座標JSON(value.start)) return false;
    if (!is座標JSON(value.end)) return false;
    if (!is座標JSONの配列(value.中点リスト)) return false;
    return is接続参照JSONまたは不在(value.startRef) && is接続参照JSONまたは不在(value.endRef);
}

export function is最新版なめらか曲線矢印JSON(value: unknown): value is 最新版なめらか曲線矢印JSON {
    if (!isオブジェクト(value)) return false;
    if (value.type !== 'なめらか曲線矢印') return false;
    if (typeof value.id !== 'string') return false;
    if (!is座標JSON(value.start)) return false;
    if (!is座標JSON(value.end)) return false;
    if (!is座標JSONの配列(value.middlePoints)) return false;
    return is接続参照JSONまたは不在(value.startRef) && is接続参照JSONまたは不在(value.endRef);
}

export function is最新版配置物JSON(value: unknown): value is 最新版配置物JSON {
    return is最新版付箋JSON(value) || is最新版折れ線矢印JSON(value) || is最新版なめらか曲線矢印JSON(value);
}

export function is最新版ボードJSON(value: unknown): value is 最新版ボードJSON {
    if (!isオブジェクト(value)) return false;
    if (value.version !== 最新版のversion) return false;
    if (typeof value.revision !== 'number') return false;
    if (!isボード共通メタ(value)) return false;
    return (value.配置物リスト as unknown[]).every(is最新版配置物JSON);
}
