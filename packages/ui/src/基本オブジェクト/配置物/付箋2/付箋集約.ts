import { Canvas座標Base, LV2HtmlComponentBase, Px2DVector, 配置物座標点, 描画座標点 } from "SengenUI/index";
import { Iドラッグ移動可能, I付箋VM, I付箋シリアライズ可能, I付箋集約, I接触点登録先, I選択可能配置物 } from "../../I配置物";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { 付箋データ } from "../../描画キャンバス/データクラス";
import { 付箋ID } from "../../ID";
import { 接続点, I接続点親情報 } from "../矢印接続可能なもの/接続点";
import { 矢印接続可能なもの, 矢印接続可能なもの依存関係 } from "../矢印接続可能なもの/矢印接続可能なもの";
import { 折れ線矢印集約 } from "../折れ線矢印";
import { 付箋設定状態 } from "../設定パネル";
import { 付箋選択状態, 自動リサイズ付箋View, 自動リサイズ付箋Viewオプション, 自動リサイズ付箋用コンテキストメニュー依存関係 } from "./自動リサイズ付箋View";
import { 付箋View配線を作る, 付箋をシリアライズする, 別の付箋へ矢印を作る } from "./付箋集約操作";

export class 付箋集約<T extends Canvas座標Base<T> & 配置物座標点>
    implements I付箋集約, I選択可能配置物, I付箋シリアライズ可能, I接続点親情報<T> {
    public readonly type = "付箋" as const;
    public readonly view: 自動リサイズ付箋View<T>;
    public readonly vm!: I付箋VM;
    private _setting = 付箋設定状態.create();

    public constructor(
        options: 自動リサイズ付箋Viewオプション<T>, arrowDep: 矢印接続可能なもの依存関係<T>,
        id: 付箋ID, menuDep: 自動リサイズ付箋用コンテキストメニュー依存関係,
    ) {
        const selection = arrowDep.i配置物選択機能集約;
        this.view = new 自動リサイズ付箋View(options, arrowDep, id, menuDep)
            .配線する(付箋View配線を作る(options, selection, () => this));
        this.設定を適用(this._setting);
    }

    public get 配置物ID(): 付箋ID { return this.view.配置物ID; }
    public get id(): 付箋ID { return this.view.配置物ID; }
    public get idString(): string { return this.id.id; }
    public get text(): string { return this.view.text; }
    public get 描画座標点(): 描画座標点 { return this.view.position.to描画座標点(); }
    public get size(): Px2DVector { return this.view.getSize(); }
    public get 矢印接続可能なもの(): 矢印接続可能なもの<T> { return this.view.矢印接続可能なもの; }
    public get 接続点リスト(): Iterable<接続点<T>> { return this.矢印接続可能なもの.接続点リスト(); }
    public get衝突判定用矩形(): { 位置: 描画座標点; サイズ: Px2DVector } { const x = this.view.get衝突判定用矩形(); return { 位置: x.位置.to描画座標点(), サイズ: x.サイズ }; }

    public setText(text: string): void { this.view.setText(text); }
    public 位置を設定(pos: T): void { this.view.位置を設定(pos); this.view.update接続点座標(); }
    public 再描画(): void { this.view.update接続点座標(); this.view.再描画(); }
    public 選択された時の処理(): void { this._表示状態(付箋選択状態.選択, true); }
    public 選択解除された時の処理(): void { this._表示状態(付箋選択状態.なし, false); }
    public ホバーされたときの処理(): void { this._表示状態(付箋選択状態.ホバー, true); }
    public ホバー解除されたときの処理(): void { this._表示状態(付箋選択状態.なし, false); }
    public 接続点を表示非表示切り替え(show: boolean): void { this._表示状態(show ? 付箋選択状態.矢印選択 : 付箋選択状態.なし, show); }
    private _表示状態(state: 付箋選択状態, show: boolean): void { show ? this.矢印接続可能なもの.アニメーションさせながらshow() : this.矢印接続可能なもの.アニメーションさせながらhide(); this.view.set選択状態(state); }

    public 選択状態のzIndexにする(): void { this.view.選択状態のzIndexにする(); }
    public 通常状態のzIndexにする(): void { this.view.通常状態のzIndexにする(); }
    public toシリアライズデータ(): 付箋データ { return 付箋をシリアライズする(this.view, this._setting); }
    public ドラッグ移動対象を収集する(exclude?: LV2HtmlComponentBase): Iドラッグ移動可能[] { return exclude === this.view ? [] : [this.view]; }
    public 接続点から矢印を作る(_direction: "上" | "下" | "左" | "右"): 折れ線矢印集約<T> { return this.矢印接続可能なもの.接続点_上.矢印作成(); }
    public 別の付箋へ矢印を作る(to: 付箋集約<T>): 折れ線矢印集約<T> { return 別の付箋へ矢印を作る(this, to); }
    public get設定状態(): 付箋設定状態 { return this._setting; }
    public 設定を適用(s: 付箋設定状態): void { this._setting = s; this.view.設定を適用(s); }
    public 接触判定対象を登録する(target: I接触点登録先): void { target.add接続点リスト(this.接続点リスト); }
}
