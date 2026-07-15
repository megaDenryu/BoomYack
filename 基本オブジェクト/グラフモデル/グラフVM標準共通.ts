import { 図形内座標点, 描画座標点, 画面座標点 } from "SengenUI/index";
import { エッジID, ノードID, 配置物ID } from "../ID";
import { サイズ } from "../数値";
import { ノードVM標準描画座標, エッジVM標準描画座標 } from "./グラフVM標準描画座標";
import { ノードVM標準画面座標, エッジVM標準画面座標 } from "./グラフVM標準画面座標";
import { ノードVM標準図形内座標, エッジVM標準図形内座標 } from "./グラフVM標準図形内座標";

// シンプルな識別用インターフェース
export interface I配置物 {
    readonly 配置物ID: 配置物ID;
    readonly 配置物種別: '付箋' | 'まっすぐ矢印' | 'なめらか曲線矢印' | '折れ線矢印' | 'グループミニキャンバス';
}

// ========== ファクトリー関数（型安全な作成） ==========

export namespace ノードVMFactory {
    /**
     * 描画座標系ノードを作成
     */
    export function create描画座標(位置: 描画座標点, サイズ: サイズ): ノードVM標準描画座標 {
        return new ノードVM標準描画座標(位置, サイズ, new ノードID());
    }

    /**
     * 画面座標系ノードを作成
     */
    export function create画面座標(位置: 画面座標点, サイズ: サイズ): ノードVM標準画面座標 {
        return new ノードVM標準画面座標(位置, サイズ, new ノードID());
    }

    /**
     * 図形内座標系ノードを作成
     */
    export function create図形内座標(位置: 図形内座標点, サイズ: サイズ): ノードVM標準図形内座標 {
        return new ノードVM標準図形内座標(位置, サイズ, new ノードID());
    }
}

export namespace エッジVMFactory {
    /**
     * 描画座標系エッジを作成
     */
    export function create描画座標(start: ノードVM標準描画座標, end: ノードVM標準描画座標): エッジVM標準描画座標 {
        return new エッジVM標準描画座標(start, end, new エッジID());
    }

    /**
     * 画面座標系エッジを作成
     */
    export function create画面座標(start: ノードVM標準画面座標, end: ノードVM標準画面座標): エッジVM標準画面座標 {
        return new エッジVM標準画面座標(start, end, new エッジID());
    }

    /**
     * 図形内座標系エッジを作成
     */
    export function create図形内座標(start: ノードVM標準図形内座標, end: ノードVM標準図形内座標): エッジVM標準図形内座標 {
        return new エッジVM標準図形内座標(start, end, new エッジID());
    }
}
