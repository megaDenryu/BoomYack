/**
 * 描画キャンバス APIのレスポンス型定義
 * バックエンドのCanvasRouterと対応
 */

import { I描画キャンバスJSON, IキャンバスメタデータJSON } from "./データクラス";

// キャンバス保存レスポンスはデータクラスで定義されているが、
// ここで再定義して循環参照を回避する
export type キャンバス保存レスポンス = 
    | { success: true; message: string; data: I描画キャンバスJSON }
    | { success: false; message: string; data?: undefined };

export type CanvasLoadResponse = 
    | { success: true; data: I描画キャンバスJSON; message?: string }
    | { success: false; data: null; message: string };

export type CanvasListResponse = 
    | { success: true; items: IキャンバスメタデータJSON[]; message?: string }
    | { success: false; items: []; message: string };

export type CanvasDeleteResponse = 
    | { success: true; message: string }
    | { success: false; message: string };

export type CanvasSaveResponse = キャンバス保存レスポンス;
