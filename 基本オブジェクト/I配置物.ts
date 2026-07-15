// 参照: この barrel は旧ファイル互換のためだけに残す。新規importは個別ファイルから行う。

export { 配置物zIndex } from "./配置物zIndex";

export type {
    配置物type,
    Iドラッグ移動可能,
    Iシリアライズ可能配置物,
    I選択可能配置物,
    I衝突判定可能,
    接触判定可能な点,
    I接触点登録先,
    I配置物集約,
} from "./I配置物集約";

export type {
    I付箋シリアライズ可能,
    I付箋集約,
    I付箋VM,
    I付箋View,
    I自動リサイズ付箋集約,
    I自動リサイズ付箋VM,
    I自動リサイズ付箋View,
} from "./I付箋";

export type {
    Iグループミニキャンバス集約,
    IグループミニキャンバスVM,
    IグループミニキャンバスView,
} from "./Iグループミニキャンバス";

export type {
    I始終点矢印集約,
    I点と線のリポジトリ,
    I点ハンドル,
    I接続点と接続可能,
    I線分ハンドル,
} from "./I矢印共通";
export { is始終点矢印集約 } from "./I矢印共通";

export type {
    Iまっすぐ矢印集約,
    Iまっすぐ矢印VM,
    Iまっすぐ矢印View,
    I矢印集約,
} from "./Iまっすぐ矢印";

export type {
    I折れ線矢印シリアライズ可能,
    I折れ線矢印VM,
    I折れ線矢印View,
    I折れ線矢印集約,
} from "./I折れ線矢印";
export { is折れ線矢印集約 } from "./I折れ線矢印";

export type {
    Iなめらか曲線矢印集約,
    Iなめらか曲線矢印VM,
    Iなめらか曲線矢印View,
    Iなめらか曲線矢印シリアライズ可能,
} from "./Iなめらか曲線矢印";

export type {
    I接触点を教えてくれる人,
    リスト配置可能,
    I接続点,
} from "./I接触判定";
