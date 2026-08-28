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

export function 画面内に収める(x: number, y: number, width: number, height: number): { x: number; y: number } {
    return {
        x: Math.max(0, Math.min(x, window.innerWidth - width)),
        y: Math.max(0, Math.min(y, window.innerHeight - height)),
    };
}
