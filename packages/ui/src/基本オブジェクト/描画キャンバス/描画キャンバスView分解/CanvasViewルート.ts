import { div, span, DivC, Drag中値, MouseEventData, PointerWife } from "SengenUI/index";
import { micIcon } from "OneONetUIComponents/Svg/Icons";
import { 配置物zIndex } from "../../I配置物";
import { 多段格子コンテキストメニュー } from "../../キャンバス操作/多段格子コンテキストメニュー/多段格子コンテキストメニュー";
import { Iコンテキストメニュー } from "../../キャンバス操作/円状コンテキストメニュー/円状コンテキストメニュー";
import { キャンバスコンテナ, 描画キャンバスView, 配置物コンテナ, 録音インジケータ } from "./style.css";
import { CanvasView状態 } from "./CanvasView状態";
import { Canvas配置物操作 } from "./Canvas配置物操作";
import { Canvas表示操作 } from "./Canvas表示操作";
import { Canvasキーボード操作 } from "./Canvasキーボード操作";
import { メニュー項目を生成する } from "./Canvasメニュー項目";

export function キャンバスルートを構築する(状態: CanvasView状態, 配置物操作: Canvas配置物操作,
    表示: Canvas表示操作, key: Canvasキーボード操作, onDrop: (e: DragEvent) => Promise<void> | undefined): DivC {
    const items = メニュー項目を生成する(状態, 配置物操作, key);
    let container: DivC | null = null;
    const canvas = div({ class: 描画キャンバスView }).setStyleCSS({
        position: "absolute", top: "0", left: "0", width: "100%", height: "100%", zIndex: 配置物zIndex.キャンバス.描画キャンバス,
    }).tap(self => {
        状態.mouseWife = new PointerWife(self).ドラッグ連動登録({
            onドラッグ開始: () => {}, onドラッグ中: (e: Drag中値) => 表示.canvasDrag(e), onドラッグ終了: e => 表示.canvasDragEnd(e),
        }).onPinchZoom((ratio, x, y) => 表示.pinchZoom(ratio, x, y));
    }).addDivEventListener("contextmenu", (e: MouseEvent) => {
        e.preventDefault();
        const p = new MouseEventData(e).position;
        const pos = 状態.座標変換.viewportPointを補正する(p.x, p.y);
        状態.menu!.表示({ x: pos.x.値, y: pos.y.値 });
    }).onLongPress(p => {
        const pos = 状態.座標変換.viewportPointを補正する(p.x, p.y);
        状態.menu!.表示({ x: pos.x.値, y: pos.y.値 });
    }).addDivEventListener("click", () => {
        container?.focus({ preventScroll: true });
        状態.contextMenuContainer.すべてのコンテキストメニューを非表示にする();
        状態.selectionManager.選択解除();
        状態.selectionManager.ホバー解除();
    });
    canvas.addDivEventListener("dragenter", (e: DragEvent) => e.preventDefault());
    canvas.addDivEventListener("dragover", (e: DragEvent) => e.preventDefault());
    canvas.addDivEventListener("dragleave", (e: DragEvent) => e.preventDefault());
    canvas.addDivEventListener("drop", async (e: DragEvent) => { e.preventDefault(); console.log("CanvasView drop detected", e); await onDrop(e); });
    const placement = div({ class: 配置物コンテナ }).setStyleCSS({
        zIndex: 配置物zIndex.キャンバス.配置物コンテナ, position: "absolute", top: "0", left: "0", width: "10px", height: "10px",
    }).tap(self => { 状態.配置物コンテナ = self; });
    const menu = 状態.contextMenuContainer.tap(self => self.コンテキストメニュー追加(new 多段格子コンテキストメニュー({
        mode: "clickable", opacity: 0.85, showCenterButton: false, layer1Items: items.layer1, layer2Items: items.layer2,
    }).tap((x: Iコンテキストメニュー) => { 状態.menu = x; }))).zIndex(配置物zIndex.キャンバス.コンテキストメニューコンテナ);
    const recording = div({ class: 録音インジケータ }).childs([micIcon(16, "white"), span({ text: "録音中..." })]).setStyleCSS({
        display: "none", alignItems: "center", gap: "8px", position: "absolute", bottom: "20px", right: "20px",
        backgroundColor: "rgba(231, 76, 60, 0.9)", color: "white", padding: "8px 16px", borderRadius: "20px",
        fontWeight: "bold", boxShadow: "0 4px 6px rgba(0,0,0,0.3)", zIndex: 配置物zIndex.キャンバス.コンテキストメニューコンテナ,
        pointerEvents: "none", animation: "pulse 1.5s infinite",
    }).tap(self => { 状態.recordingIndicator = self; });
    return div({ class: キャンバスコンテナ }).setTabIndex(0).tap(x => { container = x; })
        .addDivEventListener("keydown", e => { void key.handleCanvasKeyDown(e); }).childs([canvas, placement, menu, recording]);
}
