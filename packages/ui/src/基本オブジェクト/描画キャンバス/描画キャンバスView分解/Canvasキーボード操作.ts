import { 配置物連結グラフ } from "../配置物グラフ/配置物連結グラフ";
import { CanvasView状態 } from "./CanvasView状態";
import { Canvas配置物操作 } from "./Canvas配置物操作";

export class Canvasキーボード操作 {
    public constructor(private readonly 状態: CanvasView状態, private readonly 配置物操作: Canvas配置物操作) {}
    public handleGlobalKeyDown(e: KeyboardEvent): void {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;
        if (e.key === "Delete") this.配置物操作.deleteSelectedItem();
        else if (e.key === "a" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.状態.selectionManager.全て選択(this.状態.model.配置物リスト);
        }
    }
    public async handleCanvasKeyDown(e: KeyboardEvent): Promise<void> {
        const key = e.key.toLowerCase();
        if (e.ctrlKey && !e.shiftKey && key === "c") { e.preventDefault(); this.copy(); }
        else if (e.ctrlKey && !e.shiftKey && key === "v") await this.状態.グラフ操作サービス.クリップボードから貼り付け(undefined, c => this.状態.commandRepository.push(c));
        else if (e.ctrlKey && !e.shiftKey && key === "z") { e.preventDefault(); this.状態.commandRepository.undo(); }
        else if (e.ctrlKey && e.shiftKey && key === "z") { e.preventDefault(); this.状態.commandRepository.redo(); }
        else if (e.ctrlKey && !e.shiftKey && key === "y") { e.preventDefault(); this.状態.commandRepository.redo(); }
    }
    public copy(): void {
        const items = this.状態.selectionManager.選択中配置物;
        if (items.length) this.状態.グラフ操作サービス.選択中の配置物をコピー(items);
    }
    public selectGraph(): void {
        const graphs: 配置物連結グラフ[] = this.状態.selectionManager.選択中配置物
            .map(item => this.状態.グラフ操作サービス.グラフを選択(item)).filter(g => g !== null);
        for (const graph of graphs) for (const item of graph.配置物集約リスト) this.状態.selectionManager.追加選択(item);
    }
}
