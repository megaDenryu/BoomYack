// 参照: この barrel は旧ファイル互換のためだけに残す。新規importは個別ファイルから行う。

export type { I座標JSON } from "./座標データ";
export { 座標データ } from "./座標データ";
export type { IサイズJSON } from "./サイズデータ";
export { サイズデータ } from "./サイズデータ";
export type { 接続点位置, I接続参照JSON } from "./接続参照データ";
export { 接続参照データ } from "./接続参照データ";
export type { I付箋JSON } from "./付箋データ";
export { 付箋データ } from "./付箋データ";
export type { I矢印JSON } from "./矢印データ";
export { 矢印データ } from "./矢印データ";
export type { I折れ線矢印JSON } from "./折れ線矢印データ";
export { 折れ線矢印データ } from "./折れ線矢印データ";
export type { Iなめらか曲線矢印JSON } from "./なめらか曲線矢印データ";
export { なめらか曲線矢印データ } from "./なめらか曲線矢印データ";
export type { IキャンバスメタデータJSON } from "./キャンバスメタデータ";
export { キャンバスメタデータ } from "./キャンバスメタデータ";
export type { I描画キャンバスJSON, 描画キャンバスJSON, 配置物データ } from "./描画キャンバスデータ";
export { 描画キャンバスデータ, 描画キャンバスデータからメタデータ抽出 } from "./描画キャンバスデータ";
