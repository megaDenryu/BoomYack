// @boomyack/core の公開境界。保存形式の正典 (issue #3)。
// 書き込み側は最新版ボードJSON型の値だけを永続化する (encodeが常に最新形式になることは
// 型で保証され、専用の書き出し関数は置かない)。

export { 最新版のversion } from './保存形式/最新版保存形式';
export type {
    座標JSON, サイズJSON, 接続参照JSON, 付箋コンテンツJSON, 付箋設定状態JSON,
    最新版付箋JSON, 最新版折れ線矢印JSON, 最新版なめらか曲線矢印JSON,
    最新版配置物JSON, 最新版ボードJSON,
} from './保存形式/最新版保存形式';
export { is最新版ボードJSON, is最新版配置物JSON, is最新版付箋JSON } from './保存形式/最新版型ガード';
export { 保存JSONから最新版ボードを読み込む } from './保存形式/保存JSONから読み込む';
export type { ボード読み込み結果 } from './保存形式/保存JSONから読み込む';
