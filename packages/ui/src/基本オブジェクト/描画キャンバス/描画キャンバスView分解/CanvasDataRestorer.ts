import { 描画座標点, 画面座標点 } from "SengenUI/index";
import { 描画キャンバスデータ, 接続参照データ } from "../データクラス";
import { 付箋集約 } from "../../配置物/付箋2/付箋集約";
import { 折れ線矢印集約 } from "../../配置物";
import { なめらか曲線矢印集約 } from "../../配置物/なめらか曲線矢印/なめらか曲線矢印集約";
import { 接続点 } from "../../配置物/矢印接続可能なもの/接続点";
import { CanvasGraphModel } from "./CanvasGraphModel";
import { CanvasItemFactory } from "./CanvasItemFactory";

type 復元マップ = {
    notes: Map<string, 付箋集約<描画座標点>>;
    foldArrows: Map<string, 折れ線矢印集約<描画座標点>>;
    smoothArrows: Map<string, なめらか曲線矢印集約<描画座標点>>;
};

export const キャンバスデータを復元する = (
    model: CanvasGraphModel,
    factory: CanvasItemFactory,
    data: 描画キャンバスデータ
): void => {
    model.全配置物クリア();
    const origin = 画面座標点.fromPx2DVector(data.描画原点.toPx2DVector());
    model.update描画基準座標原点(origin);
    const maps: 復元マップ = { notes: new Map(), foldArrows: new Map(), smoothArrows: new Map() };
    for (const itemData of data.配置物リスト) {
        const item = factory.createItemFromData(itemData);
        if (!item) continue;
        model.add配置物(item);
        if (itemData.type === "付箋") maps.notes.set(itemData.id.id, item as 付箋集約<描画座標点>);
        else if (itemData.type === "折れ線矢印") maps.foldArrows.set(itemData.id.id, item as 折れ線矢印集約<描画座標点>);
        else if (itemData.type === "なめらか曲線矢印") maps.smoothArrows.set(itemData.id.id, item as なめらか曲線矢印集約<描画座標点>);
    }
    for (const itemData of data.配置物リスト) {
        if (itemData.type === "折れ線矢印") {
            const arrow = maps.foldArrows.get(itemData.id.id);
            if (arrow) 矢印を接続する(arrow, itemData.startRef, itemData.endRef, maps.notes);
        } else if (itemData.type === "なめらか曲線矢印") {
            const arrow = maps.smoothArrows.get(itemData.id.id);
            if (arrow) 矢印を接続する(arrow, itemData.startRef, itemData.endRef, maps.notes);
        }
    }
};

type 接続対象矢印 = 折れ線矢印集約<描画座標点> | なめらか曲線矢印集約<描画座標点>;

const 矢印を接続する = (
    arrow: 接続対象矢印,
    startRef: 接続参照データ | null | undefined,
    endRef: 接続参照データ | null | undefined,
    notes: Map<string, 付箋集約<描画座標点>>
): void => {
    const start = startRef && 接続点を得る(startRef, notes);
    const end = endRef && 接続点を得る(endRef, notes);
    if (start) arrow.始点ハンドル.接続(start);
    if (end) arrow.終点ハンドル.接続(end);
};

const 接続点を得る = (
    ref: 接続参照データ,
    notes: Map<string, 付箋集約<描画座標点>>
): 接続点<描画座標点> | null => {
    const note = notes.get(ref.配置物ID.id);
    if (!note) return null;
    for (const point of note.接続点リスト) {
        if (point.接続位置 === ref.接続位置) return point;
    }
    return null;
};
