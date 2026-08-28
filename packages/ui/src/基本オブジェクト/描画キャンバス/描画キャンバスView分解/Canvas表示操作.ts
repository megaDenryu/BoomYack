import { Drag中値, Px2DVector, 画面座標点 } from "SengenUI/index";
import { GraphEvent } from "./CanvasGraphModel";
import { 拡縮入力 } from "./CanvasView契約";
import { CanvasView状態 } from "./CanvasView状態";

export class Canvas表示操作 {
    public constructor(private readonly 状態: CanvasView状態) {}
    public handleGraphEvent(e: GraphEvent): void {
        if (e.type === "ADDED" && e.item) this.状態.配置物コンテナ.child(e.item.view);
        else if (e.type === "REMOVED" && e.item) e.item.view.delete();
        else if (e.type === "UPDATED") this.再描画をスケジュールする();
    }
    public 再描画をスケジュールする(): void {
        if (this.状態.再描画予約済み) return;
        this.状態.再描画予約済み = true;
        this.状態.再描画ID = requestAnimationFrame(() => {
            this.状態.model.配置物再描画();
            this.状態.付箋召喚UI.再描画();
            this.状態.再描画予約済み = false;
            this.状態.再描画ID = null;
        });
    }
    public 再描画予約を解除する(): void {
        if (this.状態.再描画ID !== null) cancelAnimationFrame(this.状態.再描画ID);
        this.状態.再描画ID = null;
        this.状態.再描画予約済み = false;
    }
    public canvasDrag(e: Drag中値): void {
        const delta = e.data.直前のマウス位置から現在位置までの差分;
        const scale = this.状態.model.描画基準座標.拡縮率;
        const 補正 = Px2DVector.fromNumbers(delta.x / scale, delta.y / scale);
        const 現在 = this.状態.model.描画基準座標.描画原点;
        this.状態.model.update描画基準座標原点(現在.plus(補正));
    }
    public canvasDragEnd(_e: Drag中値): void { this.再描画をスケジュールする(); }
    public pinchZoom(変化率: number, x: number, y: number): void {
        const scale = this.状態.currentScale + (変化率 - 1) * 0.5;
        if (scale <= 0.1 || scale >= 5.0) return;
        this.状態.currentScale = scale;
        const 中心 = this.状態.座標変換.viewportPointを補正する(x, y);
        this.scaleUpdate({ 拡縮率: scale, 中心X: 中心.x.値, 中心Y: 中心.y.値 });
    }
    public scaleUpdate(input: 拡縮入力): void {
        this.状態.model.update拡縮率(input.拡縮率, 画面座標点.fromNumbers(input.中心X, input.中心Y));
        this.状態.配置物コンテナ.setStyleCSS({
            transform: `scale(${input.拡縮率})`, transformOrigin: `${input.中心X}px ${input.中心Y}px`,
        });
    }
    public 全接続点を切り替える(表示: boolean): void {
        for (const item of this.状態.model.配置物リスト) item.接続点を表示非表示切り替え?.(表示);
    }
}
