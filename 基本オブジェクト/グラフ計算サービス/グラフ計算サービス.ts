import { 描画座標点 } from "SengenUI/index";

import { CanvasGraphModel } from "../描画キャンバス/描画キャンバスView分解/CanvasGraphModel";
import { テキスト用グラフ, テキスト用グラフノード, 付箋text } from "../描画キャンバス/配置物グラフ/テキスト化情報";
import { IDMap } from "Extend/DDDBase/IDBase";
import { 付箋ID } from "../ID";
import { 階層的レイアウトStrategy } from "./レイアウトStrategy/階層的レイアウトStrategy";
import { レイアウト設定 } from "./ValueObjects/レイアウト設定";
import { グリッドレイアウトStrategy } from "./レイアウトStrategy/グリッドレイアウトStrategy";
import { node付箋pair } from "./ValueObjects/node付箋pair";
import { I前処理位置調整Strategy, I後処理位置調整Strategy } from "./レイアウトStrategy/IStrategy";
import { 何もしない後処理Strategy } from "./レイアウトStrategy/何もしない後処理Strategy";
import { ForceDirectedLayoutStrategy } from "./レイアウトStrategy/ForceDirectedLayoutStrategy";
import { サイズ考慮ツリーレイアウトStrategy } from "./レイアウトStrategy/サイズ考慮ツリーレイアウトStrategy";


// ========================================
// ドメインモデル: グラフ配置サービスの集約ルート
// ========================================

export class テキスト用グラフからキャンバスに配置するサービス {
    private readonly model: CanvasGraphModel;
    private readonly グラフ: テキスト用グラフ<付箋text>;
    private readonly node付箋pairMap: IDMap<付箋ID, node付箋pair> = new IDMap<付箋ID, node付箋pair>();
    private readonly 先行位置調整サービス: I前処理位置調整Strategy;
    private readonly 後処理位置調整サービス: I後処理位置調整Strategy;
    private readonly nodeID別node付箋pairMap: Map<string, node付箋pair> = new Map();

    public constructor(
        model: CanvasGraphModel,
        グラフ: テキスト用グラフ<付箋text>,
        開始位置?: 描画座標点,
        前処理Strategy?: I前処理位置調整Strategy,
        後処理Strategy?: I後処理位置調整Strategy
    ) {
        this.model = model;
        this.グラフ = グラフ;
        const 基本設定 = レイアウト設定.default();
        const 設定 = 開始位置 ? 基本設定.with開始位置(開始位置.px2DVector) : 基本設定;
        this.先行位置調整サービス = 前処理Strategy ??
            new 階層的レイアウトStrategy(グラフ, model, 設定);
        this.後処理位置調整サービス = 後処理Strategy ??
            new サイズ考慮ツリーレイアウトStrategy(設定);
    }

    public グラフを配置する(): void {
        // ルートノードから再帰的に配置
        this.グラフ.nodes[0].exec(node => {
            this.テキスト用グラフノードに対して作業を実行する(node);
        });
        this.後処理による位置調整();
    }

    private テキスト用グラフノードに対して作業を実行する(node: テキスト用グラフノード<付箋text>): node付箋pair {
        // 既に処理済みの場合は既存のpairを返す（循環グラフ対策）
        const 既存pair = this.nodeID別node付箋pairMap.get(node.id);
        if (既存pair !== undefined) {
            return 既存pair;
        }

        // 前処理Strategyから位置を取得
        const pos = this.先行位置調整サービス.ノード位置を計算(node);
        const node付箋 = new node付箋pair(node, this.model.描画座標点でadd付箋(pos, node.nodeData.text));
        this.node付箋pairMap.set(node付箋.付箋.id, node付箋);
        this.nodeID別node付箋pairMap.set(node.id, node付箋);

        // 次ノードへの矢印接続
        node.linkNode.nextIDs.forEach(ノードID => {
            const nextノード = this.グラフ.nodes.find(n => n.id === ノードID);
            const nextNodePair = nextノード?.exec(this.テキスト用グラフノードに対して作業を実行する.bind(this));
            if (nextNodePair === undefined) return;
            node付箋.付箋.別の付箋へ矢印を作る(nextNodePair.付箋);
        });

        // 前ノードからの矢印接続
        node.linkNode.prevIDs.forEach(ノードID => {
            const prevノード = this.グラフ.nodes.find(n => n.id === ノードID);
            prevノード?.exec(this.テキスト用グラフノードに対して作業を実行する.bind(this));
            // 次ノードへの矢印で終わっているのでここでは矢印を引く必要なし。もし引くとダブる。
        });

        return node付箋;
    }

    private 後処理による位置調整(): void {
        this.後処理位置調整サービス.実行(this.node付箋pairMap, this.model);
    }
}
















