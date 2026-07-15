import { Canvas座標Base, I描画空間, LV2HtmlComponentBase, Px2DVector, 画面座標点, 配置物座標点, 描画基準座標, 描画座標点, 配線ポート } from "SengenUI/index";
import { Iドラッグ移動可能, I折れ線矢印シリアライズ可能, I折れ線矢印集約, I接触点を教えてくれる人, I接触点登録先, I点ハンドル, I線分ハンドル, I矢印集約配線 } from "../../I配置物";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { 折れ線矢印データ } from "../../描画キャンバス/データクラス";
import { 付箋ID, 折れ線矢印ID } from "../../ID";
import { 始点ハンドル, 終点ハンドル, 線分ハンドル } from "./矢印集約";
import { 折れ線矢印View } from "./折れ線矢印View";
import { 折れ線矢印VM } from "./折れ線矢印VM";
import { 折れ線矢印を生成する } from "./折れ線矢印生成";
import { 中点を削除する, 中点を挿入する } from "./折れ線矢印中点編集";
import { 接続点を最短へ切り替える } from "./折れ線矢印接続最適化";
import { シリアライズする, 状態を復元する } from "./折れ線矢印永続化";
import { 衝突判定用矩形を取得する } from "./折れ線矢印領域";

export class 折れ線矢印集約<T extends Canvas座標Base<T> & 配置物座標点> implements I折れ線矢印集約<T>, I折れ線矢印シリアライズ可能 {
    public type: "折れ線矢印" = "折れ線矢印";
    public readonly view: 折れ線矢印View;
    public readonly 始点ハンドル: 始点ハンドル<T>;
    public readonly 終点ハンドル: 終点ハンドル<T>;
    public readonly 線分ハンドルリスト: 線分ハンドル<T>[];
    public readonly 点ハンドルリスト: I点ハンドル<T>[];
    private readonly _id: 折れ線矢印ID;
    private readonly _描画空間: I描画空間;
    private readonly _配線 = new 配線ポート<I矢印集約配線>("折れ線矢印集約");

    public constructor(vm: 折れ線矢印VM<T>, 接触点提供者: I接触点を教えてくれる人<T>, 描画空間: I描画空間, 選択機能: I配置物選択機能集約) {
        this._id = vm.配置物ID;
        this._描画空間 = 描画空間;
        const 構造 = 折れ線矢印を生成する(vm, this, 接触点提供者, 描画空間, 選択機能);
        this.始点ハンドル = 構造.始点;
        this.終点ハンドル = 構造.終点;
        this.点ハンドルリスト = 構造.点;
        this.線分ハンドルリスト = 構造.線分;
        this.view = 構造.view;
    }

    public 配線する(配線: I矢印集約配線): this { this._配線.配線する(配線); return this; }
    public ハンドルドラッグ開始を通知する(): void { this._配線.先.onハンドルドラッグ開始(); }
    public ハンドルドラッグ終了を通知する(): void { this._配線.先.onハンドルドラッグ終了(); }
    public 判定(_pos: Px2DVector): boolean { throw new Error("画面座標点の実装が必要です"); }
    public get 画面座標点(): 画面座標点 { throw new Error("画面座標点の実装が必要です"); }
    public get衝突判定用矩形(): { 位置: 描画座標点; サイズ: Px2DVector } { return 衝突判定用矩形を取得する(this.点ハンドルリスト); }
    public get点ハンドルByIndex(index: number): I点ハンドル<T> | null { return this.点ハンドルリスト[index] || null; }
    public get線分ハンドルByIndex(index: number): I線分ハンドル<T> | null { return this.線分ハンドルリスト[index] || null; }
    public getLast線分ハンドル(): I線分ハンドル<T> { return this.線分ハンドルリスト.at(-1)!; }
    public insert中点(index: number, pos: T): this { 中点を挿入する(this, this._描画空間, index, pos); return this; }
    public delete中点(index: number): this { 中点を削除する(this, this._描画空間, index); return this; }
    public 再描画(): void { this.点ハンドルリスト.forEach(x => x.render()); this.線分ハンドルリスト.forEach(x => x.render()); }
    public 選択された時の処理(): void { this.view.select(); }
    public 選択解除された時の処理(): void { this.view.deselect(); }
    public ホバーされたときの処理(): void { this.view.hover(); }
    public ホバー解除されたときの処理(): void { this.view.unhover(); }
    public 選択状態のzIndexにする(): void { this.view.選択状態のzIndexにする(); }
    public 通常状態のzIndexにする(): void { this.view.通常状態のzIndexにする(); }
    public toシリアライズデータ(): 折れ線矢印データ { return シリアライズする(this._id, this.始点ハンドル, this.終点ハンドル, this.点ハンドルリスト); }
    public updateStateFromData(data: 折れ線矢印データ, 基準: 描画基準座標): void { 状態を復元する(this, data, 基準); }
    public get id(): 折れ線矢印ID { return this._id; }
    public get idString(): string { return this._id.id; }
    public ドラッグ移動対象を収集する(_除外view?: LV2HtmlComponentBase): Iドラッグ移動可能[] { return [...this.点ハンドルリスト]; }
    public get始点接続付箋ID(): 付箋ID | null { return this.始点ハンドル.接続点?.親配置物ID ?? null; }
    public get終点接続付箋ID(): 付箋ID | null { return this.終点ハンドル.接続点?.親配置物ID ?? null; }
    public 始点と終点の付箋の接続点を最短のものに切り替える(): void { 接続点を最短へ切り替える(this); }
    public 接触判定対象を登録する(target: I接触点登録先): void { target.add配置物(this.始点ハンドル); target.add配置物(this.終点ハンドル); }
}
