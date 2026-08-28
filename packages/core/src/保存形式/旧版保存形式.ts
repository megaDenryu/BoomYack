// 旧版 (版1、version "1.0.0" 時代) の保存JSON形式。revisionを持たず、次の揺れを全て許容する:
// - 付箋: 旧形式は text のみ、コンテンツ導入後は コンテンツ のみ、設定状態は省略可
// - 矢印: 廃止された「まっすぐ矢印」を含みうる。なめらか曲線矢印の middlePoints は省略可
// この型は decode + 移行の入口だけで使い、ドメインコードへは漏らさない (issue #3)。

import type { 座標JSON, サイズJSON, 接続参照JSON, 付箋コンテンツJSON } from './最新版保存形式';

export interface 旧版付箋JSON {
    readonly type: '付箋';
    readonly id: string;
    readonly position: 座標JSON;
    readonly size: サイズJSON;
    readonly text?: string;
    readonly コンテンツ?: 付箋コンテンツJSON;
    readonly 設定状態?: { readonly 背景色?: string; readonly 文字サイズ?: number; readonly 文字色?: string };
}

export interface 旧版まっすぐ矢印JSON {
    readonly type: 'まっすぐ矢印';
    readonly id: string;
    readonly start: 座標JSON;
    readonly end: 座標JSON;
    readonly startRef?: 接続参照JSON | null;
    readonly endRef?: 接続参照JSON | null;
}

export interface 旧版折れ線矢印JSON {
    readonly type: '折れ線矢印';
    readonly id: string;
    readonly start: 座標JSON;
    readonly 中点リスト: readonly 座標JSON[];
    readonly end: 座標JSON;
    readonly startRef?: 接続参照JSON | null;
    readonly endRef?: 接続参照JSON | null;
}

export interface 旧版なめらか曲線矢印JSON {
    readonly type: 'なめらか曲線矢印';
    readonly id: string;
    readonly start: 座標JSON;
    readonly end: 座標JSON;
    readonly middlePoints?: readonly 座標JSON[];
    readonly startRef?: 接続参照JSON | null;
    readonly endRef?: 接続参照JSON | null;
}

export type 旧版配置物JSON = 旧版付箋JSON | 旧版まっすぐ矢印JSON | 旧版折れ線矢印JSON | 旧版なめらか曲線矢印JSON;

export interface 旧版ボードJSON {
    readonly version: string;
    readonly id: string;
    readonly name: string;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly 描画原点: 座標JSON;
    readonly 配置物リスト: readonly 旧版配置物JSON[];
}
