import { I描画空間, LV2HtmlComponentBase, Px2DVector, 描画基準座標, 描画座標点, 配置物座標点, 画面座標点 } from "SengenUI/index";

import { Iなめらか曲線矢印集約, Iなめらか曲線矢印シリアライズ可能, I接触点を教えてくれる人, I接触点登録先, Iドラッグ移動可能 } from "../../I配置物";
import { 始点State, 終点State } from "../折れ線矢印/折れ線矢印state";
import { なめらか曲線矢印View } from "./なめらか曲線矢印View";
import { なめらか曲線矢印VM } from "./なめらか曲線矢印VM";
import { 始点ハンドル } from "./なめらか曲線矢印始点ハンドル";
import { 終点ハンドル } from "./なめらか曲線矢印終点ハンドル";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { なめらか曲線矢印データ, 座標データ } from "../../描画キャンバス/データクラス";
import { 付箋ID, なめらか曲線矢印ID } from "../../ID";
import { I接続点親情報 } from "../矢印接続可能なもの/接続点";

/**
 * なめらか曲線矢印の集約。折れ線矢印集約と同じ接続点/選択/カスケード削除の
 * 仕組みに乗るが、中点・線分ハンドルを持たない(始点/終点の2ハンドルのみ)。
 * 曲線の制御点は集約が持たず、再描画のたびにView側で始点/終点から自動計算する
 * (曲線制御点.ts参照。設計2026-07-14の「制御点は自動計算でよい」方針)。
 */
export class なめらか曲線矢印集約<座標点T extends 配置物座標点> implements Iなめらか曲線矢印集約<座標点T>, Iなめらか曲線矢印シリアライズ可能 {
    public type: "なめらか曲線矢印" = "なめらか曲線矢印";
    public readonly view: なめらか曲線矢印View;
    public readonly 始点ハンドル: 始点ハンドル<座標点T>;
    public readonly 終点ハンドル: 終点ハンドル<座標点T>;
    private _i配置物選択機能集約: I配置物選択機能集約;
    private _id: なめらか曲線矢印ID;

    public onハンドルドラッグ開始?: () => void;
    public onハンドルドラッグ終了?: () => void;

    public constructor(
        vm: なめらか曲線矢印VM<座標点T>,
        i接触点を教えてくれる人: I接触点を教えてくれる人<座標点T>,
        i描画基準座標を持つ: I描画空間,
        i配置物選択機能集約: I配置物選択機能集約,
    ) {
        this._id = vm.配置物ID;
        this._i配置物選択機能集約 = i配置物選択機能集約;
        this.始点ハンドル = new 始点ハンドル(new 始点State(vm.start), this, i描画基準座標を持つ, i接触点を教えてくれる人, i配置物選択機能集約);
        this.終点ハンドル = new 終点ハンドル(new 終点State(vm.end), this, i描画基準座標を持つ, i接触点を教えてくれる人, i配置物選択機能集約);
        this.view = new なめらか曲線矢印View(this.始点ハンドル.view, this.終点ハンドル.view)
            .onClick((e) => {
                if (e.ctrlKey) {
                    this._i配置物選択機能集約.追加選択(this);
                    return;
                }
                this._i配置物選択機能集約.set選択中配置物(this);
            })
            .onHover(() => { this._i配置物選択機能集約.setホバー中配置物(this); });
        this.再描画();
    }

    判定(pos: Px2DVector): boolean {
        throw new Error("画面座標点の実装が必要です");
    }
    get 画面座標点(): 画面座標点 {
        throw new Error("画面座標点の実装が必要です");
    }

    public get衝突判定用矩形(): { 位置: 描画座標点; サイズ: Px2DVector } {
        const 始点 = this.始点ハンドル.描画座標点;
        const 終点 = this.終点ハンドル.描画座標点;
        const minX = Math.min(始点.px2DVector.x.値, 終点.px2DVector.x.値);
        const minY = Math.min(始点.px2DVector.y.値, 終点.px2DVector.y.値);
        const maxX = Math.max(始点.px2DVector.x.値, 終点.px2DVector.x.値);
        const maxY = Math.max(始点.px2DVector.y.値, 終点.px2DVector.y.値);

        const 位置 = 描画座標点.fromNumbers(minX, minY, 始点.描画基準座標);
        const サイズ = Px2DVector.fromNumbers(maxX - minX, maxY - minY);
        return { 位置, サイズ };
    }

    public 再描画(): void {
        this.始点ハンドル.render();
        this.終点ハンドル.render();
        this.view.pathを更新する(this.始点ハンドル.state.pos, this.終点ハンドル.state.pos);
    }

    public 選択された時の処理(): void {
        this.view.select();
    }

    public 選択解除された時の処理(): void {
        this.view.deselect();
    }

    public ホバーされたときの処理(): void {
        this.view.hover();
    }

    public ホバー解除されたときの処理(): void {
        this.view.unhover();
    }

    public 選択状態のzIndexにする(): void {
        this.view.選択状態のzIndexにする();
    }

    public 通常状態のzIndexにする(): void {
        this.view.通常状態のzIndexにする();
    }

    public toシリアライズデータ(): なめらか曲線矢印データ {
        return なめらか曲線矢印データ.create(
            this._id,
            座標データ.fromPx2DVector(this.始点ハンドル.state.pos.px2DVector),
            座標データ.fromPx2DVector(this.終点ハンドル.state.pos.px2DVector),
            this.始点ハンドル.get接続参照データ(),
            this.終点ハンドル.get接続参照データ()
        );
    }

    public updateStateFromData(data: なめらか曲線矢印データ, モデルの描画基準座標: 描画基準座標): void {
        this.始点ハンドル.setPosition(描画座標点.fromPx2DVector(data.start.toPx2DVector(), モデルの描画基準座標) as 座標点T);
        this.終点ハンドル.setPosition(描画座標点.fromPx2DVector(data.end.toPx2DVector(), モデルの描画基準座標) as 座標点T);
    }

    public get id(): なめらか曲線矢印ID { return this._id; }

    public get idString(): string { return this._id.id; }

    public ドラッグ移動対象を収集する(_除外view?: LV2HtmlComponentBase): Iドラッグ移動可能[] {
        return [this.始点ハンドル, this.終点ハンドル];
    }

    public get始点接続付箋ID(): 付箋ID | null {
        return this.始点ハンドル.接続点?.親配置物ID ?? null;
    }

    public get終点接続付箋ID(): 付箋ID | null {
        return this.終点ハンドル.接続点?.親配置物ID ?? null;
    }

    /**
     * 中点を持たないため、折れ線矢印集約の同名メソッドの「中点なし」分岐と同じロジックになる
     * (始点・終点それぞれの付箋の重心方向から最も成す角が小さい接続点を選び直す)。
     */
    public 始点と終点の付箋の接続点を最短のものに切り替える(): void {
        const 始点の付箋: I接続点親情報<座標点T> | undefined = this.始点ハンドル.接続点?.親interface;
        const 終点の付箋: I接続点親情報<座標点T> | undefined = this.終点ハンドル.接続点?.親interface;
        if (始点の付箋 == undefined || 終点の付箋 == undefined) { return; }
        if (始点の付箋 === 終点の付箋) { return; }
        const 最短ペア = 始点の付箋.矢印接続可能なもの.ほかの矢印接続可能な物と最も近い接続点のペアを取得する(終点の付箋.矢印接続可能なもの, {
            自分の現在の接続点: this.始点ハンドル.接続点 ?? undefined,
            相手の現在の接続点: this.終点ハンドル.接続点 ?? undefined
        });
        const 始点の最短接続点 = 最短ペア.自分の接続点;
        const 終点の最短接続点 = 最短ペア.相手の接続点;
        if (始点の最短接続点 !== this.始点ハンドル.接続点) { this.始点ハンドル.接続(始点の最短接続点); }
        if (終点の最短接続点 !== this.終点ハンドル.接続点) { this.終点ハンドル.接続(終点の最短接続点); }
    }

    public 接触判定対象を登録する(target: I接触点登録先): void {
        target.add配置物(this.始点ハンドル);
        target.add配置物(this.終点ハンドル);
    }
}
