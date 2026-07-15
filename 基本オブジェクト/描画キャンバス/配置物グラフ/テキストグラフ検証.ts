import { レコードとして扱えるか } from "../../オブジェクト型ガード";
import { Graph, テキスト用グラフ, 付箋text, 付箋text型説明 } from "./テキストグラフ型";

export function isテキスト用グラフ_付箋text(obj: unknown): obj is Graph<付箋text> {
    if (!レコードとして扱えるか(obj)) {
        console.error("[BoomYack検証] Graphオブジェクトが無効:", typeof obj); return false;
    }
    if (!Array.isArray(obj.nodes)) {
        console.error("[BoomYack検証] nodesが配列ではない:", typeof obj.nodes); return false;
    }
    console.log("[BoomYack検証] グラフバリデーション開始:", obj.nodes.length, "ノード");
    for (let index = 0; index < obj.nodes.length; index += 1) {
        if (isテキスト用付箋ノード(obj.nodes[index], index)) continue;
        console.error(`[BoomYack検証] ノード[${index}]の検証失敗:`, obj.nodes[index]); return false;
    }
    console.log("[BoomYack検証] ✓ すべてのノードが有効です"); return true;
}

function isテキスト用付箋ノード(obj: unknown, index: number): boolean {
    const prefix = `[BoomYack検証] ノード[${index}]`;
    if (!レコードとして扱えるか(obj)) {
        console.error(`${prefix} がオブジェクトではない:`, typeof obj); return false;
    }
    if (typeof obj.id !== "string") {
        console.error(`${prefix} idが文字列ではない:`, typeof obj.id, obj.id); return false;
    }
    if (!is付箋text(obj.nodeData, `${prefix} nodeData`)) return false;
    if (!レコードとして扱えるか(obj.linkNode)) {
        console.error(`${prefix} linkNodeがオブジェクトではない:`, obj.linkNode); return false;
    }
    if (!Array.isArray(obj.linkNode.nextIDs)) {
        console.error(`${prefix} nextIDsが配列ではない:`, typeof obj.linkNode.nextIDs); return false;
    }
    if (!obj.linkNode.nextIDs.every(id => typeof id === "string")) {
        console.error(`${prefix} nextIDs内に非文字列がある:`, obj.linkNode.nextIDs); return false;
    }
    if (!Array.isArray(obj.linkNode.prevIDs)) {
        console.error(`${prefix} prevIDsが配列ではない:`, typeof obj.linkNode.prevIDs); return false;
    }
    if (!obj.linkNode.prevIDs.every(id => typeof id === "string")) {
        console.error(`${prefix} prevIDs内に非文字列がある:`, obj.linkNode.prevIDs); return false;
    }
    return true;
}

function is付箋text(obj: unknown, context: string): obj is 付箋text {
    if (!レコードとして扱えるか(obj)) {
        console.error(`${context} がオブジェクトではない:`, typeof obj); return false;
    }
    if (typeof obj.text === "string") return true;
    console.error(`${context} textプロパティが文字列ではない:`, typeof obj.text, "実際のプロパティ:", Object.keys(obj));
    return false;
}

export function テキスト用グラフ_付箋textfromJson(json: string): テキスト用グラフ<付箋text> | null {
    try {
        console.log("[BoomYack] JSON解析開始, 長さ:", json.length);
        const obj = JSON.parse(json);
        console.log("[BoomYack] JSON解析成功, オブジェクト型:", typeof obj);
        if (!isテキスト用グラフ_付箋text(obj)) {
            console.error("[BoomYack] ✗ グラフバリデーション失敗:", obj); return null;
        }
        console.log("[BoomYack] ✓ グラフバリデーション成功");
        return テキスト用グラフ.fromGraph(obj, 付箋text型説明);
    } catch (error) {
        console.error("[BoomYack] JSON解析エラー:", error instanceof Error ? error.message : error);
        if (error instanceof SyntaxError) {
            console.error("[BoomYack] JSON構文エラー詳細:", error.message);
            console.error("[BoomYack] JSONテキスト(最初500文字):", json.substring(0, 500));
        }
        return null;
    }
}
