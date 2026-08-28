import { I描画キャンバスJSON } from "./描画キャンバスJSON";
import { 付箋データ } from "./付箋データ";
import { 折れ線矢印データ } from "./折れ線矢印データ";
import { なめらか曲線矢印データ } from "./なめらか曲線矢印データ";

export type 配置物データ = 付箋データ | 折れ線矢印データ | なめらか曲線矢印データ;

export function 配置物リストを復元する(json: I描画キャンバスJSON): 配置物データ[] {
    return json.配置物リスト.map((item: any) => {
        switch (item.type) {
            case "付箋": return 付箋データ.fromJSON(item);
            case "折れ線矢印": return 折れ線矢印データ.fromJSON(item);
            case "なめらか曲線矢印": return なめらか曲線矢印データ.fromJSON(item);
            default: throw new Error(`Unknown type: ${item.type}`);
        }
    });
}
