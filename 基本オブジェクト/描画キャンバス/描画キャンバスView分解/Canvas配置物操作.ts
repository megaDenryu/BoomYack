import { MouseEventData, Px2DVector, Px長さ, ビューポート座標値, 描画座標点 } from "SengenUI/index";
import { 配置物追加コマンド, 配置物削除コマンド } from "../../キャンバス操作/コマンドリポジトリ/具体的なコマンド群";
import { Fudaba札検索ダイアログ } from "../../Fudaba連携/Fudaba札検索ダイアログ";
import { キャンバスID, なめらか曲線矢印ID, 折れ線矢印ID } from "../../ID";
import { 折れ線矢印VM } from "../../配置物";
import { なめらか曲線矢印VM } from "../../配置物/なめらか曲線矢印/なめらか曲線矢印VM";
import type { 付箋召喚ドラッグ対象 } from "../../配置物/付箋2/付箋召喚UI";
import type { 付箋集約 } from "../../配置物/付箋2/付箋集約";
import { キャンバスメタデータ } from "../データクラス";
import { CanvasView状態 } from "./CanvasView状態";

export class Canvas配置物操作 {
    public constructor(private readonly 状態: CanvasView状態) {}
    public deleteSelectedItem(): void {
        const items = [...this.状態.selectionManager.選択中配置物];
        if (!items.length) return;
        this.状態.commandRepository.executeAndPush(new 配置物削除コマンド(this.状態.model, items));
        this.状態.selectionManager.選択解除();
    }
    public 付箋召喚を開始する(text: string): 付箋召喚ドラッグ対象 {
        const 付箋 = this.自由テキスト付箋を生成する(描画座標点.fromNumbers(0, 0, this.状態.model.描画基準座標), text);
        this.状態.selectionManager.set選択中配置物(付箋);
        return { ドラッグ中: e => 付箋.view.ドラッグ移動処理(e) };
    }
    private 自由テキスト付箋を生成する(position: 描画座標点, text = ""): 付箋集約<描画座標点> {
        const item = this.状態.model.描画座標点でadd付箋(position, text);
        this.状態.commandRepository.push(new 配置物追加コマンド(this.状態.model, item));
        return item;
    }
    private event位置(e: MouseEvent): 描画座標点 {
        const p = new MouseEventData(e).position;
        return this.状態.座標変換.画面座標点を補正する(p.x, p.y).to描画座標点(this.状態.model.描画基準座標);
    }
    public addStickyNote(e: MouseEvent): void { this.自由テキスト付箋を生成する(this.event位置(e)); }
    public addTitledStickyNote(e: MouseEvent): void {
        const item = this.状態.model.描画座標点でタイトル付き付箋をadd(this.event位置(e));
        this.状態.commandRepository.push(new 配置物追加コマンド(this.状態.model, item));
    }
    public pasteFudabaCard(e: MouseEvent): void {
        this.状態.fudaba検索ダイアログ?.delete();
        const data = new MouseEventData(e);
        const pos = this.event位置(e);
        const viewport = this.状態.座標変換.viewportPointを補正する(data.position.x, data.position.y);
        const 閉じる = (): void => { this.状態.fudaba検索ダイアログ?.delete(); this.状態.fudaba検索ダイアログ = null; };
        this.状態.fudaba検索ダイアログ = new Fudaba札検索ダイアログ({
            position: ビューポート座標値.fromNumbers(viewport.x.値, viewport.y.値),
            fudabaAPIクライアント: this.状態.fudabaAPIクライアント,
            on選択: 札ID => {
                const item = this.状態.model.描画座標点で札参照付箋をadd(pos, 札ID);
                this.状態.commandRepository.push(new 配置物追加コマンド(this.状態.model, item));
            }, on閉じる: 閉じる,
        });
        this.状態.座標変換.ルート要素().appendChild(this.状態.fudaba検索ダイアログ.dom.element);
    }
    public addArrow(e: MouseEvent): void { this.矢印を追加する(e, false); }
    public addSmoothArrow(e: MouseEvent): void { this.矢印を追加する(e, true); }
    private 矢印を追加する(e: MouseEvent, なめらか: boolean): void {
        const 始点 = this.event位置(e);
        const 終点 = 始点.plus(new Px2DVector(new Px長さ(100), new Px長さ(0)));
        const item = なめらか
            ? this.状態.model.addなめらか曲線矢印(new なめらか曲線矢印VM(new なめらか曲線矢印ID(), 始点, 終点))
            : this.状態.model.add折れ線矢印(new 折れ線矢印VM(new 折れ線矢印ID(), 始点, [], 終点));
        this.状態.commandRepository.push(new 配置物追加コマンド(this.状態.model, item));
    }
    public setCanvasIdAndName(id: string, name: string): void { this.metadataを更新する(id, name); }
    public setCanvasId(id: string): void { this.metadataを更新する(id, this.状態.model.metadata.name); }
    private metadataを更新する(id: string, name: string): void {
        const old = this.状態.model.metadata;
        this.状態.options.canvasId = id;
        this.状態.model.metadata = キャンバスメタデータ.create(new キャンバスID(id), name, old.createdAt, new Date());
    }
}
