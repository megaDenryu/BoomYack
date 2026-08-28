// ========================================
// Value Object: グラフ階層情報
// ========================================

import { テキスト用グラフ } from "BoomYack/基本オブジェクト/描画キャンバス/配置物グラフ/テキスト化情報";

export class グラフ階層情報 {
    private constructor(
        private readonly ノードID別階層Map: Map<string, number>,
        private readonly 階層別ノードIDsMap: Map<number, string[]>,
        private readonly 最大階層: number
    ) {}

    public static fromグラフ<T>(グラフ: テキスト用グラフ<T>): グラフ階層情報 {
        const ノードID別階層Map = new Map<string, number>();
        const 階層別ノードIDsMap = new Map<number, string[]>();
        
        // ルートノード（prevIDs が空のノード）を特定
        const ルートノードs = グラフ.nodes.filter(node => node.linkNode.prevIDs.length === 0);
        
        // BFSで階層を計算
        const 訪問済みSet = new Set<string>();
        const キュー: { nodeId: string; 階層: number }[] = [];
        
        // ルートノードを階層0として初期化
        ルートノードs.forEach(root => {
            キュー.push({ nodeId: root.id, 階層: 0 });
        });
        
        let 最大階層 = 0;
        
        while (キュー.length > 0) {
            const { nodeId, 階層 } = キュー.shift()!;
            
            if (訪問済みSet.has(nodeId)) {
                // 既に訪問済みの場合、より深い階層なら更新
                const 既存階層 = ノードID別階層Map.get(nodeId)!;
                if (階層 > 既存階層) {
                    ノードID別階層Map.set(nodeId, 階層);
                    // 階層別リストも更新
                    階層別ノードIDsMap.get(既存階層)?.splice(
                        階層別ノードIDsMap.get(既存階層)!.indexOf(nodeId), 1
                    );
                    if (!階層別ノードIDsMap.has(階層)) {
                        階層別ノードIDsMap.set(階層, []);
                    }
                    階層別ノードIDsMap.get(階層)!.push(nodeId);
                    最大階層 = Math.max(最大階層, 階層);
                }
                continue;
            }
            
            訪問済みSet.add(nodeId);
            ノードID別階層Map.set(nodeId, 階層);
            
            // 階層別リストに追加
            if (!階層別ノードIDsMap.has(階層)) {
                階層別ノードIDsMap.set(階層, []);
            }
            階層別ノードIDsMap.get(階層)!.push(nodeId);
            
            最大階層 = Math.max(最大階層, 階層);
            
            // 次のノードをキューに追加
            const currentNode = グラフ.nodes.find(n => n.id === nodeId);
            currentNode?.linkNode.nextIDs.forEach(nextId => {
                キュー.push({ nodeId: nextId, 階層: 階層 + 1 });
            });
        }
        
        return new グラフ階層情報(ノードID別階層Map, 階層別ノードIDsMap, 最大階層);
    }

    public ノード階層を取得(nodeId: string): number {
        return this.ノードID別階層Map.get(nodeId) ?? 0;
    }

    public 階層内インデックスを取得(nodeId: string): number {
        const 階層 = this.ノード階層を取得(nodeId);
        const 同階層ノードs = this.階層別ノードIDsMap.get(階層) ?? [];
        return 同階層ノードs.indexOf(nodeId);
    }

    public 階層内ノード数を取得(階層: number): number {
        return this.階層別ノードIDsMap.get(階層)?.length ?? 0;
    }

    public get 全階層数(): number {
        return this.最大階層 + 1;
    }

    public 階層別ノードIDs(階層: number): readonly string[] {
        return this.階層別ノードIDsMap.get(階層) ?? [];
    }
}