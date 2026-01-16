import { ビューポート座標値, 描画基準座標, 描画座標点 } from "SengenUI/index";
import { I配置物集約 } from "../../I配置物";



/**
 * 配置物の衝突判定を担当するドメインサービス
 * 責務: 矩形交差判定と円周スキャンによる非衝突位置探索
 */
export class 配置物衝突判定サービス {
    /**
     * 2つの矩形が交差しているかを判定
     */
    public 矩形交差判定(rect1: {x: number, y: number, width: number, height: number}, 
                      rect2: {x: number, y: number, width: number, height: number}): boolean {
        return rect1.x < rect2.x + rect2.width && 
               rect1.x + rect1.width > rect2.x && 
               rect1.y < rect2.y + rect2.height && 
               rect1.y + rect1.height > rect2.y;
    }

    /**
     * 円周上を走査して配置物と被らない位置を探す
     * @param 中心位置 探索の中心位置（描画座標系）
     * @param パネル幅 配置したいパネルの幅（画面座標系）
     * @param パネル高さ 配置したいパネルの高さ（画面座標系）
     * @param 配置物リスト 衝突判定対象の配置物リスト
     * @param ターゲット配置物 必ず回避すべき配置物（他は被ってもOK）
     * @param 描画基準座標 座標変換用の描画基準座標
     * @returns 被らない位置（ビューポート座標系）、見つからない場合はウィンドウ内に収まる位置
     */
    public 被らない位置を探す(
        中心位置: 描画座標点, 
        パネル幅: number, 
        パネル高さ: number,
        配置物リスト: Iterable<I配置物集約>,
        ターゲット配置物: I配置物集約,
        描画基準座標: 描画基準座標
    ): ビューポート座標値 {
        const 中心viewport = 中心位置.toビューポート座標値();
        const 初期半径 = 150; // 初期半径（px）
        const 半径増分 = 50;   // 半径の増分
        const 最大半径 = 500;  // 最大半径
        const 角度サンプル数 = 12; // 円周上のサンプル点数

        // ウィンドウサイズ取得
        const ウィンドウ幅 = window.innerWidth;
        const ウィンドウ高さ = window.innerHeight;

        // ターゲット配置物の矩形（必ず回避）
        const ターゲット矩形情報 = ターゲット配置物.get衝突判定用矩形();
        const ターゲットpos = ターゲット矩形情報.位置.to画面座標点().toビューポート座標値();
        const ターゲット矩形 = { 
            x: ターゲットpos.x.値, 
            y: ターゲットpos.y.値, 
            width: ターゲット矩形情報.サイズ.x.値, 
            height: ターゲット矩形情報.サイズ.y.値 
        };

        // その他の配置物の矩形リスト（参考用）
        const その他配置物矩形リスト = Array.from(配置物リスト)
            .filter(配置物 => 配置物 !== ターゲット配置物)
            .map(配置物 => {
                const 矩形情報 = 配置物.get衝突判定用矩形();
                const pos = 矩形情報.位置.to画面座標点().toビューポート座標値();
                return { 
                    x: pos.x.値, 
                    y: pos.y.値, 
                    width: 矩形情報.サイズ.x.値, 
                    height: 矩形情報.サイズ.y.値 
                };
            });

        // ウィンドウ境界内に収める関数
        const ウィンドウ内に収める = (x: number, y: number): { x: number; y: number } => {
            const clampedX = Math.max(0, Math.min(x, ウィンドウ幅 - パネル幅));
            const clampedY = Math.max(0, Math.min(y, ウィンドウ高さ - パネル高さ));
            return { x: clampedX, y: clampedY };
        };

        // 半径を増やしながら走査
        for (let 半径 = 初期半径; 半径 <= 最大半径; 半径 += 半径増分) {
            // 円周上を角度を変えながら走査
            for (let i = 0; i < 角度サンプル数; i++) {
                const 角度 = (i / 角度サンプル数) * Math.PI * 2;
                let x = 中心viewport.x.値 + Math.cos(角度) * 半径;
                let y = 中心viewport.y.値 + Math.sin(角度) * 半径;
                
                // ウィンドウ境界内に収める
                const 収まった座標 = ウィンドウ内に収める(x, y);
                x = 収まった座標.x;
                y = 収まった座標.y;
                
                const パネル矩形 = { x, y, width: パネル幅, height: パネル高さ };
                
                // ターゲット配置物との交差判定（必須）
                const ターゲットと交差 = this.矩形交差判定(パネル矩形, ターゲット矩形);
                
                if (!ターゲットと交差) {
                    // ターゲットと被らなければOK（他は無視）
                    return ビューポート座標値.fromNumbers(x, y);
                }
            }
        }
        
        // 見つからなかった場合：中心位置をウィンドウ内に収めて返す（フォールバック）
        const フォールバック座標 = ウィンドウ内に収める(中心viewport.x.値, 中心viewport.y.値);
        return ビューポート座標値.fromNumbers(フォールバック座標.x, フォールバック座標.y);
    }
}