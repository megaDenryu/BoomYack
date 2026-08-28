import { ビューポート座標値, 描画基準座標, 描画座標点 } from "SengenUI/index";
import { I配置物集約 } from "../../I配置物";
import { 画面内に収める, 画面矩形, 矩形が交差する, 配置物の画面矩形を得る } from "./配置物画面矩形";

/** 矩形交差判定と円周スキャンによる非衝突位置探索。 */
export class 配置物衝突判定サービス {
    public 矩形交差判定(a: 画面矩形, b: 画面矩形): boolean { return 矩形が交差する(a, b); }

    public 被らない位置を探す(中心位置: 描画座標点, パネル幅: number, パネル高さ: number,
        配置物リスト: Iterable<I配置物集約>, ターゲット: I配置物集約,
        描画基準座標: 描画基準座標): ビューポート座標値 {
        const center = 中心位置.toビューポート座標値();
        const targetRect = 配置物の画面矩形を得る(ターゲット);
        const その他配置物矩形リスト = Array.from(配置物リスト)
            .filter(item => item !== ターゲット).map(配置物の画面矩形を得る);
        void その他配置物矩形リスト;
        void 描画基準座標;

        for (let radius = 150; radius <= 500; radius += 50) {
            for (let index = 0; index < 12; index += 1) {
                const angle = (index / 12) * Math.PI * 2;
                const position = 画面内に収める(
                    center.x.値 + Math.cos(angle) * radius,
                    center.y.値 + Math.sin(angle) * radius,
                    パネル幅, パネル高さ);
                const panelRect = { ...position, width: パネル幅, height: パネル高さ };
                if (!this.矩形交差判定(panelRect, targetRect))
                    return ビューポート座標値.fromNumbers(position.x, position.y);
            }
        }

        const position = 画面内に収める(center.x.値, center.y.値, パネル幅, パネル高さ);
        return ビューポート座標値.fromNumbers(position.x, position.y);
    }
}
