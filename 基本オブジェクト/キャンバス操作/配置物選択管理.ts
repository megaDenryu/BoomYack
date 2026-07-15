import { Canvas座標Base, Drag中値, 配置物座標点 } from "SengenUI/index";
import { I配置物集約 } from "../I配置物";
import { I配置物選択機能集約用のキャンバス機能 } from "../描画キャンバス/描画キャンバスView分解/CanvasView";
import { まとめて移動サービス } from "../描画キャンバス/描画キャンバスView分解/まとめて移動サービス";
import { 自動リサイズ付箋View } from "../配置物/付箋2/自動リサイズ付箋View";

export interface I配置物選択機能集約 {
    readonly 選択中配置物: I配置物集約[];
    set選択中配置物(配置物: I配置物集約): void;
    追加選択(配置物: I配置物集約): void;
    全て選択(全配置物: I配置物集約[]): void;
    setホバー中配置物(配置物: I配置物集約): void;
    選択解除(): void;
    ホバー解除(): void;
    全ての接続点を表示非表示切り替え(表示する: boolean): void;
    まとめて移動<T extends Canvas座標Base<T> & 配置物座標点>(e: Drag中値, view: 自動リサイズ付箋View<T>): void;
}

export class 配置物選択機能集約 implements I配置物選択機能集約 {
    public ホバー中配置物: I配置物集約 | null = null;
    public 選択中配置物: I配置物集約[] = [];

    public constructor(
        private readonly _canvas: I配置物選択機能集約用のキャンバス機能,
        private readonly _まとめて移動サービス: まとめて移動サービス,
        private readonly _onホバー対象変更: () => void = () => {},
    ) {}

    public set選択中配置物(配置物: I配置物集約): void {
        if (this.ホバー中配置物 === 配置物) this.ホバー解除();
        this.選択解除();
        this.選択中配置物 = [配置物];
        配置物.選択された時の処理();
        配置物.選択状態のzIndexにする();
    }

    public 追加選択(配置物: I配置物集約): void {
        if (this.選択中配置物.includes(配置物)) return;
        if (this.ホバー中配置物 === 配置物) this.ホバー解除();
        this.選択中配置物.push(配置物);
        配置物.選択された時の処理();
        配置物.選択状態のzIndexにする();
    }

    public 全て選択(全配置物: I配置物集約[]): void {
        this.選択解除();
        for (const 配置物 of 全配置物) this.追加選択(配置物);
    }

    public setホバー中配置物(配置物: I配置物集約): void {
        if (this.選択中配置物.includes(配置物) || this.ホバー中配置物 === 配置物) return;
        this._onホバー対象変更();
        this.ホバー中配置物?.ホバー解除されたときの処理();
        this.ホバー中配置物 = 配置物;
        配置物.ホバーされたときの処理();
    }

    public 選択解除(): void {
        for (const 配置物 of this.選択中配置物) {
            配置物.通常状態のzIndexにする();
            配置物.選択解除された時の処理();
        }
        this.選択中配置物 = [];
    }

    public ホバー解除(): void {
        this._onホバー対象変更();
        this.ホバー中配置物?.ホバー解除されたときの処理();
        this.ホバー中配置物 = null;
    }

    public 全ての接続点を表示非表示切り替え(表示する: boolean): void {
        this._canvas.全ての接続点を表示非表示切り替え(表示する);
        for (const 配置物 of this.選択中配置物) {
            配置物.選択された時の処理();
            配置物.選択状態のzIndexにする();
        }
        this.ホバー中配置物?.ホバーされたときの処理();
    }

    public まとめて移動<T extends Canvas座標Base<T> & 配置物座標点>(e: Drag中値, view: 自動リサイズ付箋View<T>): void {
        this._まとめて移動サービス.配置物をまとめて移動処理(e, this.選択中配置物, view);
    }
}
