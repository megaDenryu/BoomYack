import { キャンバス保存レスポンス } from "../描画キャンバス/CanvasResponse";
import { 描画キャンバスデータ, 描画キャンバスJSON, キャンバスメタデータ } from "../描画キャンバス/データクラス";

export interface I描画キャンバスAPIリポジトリ {
    readonly isAvailable: boolean;
    保存(data: 描画キャンバスデータ): Promise<キャンバス保存レスポンス>;
    読み込み(canvasId: string | { id: string }): Promise<描画キャンバスJSON | null>;
    一覧取得(): Promise<キャンバスメタデータ[]>;
    削除(canvasId: string | { id: string }): Promise<{ success: boolean; message: string }>;
    記録済みrevision(canvasId: string): number | null; // 未読み込みのボードはnull (外部更新監視が新規判定に使う)
}

export interface I描画キャンバスローカルリポジトリ {
    保存(data: 描画キャンバスデータ): this;
    読み込み(canvasId: string): 描画キャンバスJSON | null;
    削除(canvasId: string): this;
    全キャンバスID取得(): string[];
    一覧取得(): キャンバスメタデータ[];
    無効データクリーンアップ(): string[];
}

export interface 描画キャンバスリポジトリ {api: I描画キャンバスAPIリポジトリ, local: I描画キャンバスローカルリポジトリ}
