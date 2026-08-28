// ディスクから読んだ unknown を保存形式の部品型へ絞り込む型ガード。外部境界はここだけで
// unknown を受け、以降は型付きで扱う。旧版・最新版の両方の型ガードが共用する。

import type { 座標JSON, サイズJSON, 接続参照JSON, 付箋コンテンツJSON, 付箋設定状態JSON } from './最新版保存形式';

export function isオブジェクト(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

export function is座標JSON(value: unknown): value is 座標JSON {
    if (!isオブジェクト(value)) return false;
    return typeof value.x === 'number' && typeof value.y === 'number';
}

export function isサイズJSON(value: unknown): value is サイズJSON {
    if (!isオブジェクト(value)) return false;
    return typeof value.width === 'number' && typeof value.height === 'number';
}

export function is接続参照JSON(value: unknown): value is 接続参照JSON {
    if (!isオブジェクト(value)) return false;
    return typeof value.配置物ID === 'string' && typeof value.接続位置 === 'string';
}

export function is接続参照JSONまたは不在(value: unknown): value is 接続参照JSON | null | undefined {
    if (value === null || value === undefined) return true;
    return is接続参照JSON(value);
}

export function is座標JSONの配列(value: unknown): value is 座標JSON[] {
    return Array.isArray(value) && value.every(is座標JSON);
}

export function is付箋コンテンツJSON(value: unknown): value is 付箋コンテンツJSON {
    if (!isオブジェクト(value)) return false;
    switch (value.種別) {
        case '自由テキスト':
            return typeof value.text === 'string';
        case 'タイトル付き':
            return typeof value.タイトル === 'string' && typeof value.本文 === 'string';
        case '札参照':
            return typeof value.札ID === 'string';
        default:
            return false;
    }
}

export function is付箋設定状態JSON(value: unknown): value is 付箋設定状態JSON {
    if (!isオブジェクト(value)) return false;
    return typeof value.背景色 === 'string'
        && typeof value.文字サイズ === 'number'
        && typeof value.文字色 === 'string';
}

export function isボード共通メタ(value: Record<string, unknown>): boolean {
    return typeof value.version === 'string'
        && typeof value.id === 'string'
        && typeof value.name === 'string'
        && typeof value.createdAt === 'string'
        && typeof value.updatedAt === 'string'
        && is座標JSON(value.描画原点)
        && Array.isArray(value.配置物リスト);
}
