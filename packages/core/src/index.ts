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

// ボード操作の境界 (issue #4)。UI・MCPはこのサービス経由でだけ保存操作を行う。
export { ボード操作サービス } from './ボード操作/ボード操作サービス';
export type { ボード操作サービス依存 } from './ボード操作/ボード操作サービス';
export type { ボード保存リポジトリ, ボード一覧項目JSON } from './ボード操作/ボード保存リポジトリ';
export type { ボード編集コマンド } from './ボード操作/ボード編集コマンド';
export type { ボード操作結果, ボード操作失敗, ボード削除結果 } from './ボード操作/ボード操作結果';
export type { ボード変更通知, ボード変更通知先 } from './ボード操作/ボード変更通知';

// AIが使う読み書きの境界 (issue #6)。保存JSONを見せず、要約とグラフ一括追加だけを公開する。
export { AI向けボードサービス } from './AI向けボードAPI/AI向けボードサービス';
export type { AI向けボードサービス依存, ボード要約取得結果, 配置付きボード要約取得結果 } from './AI向けボードAPI/AI向けボードサービス';
export type { 付箋コンテンツ表現 } from './AI向けボードAPI/付箋コンテンツ表現';
export { 表現を保存形式のコンテンツへ変換する, 保存形式のコンテンツを表現へ変換する } from './AI向けボードAPI/付箋コンテンツ表現';
export type { ボード要約, 配置付きボード要約, 付箋要約, 接続要約 } from './AI向けボードAPI/ボード要約型';
export type { グラフ一括追加の指示, グラフ一括追加結果, 追加する付箋の指示, 追加する接続の指示 } from './AI向けボードAPI/グラフ一括追加型';
