import { IDMap } from "TypeScriptBenriKakuchou/DDDBase/IDBase";

import { I配置物集約 } from "../I配置物";
import { 付箋ID } from "../ID";
import { Iグラフ配置先 } from "../配置物リポジトリ";
import { テキスト用グラフ, テキスト用グラフノード, 付箋text } from "../描画キャンバス/配置物グラフ/テキスト化情報";
import { I前処理位置調整Strategy, I後処理位置調整Strategy } from "./レイアウトStrategy/IStrategy";
import { node付箋pair } from "./ValueObjects/node付箋pair";

export class グラフ配置処理 {
    private readonly 付箋Map = new IDMap<付箋ID, node付箋pair>();
    private readonly nodeID別付箋Map = new Map<string, node付箋pair>();
    private readonly 矢印一覧: I配置物集約[] = [];

    public constructor(
        private readonly 配置先: Iグラフ配置先,
        private readonly グラフ: テキスト用グラフ<付箋text>,
        private readonly 前処理: I前処理位置調整Strategy,
        private readonly 後処理: I後処理位置調整Strategy
    ) {}

    public 実行する(): I配置物集約[] {
        this.グラフ.nodes[0].exec(node => this.ノードを配置する(node));
        this.後処理.実行(this.付箋Map, this.配置先);
        const 配置物一覧: I配置物集約[] = Array.from(this.付箋Map.values(), pair => pair.付箋);
        配置物一覧.push(...this.矢印一覧);
        return 配置物一覧;
    }

    private ノードを配置する(node: テキスト用グラフノード<付箋text>): node付箋pair {
        const 配置済み = this.nodeID別付箋Map.get(node.id);
        if (配置済み !== undefined) return 配置済み;

        const 位置 = this.前処理.ノード位置を計算(node);
        const 付箋 = this.配置先.描画座標点でadd付箋(位置, node.nodeData.text, node.id);
        const pair = new node付箋pair(node, 付箋);
        this.付箋Map.set(付箋.id, pair);
        this.nodeID別付箋Map.set(node.id, pair);

        node.linkNode.nextIDs.forEach(nodeID => {
            const 次node = this.グラフ.nodes.find(candidate => candidate.id === nodeID);
            const 次pair = 次node?.exec(this.ノードを配置する.bind(this));
            if (次pair === undefined) return;
            this.矢印一覧.push(pair.付箋.別の付箋へ矢印を作る(次pair.付箋));
        });
        node.linkNode.prevIDs.forEach(nodeID => {
            const 前node = this.グラフ.nodes.find(candidate => candidate.id === nodeID);
            前node?.exec(this.ノードを配置する.bind(this));
        });
        return pair;
    }
}
