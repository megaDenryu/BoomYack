import { Func } from "TypeScriptBenriKakuchou/アーキテクチャBase";

export interface GraphNode<T> { id: string; nodeData: T; linkNode: { nextIDs: string[]; prevIDs: string[] } }
export interface Graph<T> { jsonTypeDecriptionForAI?: string; nodes: GraphNode<T>[] }
export interface 付箋text { readonly text: string }
export const 付箋text型説明 = "interface 付箋text{text:string;} です。textは付箋に書かれたテキストで、必ずマークダウン形式の文字列を埋め込むこと。メタ情報やコードもマークダウンの文字列の中に埋め込むこと。";

function 型情報テキスト(typeDescription: string): string {
    return [
        "これは有向連結グラフをjsonテキスト化したものでtypescriptで書かれた以下のデータ型で構成されています。nodeDataはジェネリクスになっている。idをたどってAIが読むことを想定しています。",
        "interface GraphNode<T>{id:string;nodeData:T;linkNode:{nextIDs:string[];prevIDs:string[];}}",
        "interface Graph<T> {jsonTypeDecriptionForAI?:string;nodes:GraphNode<T>[];}",
        `今回はtype T = ${typeDescription}`,
        "返答時にグラフが必要ならこの型を使用してjson出力すること。jsonTypeDecriptionForAIはundefined許容型なので不要。idは意味のあるnode名などstringなら自由です。",
    ].join("\n");
}

export class テキスト用グラフノード<T> implements GraphNode<T> {
    public readonly linkNode: { readonly nextIDs: string[]; readonly prevIDs: string[] };
    public constructor(public readonly nodeData: T, public readonly id: string,
        nextIds: string[], prevIds: string[]) {
        this.linkNode = { nextIDs: nextIds, prevIDs: prevIds };
    }
    public static fromGraphNode<T>(node: GraphNode<T>): テキスト用グラフノード<T> {
        return new テキスト用グラフノード(node.nodeData, node.id, node.linkNode.nextIDs, node.linkNode.prevIDs);
    }
    public exec<Output>(func: Func<テキスト用グラフノード<T>, Output>): Output { return func(this); }
}

export class テキスト用グラフ<T> implements Graph<T> {
    public readonly jsonTypeDecriptionForAI: string;
    public constructor(public readonly nodes: テキスト用グラフノード<T>[], description: string) {
        this.jsonTypeDecriptionForAI = 型情報テキスト(description);
    }
    public toJson(): string { return JSON.stringify(this); }
    public static fromGraph<T>(graph: Graph<T>, description: string): テキスト用グラフ<T> {
        return new テキスト用グラフ(graph.nodes.map(テキスト用グラフノード.fromGraphNode), description);
    }
    public exec<Output>(func: Func<テキスト用グラフ<T>, Output>): Output { return func(this); }
}
