// ボードへ行う編集操作をコマンド (名前と引数を持つ型) として表す判別共用体 (issue #4)。
// 一括適用はこのコマンドの列を1回の保存で適用する。座標・サイズは省略可能な補助情報で、
// 省略時は自動配置・接続点からの自動導出になる。

import type { 座標JSON, サイズJSON, 付箋コンテンツJSON, 付箋設定状態JSON } from '../保存形式/最新版保存形式';

export interface 付箋を追加する {
    readonly kind: '付箋を追加する';
    readonly 付箋ID: string;
    readonly コンテンツ: 付箋コンテンツJSON;
    readonly position?: 座標JSON;
    readonly size?: サイズJSON;
    readonly 設定状態?: 付箋設定状態JSON;
}

export interface 付箋を更新する {
    readonly kind: '付箋を更新する';
    readonly 付箋ID: string;
    readonly コンテンツ?: 付箋コンテンツJSON;
    readonly 設定状態?: 付箋設定状態JSON;
    readonly position?: 座標JSON;
    readonly size?: サイズJSON;
}

export interface 付箋を削除する {
    readonly kind: '付箋を削除する';
    readonly 付箋ID: string;
}

export interface 接続を追加する {
    readonly kind: '接続を追加する';
    readonly 矢印ID: string;
    readonly from付箋ID: string;
    readonly to付箋ID: string;
}

export interface 接続を削除する {
    readonly kind: '接続を削除する';
    readonly 矢印ID: string;
}

export type ボード編集コマンド = 付箋を追加する | 付箋を更新する | 付箋を削除する | 接続を追加する | 接続を削除する;
