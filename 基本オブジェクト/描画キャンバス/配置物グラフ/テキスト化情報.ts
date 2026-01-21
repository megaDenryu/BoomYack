import { 配置物座標点 } from "SengenUI/index";

import { 配置物連結グラフ } from "./配置物連結グラフ";
import { 付箋情報 } from "./配置物情報";
import { Func } from "TypeScriptBenriKakuchou/アーキテクチャBase";

// テキスト埋め込み用情報
export interface GraphNode<T>{id:string;nodeData:T;linkNode:{nextIDs:string[];prevIDs:string[];}}
export interface Graph<T> {jsonTypeDecriptionForAI?:string;nodes:GraphNode<T>[];}
function 型情報テキスト(nodeDataType説明: string):string {
    return [
        "これは有向連結グラフをjsonテキスト化したものでtypescriptで書かれた以下のデータ型で構成されています。nodeDataはジェネリクスになっている。idをたどってAIが読むことを想定しています。",
        "interface GraphNode<T>{id:string;nodeData:T;linkNode:{nextIDs:string[];prevIDs:string[];}}",
        "interface Graph<T> {jsonTypeDecriptionForAI?:string;nodes:GraphNode<T>[];}",
        `今回はtype T = ${nodeDataType説明}`,
        "返答時にグラフが必要ならこの型を使用してjson出力すること。jsonTypeDecriptionForAIはundefined許容型なので不要。idは意味のあるnode名などstringなら自由です。",
    ].join("\n");
}

export class テキスト用グラフノード<T> implements GraphNode<T> {
    public readonly id: string;
    public readonly nodeData: T;
    public readonly linkNode: {
        readonly nextIDs: string[];
        readonly prevIDs: string[];
    }

    public constructor(
        nodeData: T,
        id: string,
        nextIds: string[],
        prevIds: string[],
    ) {
        this.id = id;
        this.nodeData = nodeData;
        this.linkNode = {
            nextIDs: nextIds,
            prevIDs: prevIds,
        };
    }

    public static fromGraphNode<T>(node: GraphNode<T>): テキスト用グラフノード<T> {
        return new テキスト用グラフノード<T>(
            node.nodeData,
            node.id,
            node.linkNode.nextIDs,
            node.linkNode.prevIDs,
        );
    }

    exec<Output>(func:Func<テキスト用グラフノード<T>,Output>):Output{return func(this);}
}

export interface 付箋text {
    readonly text : string;
}
const 付箋text型説明 = "interface 付箋text{text:string;}";

export class テキスト用グラフ<T> implements Graph<T> {
    public readonly jsonTypeDecriptionForAI:string;
    public readonly nodes: テキスト用グラフノード<T>[];
    constructor(nodes: テキスト用グラフノード<T>[],nodeDataTypeDescriptionForAI:string) {
        this.jsonTypeDecriptionForAI = 型情報テキスト(nodeDataTypeDescriptionForAI);
        this.nodes = nodes;
    }

    toJson(): string {
        return JSON.stringify(this);
    }

    public static fromGraph<T>(graph: Graph<T>,nodeDataTypeDescriptionForAI:string): テキスト用グラフ<T> {
        return new テキスト用グラフ<T>(
            graph.nodes.map(node => テキスト用グラフノード.fromGraphNode(node)),
            nodeDataTypeDescriptionForAI,
        );
    }

    public exec<Output>(func:Func<テキスト用グラフ<T>,Output>):Output{return func(this);}
}

export function 付箋情報toテキスト用付箋ノード(付箋: 付箋情報<配置物座標点>): テキスト用グラフノード<付箋text> {
    return new テキスト用グラフノード<付箋text>(
        { text: 付箋.配置物データ.text },
        付箋.配置物データ.id.id,
        付箋.始点が接続している矢印.map(矢印 => 矢印.終点接続付箋 ? 矢印.終点接続付箋.配置物データ.id.id : "").filter(id => id !== ""),
        付箋.終点が接続している矢印.map(矢印 => 矢印.始点接続付箋 ? 矢印.始点接続付箋.配置物データ.id.id : "").filter(id => id !== ""),
    );
}
export function  配置物連結グラフtoテキスト用グラフノード(グラフ:配置物連結グラフ): テキスト用グラフ<付箋text>{
    return new テキスト用グラフ<付箋text>(
        Array.from(グラフ.付箋map.values()).map(付箋情報 => 付箋情報toテキスト用付箋ノード(付箋情報)),
        付箋text型説明,
    );
}




// バリデーション関数
export function isテキスト用グラフ_付箋text(obj: unknown): obj is Graph<付箋text> {
    if (typeof obj !== 'object' || obj === null) {
        console.error('[BoomYack検証] Graphオブジェクトが無効:', typeof obj);
        return false;
    }
    const g = obj as any; // テキスト用グラフ<T> の構造チェック

    // nodes プロパティチェック
    if (!Array.isArray(g.nodes)) {
        console.error('[BoomYack検証] nodesが配列ではない:', typeof g.nodes);
        return false;
    }

    console.log('[BoomYack検証] グラフバリデーション開始:', g.nodes.length, 'ノード');

    // 各ノードのチェック
    for (let i = 0; i < g.nodes.length; i++) {
        const node = g.nodes[i];
        if (!isテキスト用付箋ノード(node, i)) {
            console.error(`[BoomYack検証] ノード[${i}]の検証失敗:`, node);
            return false;
        }
    }

    console.log('[BoomYack検証] ✓ すべてのノードが有効です');
    return true;
}

function isテキスト用付箋ノード(obj: unknown, index?: number): boolean {
    const prefix = index !== undefined ? `[BoomYack検証] ノード[${index}]` : '[BoomYack検証] ノード';
    
    if (typeof obj !== 'object' || obj === null) {
        console.error(`${prefix} がオブジェクトではない:`, typeof obj);
        return false;
    }
    const n = obj as any; // GraphNode<付箋text> の構造チェック

    // id
    if (typeof n.id !== 'string') {
        console.error(`${prefix} idが文字列ではない:`, typeof n.id, n.id);
        return false;
    }

    // nodeData (付箋text)
    if (!is付箋text(n.nodeData, `${prefix} nodeData`)) {
        return false;
    }

    // linkNode
    if (typeof n.linkNode !== 'object' || n.linkNode === null) {
        console.error(`${prefix} linkNodeがオブジェクトではない:`, n.linkNode);
        return false;
    }
    if (!Array.isArray(n.linkNode.nextIDs)) {
        console.error(`${prefix} nextIDsが配列ではない:`, typeof n.linkNode.nextIDs);
        return false;
    }
    if (!n.linkNode.nextIDs.every((id: any) => typeof id === 'string')) {
        console.error(`${prefix} nextIDs内に非文字列がある:`, n.linkNode.nextIDs);
        return false;
    }

    if (!Array.isArray(n.linkNode.prevIDs)) {
        console.error(`${prefix} prevIDsが配列ではない:`, typeof n.linkNode.prevIDs);
        return false;
    }
    if (!n.linkNode.prevIDs.every((id: any) => typeof id === 'string')) {
        console.error(`${prefix} prevIDs内に非文字列がある:`, n.linkNode.prevIDs);
        return false;
    }

    return true;
}

function is付箋text(obj: unknown, context?: string): obj is 付箋text {
    const prefix = context ?? '[BoomYack検証] 付箋text';
    
    if (typeof obj !== 'object' || obj === null) {
        console.error(`${prefix} がオブジェクトではない:`, typeof obj);
        return false;
    }
    const d = obj as any;
    if (typeof d.text !== 'string') {
        console.error(`${prefix} textプロパティが文字列ではない:`, typeof d.text, '実際のプロパティ:', Object.keys(d));
        return false;
    }
    return true;
}

export function テキスト用グラフ_付箋textfromJson(json: string): テキスト用グラフ<付箋text> | null {
    try {
        console.log('[BoomYack] JSON解析開始, 長さ:', json.length);
        const obj = JSON.parse(json);
        console.log('[BoomYack] JSON解析成功, オブジェクト型:', typeof obj);
        
        if (isテキスト用グラフ_付箋text(obj)) {
            console.log('[BoomYack] ✓ グラフバリデーション成功');
            return テキスト用グラフ.fromGraph<付箋text>(obj, 付箋text型説明);
        } else {
            console.error('[BoomYack] ✗ グラフバリデーション失敗:', obj);
            return null;
        }
    } catch (error) {
        console.error('[BoomYack] JSON解析エラー:', error instanceof Error ? error.message : error);
        if (error instanceof SyntaxError) {
            console.error('[BoomYack] JSON構文エラー詳細:', error.message);
            // JSONの問題箇所を特定するためのヒント出力
            console.error('[BoomYack] JSONテキスト(最初500文字):', json.substring(0, 500));
        }
        return null;
    }
}