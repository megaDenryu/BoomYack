// 保存JSONの正典 (最新版 = 版2)。UIの各データクラスのtoJSONが書き出す形と一致させた上で、
// version "2.0.0" と revision を追加している。UI側のfromJSONは未知キーを無視するため、
// この形式で書いたファイルは現行UIがそのまま読める (issue #3)。
// 注意: フィールド名は保存済みJSONの実形式。UIのデータクラス(packages/ui)と対応がずれたら
// 契約テスト (tests/) が検出する。

export const 最新版のversion = '2.0.0';

export interface 座標JSON {
    readonly x: number;
    readonly y: number;
}

export interface サイズJSON {
    readonly width: number;
    readonly height: number;
}

export interface 接続参照JSON {
    readonly 配置物ID: string;
    readonly 接続位置: string;
}

export type 付箋コンテンツJSON =
    | { readonly 種別: '自由テキスト'; readonly text: string }
    | { readonly 種別: 'タイトル付き'; readonly タイトル: string; readonly 本文: string }
    | { readonly 種別: '札参照'; readonly 札ID: string };

export interface 付箋設定状態JSON {
    readonly 背景色: string;
    readonly 文字サイズ: number;
    readonly 文字色: string;
}

export interface 最新版付箋JSON {
    readonly type: '付箋';
    readonly id: string;
    readonly position: 座標JSON;
    readonly size: サイズJSON;
    readonly コンテンツ: 付箋コンテンツJSON;
    readonly 設定状態: 付箋設定状態JSON;
}

export interface 最新版折れ線矢印JSON {
    readonly type: '折れ線矢印';
    readonly id: string;
    readonly start: 座標JSON;
    readonly 中点リスト: readonly 座標JSON[];
    readonly end: 座標JSON;
    readonly startRef?: 接続参照JSON | null;
    readonly endRef?: 接続参照JSON | null;
}

export interface 最新版なめらか曲線矢印JSON {
    readonly type: 'なめらか曲線矢印';
    readonly id: string;
    readonly start: 座標JSON;
    readonly end: 座標JSON;
    readonly middlePoints: readonly 座標JSON[];
    readonly startRef?: 接続参照JSON | null;
    readonly endRef?: 接続参照JSON | null;
}

export type 最新版配置物JSON = 最新版付箋JSON | 最新版折れ線矢印JSON | 最新版なめらか曲線矢印JSON;

export interface 最新版ボードJSON {
    readonly version: typeof 最新版のversion;
    readonly id: string;
    readonly name: string;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly revision: number;
    readonly 描画原点: 座標JSON;
    readonly 配置物リスト: readonly 最新版配置物JSON[];
}
