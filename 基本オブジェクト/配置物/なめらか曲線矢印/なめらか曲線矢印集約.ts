import { Canvas座標Base, I描画空間, LV2HtmlComponentBase, Px2DVector, 画面座標点, 配置物座標点, 描画基準座標, 描画座標点 } from "SengenUI/index";
import { Iなめらか曲線矢印集約, Iなめらか曲線矢印シリアライズ可能, I接触点を教えてくれる人, I接触点登録先, Iドラッグ移動可能 } from "../../I配置物";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { なめらか曲線矢印データ } from "../../描画キャンバス/データクラス";
import { なめらか曲線矢印ID, 付箋ID } from "../../ID";
import { 始点State, 終点State } from "../折れ線矢印/折れ線矢印state";
import { 曲線制御点 } from "./曲線制御点";
import { なめらか曲線矢印View } from "./なめらか曲線矢印View";
import { なめらか曲線矢印VM } from "./なめらか曲線矢印VM";
import { 始点ハンドル } from "./なめらか曲線矢印始点ハンドル";
import { 終点ハンドル } from "./なめらか曲線矢印終点ハンドル";
import { なめらか曲線矢印中間点ハンドル } from "./なめらか曲線矢印中間点ハンドル";
import { なめらか曲線矢印中間点管理 } from "./なめらか曲線矢印中間点管理";
import { 曲線の衝突判定用矩形, 最短の接続点へ切り替える } from "./なめらか曲線矢印計算";
import { 曲線矢印データを反映する, 曲線矢印をシリアライズする } from "./なめらか曲線矢印データ操作";

export class なめらか曲線矢印集約<T extends Canvas座標Base<T> & 配置物座標点>
    implements Iなめらか曲線矢印集約<T>, Iなめらか曲線矢印シリアライズ可能 {
    public readonly type = "なめらか曲線矢印" as const;
    public readonly view: なめらか曲線矢印View;
    public readonly 始点ハンドル: 始点ハンドル<T>;
    public readonly 終点ハンドル: 終点ハンドル<T>;
    private readonly _middle: なめらか曲線矢印中間点管理<T>;
    public onハンドルドラッグ開始?: () => void;
    public onハンドルドラッグ終了?: () => void;

    public constructor(vm: なめらか曲線矢印VM<T>, contacts: I接触点を教えてくれる人<T>,
        space: I描画空間, selection: I配置物選択機能集約) {
        this._id = vm.配置物ID;
        this.始点ハンドル = new 始点ハンドル(new 始点State(vm.start), this, space, contacts, selection);
        this.終点ハンドル = new 終点ハンドル(new 終点State(vm.end), this, space, contacts, selection);
        this.view = new なめらか曲線矢印View(this.始点ハンドル.view, this.終点ハンドル.view)
            .配線する({
                on選択: e => { if (e.ctrlKey) selection.追加選択(this); else selection.set選択中配置物(this); },
                onHover: () => selection.setホバー中配置物(this),
                on曲線右クリック: e => { e.preventDefault(); this.曲線上に中間点ハンドルを生成する(e); },
            });
        this._middle = new なめらか曲線矢印中間点管理(this, space, this.view);
        this._middle.初期化する(vm.middlePoints);
        this.再描画();
    }
    private readonly _id: なめらか曲線矢印ID;
    public get 中間点ハンドルリスト(): readonly なめらか曲線矢印中間点ハンドル<T>[] { return this._middle.handles; }
    public get id(): なめらか曲線矢印ID { return this._id; }
    public get idString(): string { return this._id.id; }
    public 判定(_pos: Px2DVector): boolean { throw new Error("画面座標点の実装が必要です"); }
    public get 画面座標点(): 画面座標点 { throw new Error("画面座標点の実装が必要です"); }
    public get衝突判定用矩形(): { 位置: 描画座標点; サイズ: Px2DVector } {
        return 曲線の衝突判定用矩形(
            this.始点ハンドル.描画座標点, this.終点ハンドル.描画座標点, this._middle.positions);
    }
    public 再描画(): void {
        this.始点ハンドル.render(); this.終点ハンドル.render(); this._middle.render();
        const start = this.始点ハンドル.state.pos;
        const end = this.終点ハンドル.state.pos;
        this.view.pathを更新する(start, end, this._middle.positions);
        this.終点ハンドル.view.回転角度を設定(
            曲線制御点.終点の接線角度を計算する(start, end, this._middle.positions));
    }
    public 曲線上に中間点ハンドルを生成する(e: MouseEvent): void {
        this._middle.生成する(this.始点ハンドル.state.pos, this.終点ハンドル.state.pos,
            this.view.曲線ローカル座標を取得する(e));
    }
    public 選択された時の処理(): void { this.view.select(); }
    public 選択解除された時の処理(): void { this.view.deselect(); }
    public ホバーされたときの処理(): void { this.view.hover(); }
    public ホバー解除されたときの処理(): void { this.view.unhover(); }
    public 選択状態のzIndexにする(): void { this.view.選択状態のzIndexにする(); }
    public 通常状態のzIndexにする(): void { this.view.通常状態のzIndexにする(); }
    public toシリアライズデータ(): なめらか曲線矢印データ {
        return 曲線矢印をシリアライズする(
            this._id, this.始点ハンドル, this.終点ハンドル, this._middle.positions);
    }
    public updateStateFromData(data: なめらか曲線矢印データ, base: 描画基準座標): void {
        this._middle.置換する(曲線矢印データを反映する(
            data, base, this.始点ハンドル, this.終点ハンドル));
    }
    public ドラッグ移動対象を収集する(_exclude?: LV2HtmlComponentBase): Iドラッグ移動可能[] { return this._middle.ドラッグ対象へ追加する([this.始点ハンドル, this.終点ハンドル]); }
    public get始点接続付箋ID(): 付箋ID | null { return this.始点ハンドル.接続点?.親配置物ID ?? null; }
    public get終点接続付箋ID(): 付箋ID | null { return this.終点ハンドル.接続点?.親配置物ID ?? null; }
    public 始点と終点の付箋の接続点を最短のものに切り替える(): void { 最短の接続点へ切り替える(this.始点ハンドル, this.終点ハンドル); }
    public 接触判定対象を登録する(target: I接触点登録先): void { target.add配置物(this.始点ハンドル); target.add配置物(this.終点ハンドル); }
}
