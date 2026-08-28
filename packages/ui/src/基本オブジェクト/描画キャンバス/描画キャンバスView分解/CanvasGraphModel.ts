import { I描画空間, Px2DVector, 描画基準座標, 描画座標点, 画面座標点 } from "SengenUI/index";
import { Iグラフ配置先, I配置物リポジトリ } from "../../配置物リポジトリ";
import {
    I接触点を教えてくれる人, I接続点, I配置物集約, is始終点矢印集約,
    リスト配置可能, 接触判定可能な点 } from "../../I配置物";
import { 折れ線矢印VM, 折れ線矢印集約 } from "../../配置物";
import { なめらか曲線矢印VM } from "../../配置物/なめらか曲線矢印/なめらか曲線矢印VM";
import { なめらか曲線矢印集約 } from "../../配置物/なめらか曲線矢印/なめらか曲線矢印集約";
import { 付箋集約 } from "../../配置物/付箋2/付箋集約";
import { 接続点 } from "../../配置物/矢印接続可能なもの/接続点";
import { キャンバスID } from "../../ID";
import { キャンバスメタデータ } from "../データクラス";
import { Canvas配置物生成 } from "./Canvas配置物生成";
import { Canvas接触点管理 } from "./Canvas接触点管理";
import { GraphEvent, ICanvasItemFactory } from "./CanvasGraphModel契約";

export type { GraphEvent, ICanvasItemFactory } from "./CanvasGraphModel契約";
export class CanvasGraphModel implements I描画空間, I配置物リポジトリ<描画座標点>,
    I接触点を教えてくれる人<描画座標点>, リスト配置可能<描画座標点>, Iグラフ配置先 {
    public 配置物リスト: I配置物集約[] = [];
    public readonly 描画基準座標: 描画基準座標;
    public metadata: キャンバスメタデータ;
    private readonly listeners = new Set<(event: GraphEvent) => void>();
    private readonly 接触点管理: Canvas接触点管理;
    private readonly 配置物生成: Canvas配置物生成;

    public constructor() {
        this.描画基準座標 = new 描画基準座標(new 画面座標点(Px2DVector.fromNumbers(0, 0)));
        this.接触点管理 = new Canvas接触点管理();
        this.metadata = キャンバスメタデータ.create(new キャンバスID("default"), "New Canvas");
        this.配置物生成 = new Canvas配置物生成(
            this.描画基準座標, () => this.配置物リスト, item => this.add配置物(item)
        );
    }

    public setFactory(factory: ICanvasItemFactory): void { this.配置物生成.setFactory(factory); }
    public subscribe(listener: (event: GraphEvent) => void): () => void {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }
    public notify(event: GraphEvent): void { this.listeners.forEach(listener => listener(event)); }

    public update拡縮率(delta: number, center: 画面座標点): void {
        this.描画基準座標.拡縮率 = delta;
        this.描画基準座標.拡縮中心点 = center;
        this.notify({ type: "UPDATED" });
    }
    public update描画基準座標原点(pos: 画面座標点): void {
        this.描画基準座標.描画原点 = pos;
        this.notify({ type: "UPDATED" });
    }

    public add付箋(pos: Px2DVector, text?: string): 付箋集約<描画座標点> { return this.配置物生成.add付箋(pos, text); }
    public 描画座標点でadd付箋(pos: 描画座標点, text?: string, id?: string): 付箋集約<描画座標点> {
        return this.配置物生成.描画座標点でadd付箋(pos, text, id);
    }
    public 描画座標点でタイトル付き付箋をadd(pos: 描画座標点, id?: string): 付箋集約<描画座標点> {
        return this.配置物生成.タイトル付き付箋をadd(pos, id);
    }
    public 描画座標点で札参照付箋をadd(pos: 描画座標点, 札ID: string, id?: string): 付箋集約<描画座標点> {
        return this.配置物生成.札参照付箋をadd(pos, 札ID, id);
    }
    public add折れ線矢印(vm: 折れ線矢印VM<描画座標点>): 折れ線矢印集約<描画座標点> { return this.配置物生成.折れ線矢印をadd(vm); }
    public addなめらか曲線矢印(vm: なめらか曲線矢印VM<描画座標点>): なめらか曲線矢印集約<描画座標点> {
        return this.配置物生成.なめらか曲線矢印をadd(vm);
    }

    public add配置物(item: I配置物集約 | 接触判定可能な点): void {
        if (!("接触判定対象を登録する" in item)) return this.接触点管理.add配置物(item);
        this.配置物リスト.push(item);
        item.接触判定対象を登録する(this.接触点管理);
        this.notify({ type: "ADDED", item });
    }

    public remove配置物(item: I配置物集約): void {
        const index = this.配置物リスト.indexOf(item);
        if (index < 0) return;
        this.配置物リスト.splice(index, 1);
        const arrows = this.配置物リスト.filter(other => is始終点矢印集約<描画座標点>(other)
            && (other.get始点接続付箋ID()?.id === item.idString || other.get終点接続付箋ID()?.id === item.idString));
        for (const arrow of arrows) this.remove配置物(arrow);
        this.notify({ type: "REMOVED", item });
    }

    public 全配置物クリア(): void {
        const items = [...this.配置物リスト];
        this.配置物リスト = [];
        this.接触点管理.リセットする();
        items.forEach(item => this.notify({ type: "REMOVED", item }));
        this.notify({ type: "CLEARED" });
    }

    public 配置物再描画(): void { for (const item of this.配置物リスト) item.再描画(); }
    public 接触点を取得(pos: 描画座標点): 接触判定可能な点 | null { return this.接触点管理.接触点を取得(pos); }
    public 接続点を取得(pos: 描画座標点): I接続点<描画座標点> | null { return this.接触点管理.接続点を取得(pos); }
    public 未接続の点ハンドルを接続点と接続をtryする(point: 接続点<描画座標点>): void { this.接触点管理.未接続ハンドルを接続する(point); }
    public add接続点(point: 接続点<描画座標点>): void { this.接触点管理.add接続点(point); }
    public add配置物リスト(items: Iterable<接触判定可能な点>): void { this.接触点管理.add配置物リスト(items); }
    public add接続点リスト(points: Iterable<接続点<描画座標点>>): void { this.接触点管理.add接続点リスト(points); }
}
