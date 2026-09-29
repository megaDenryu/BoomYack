import { I配置物集約 } from "../../I配置物";

export interface 画面矩形 { x: number; y: number; width: number; height: number }

export function 配置物の画面矩形を得る(item: I配置物集約): 画面矩形 {
    const rect = item.get衝突判定用矩形();
    const position = rect.位置.to画面座標点().toビューポート座標値();
    return {
        x: position.x.値, y: position.y.値,
        width: rect.サイズ.x.値, height: rect.サイズ.y.値,
    };
}

export function 矩形が交差する(a: 画面矩形, b: 画面矩形): boolean {
    return a.x < b.x + b.width && a.x + a.width > b.x
        && a.y < b.y + b.height && a.y + a.height > b.y;
}

/** 左上が(x, y)で大きさがwidth×heightの矩形を、見えている範囲(ボードルートの中身の座標)の中へ押し戻す。 */
export function 画面内に収める(x: number, y: number, width: number, height: number,
    見えている範囲: 画面矩形): { x: number; y: number } {
    return {
        x: Math.max(見えている範囲.x, Math.min(x, 見えている範囲.x + 見えている範囲.width - width)),
        y: Math.max(見えている範囲.y, Math.min(y, 見えている範囲.y + 見えている範囲.height - height)),
    };
}
