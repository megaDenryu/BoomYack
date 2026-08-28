// ボードの永続化を抽象化するリポジトリインターフェース (issue #4)。
// 実装は利用側 (Jimbo のコンポジションルート) が注入する。生データ(unknown)を返すのは
// ディスク上のJSONが外部境界であるためで、版の判別と移行は core の読み込み側が行う。

import type { 最新版ボードJSON } from '../保存形式/最新版保存形式';

export interface ボード一覧項目JSON {
    readonly id: string;
    readonly name: string;
    readonly createdAt: string;
    readonly updatedAt: string;
}

export interface ボード保存リポジトリ {
    一覧を取得する(): Promise<readonly ボード一覧項目JSON[]>;
    生データを読み込む(ボードID: string): Promise<unknown | null>;
    最新版ボードを書き込む(ボードID: string, ボード: 最新版ボードJSON): Promise<void>;
    削除する(ボードID: string): Promise<void>;
}
