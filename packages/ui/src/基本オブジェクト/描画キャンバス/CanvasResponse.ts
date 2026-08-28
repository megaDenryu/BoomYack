/**
 * 描画キャンバス APIのレスポンス型定義
 * バックエンドの /BoomYack/board/* (HttpServerAdapter) と対応
 */

import { I描画キャンバスJSON, IキャンバスメタデータJSON } from "./データクラス";

// revisionはサーバー側の楽観ロック(古い状態からの上書きを拒否する仕組み)の照合値。
// 読み込みで受け取り、次の保存でexpectedRevisionとして送り返す
export type キャンバス保存レスポンス =
    | { success: true; message: string; revision: number }
    | { success: false; message: string; kind?: string };

export type CanvasLoadResponse =
    | { success: true; data: I描画キャンバスJSON; revision: number; message?: string }
    | { success: false; data: null; message: string };

export type CanvasListResponse = 
    | { success: true; items: IキャンバスメタデータJSON[]; message?: string }
    | { success: false; items: []; message: string };

export type CanvasDeleteResponse = 
    | { success: true; message: string }
    | { success: false; message: string };

export type CanvasSaveResponse = キャンバス保存レスポンス;
