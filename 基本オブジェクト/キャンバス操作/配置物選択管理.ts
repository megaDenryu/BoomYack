import { Drag中値, 配置物座標点 } from "SengenUI/index";



import { I配置物集約 } from "../I配置物";
import { I配置物選択機能集約用のキャンバス機能 } from "../描画キャンバス/描画キャンバスView分解/CanvasView";
import { まとめて移動サービス } from "../描画キャンバス/描画キャンバスView分解/まとめて移動サービス";
import { 折れ線矢印集約 } from "../配置物";
import { 矢印接続可能付箋Old } from "../配置物/付箋2/矢印接続可能付箋Old";
import { 自動リサイズ付箋View } from "../配置物/付箋2/自動リサイズ付箋View";

export interface I配置物選択機能集約 {
    set選択中配置物(配置物: I配置物集約): void;
    追加選択(配置物: I配置物集約): void;
    setホバー中配置物(配置物: I配置物集約): void;
    選択解除(): void;
    ホバー解除(): void;
    全ての接続点を表示非表示切り替え(表示する: boolean): void;
    まとめて移動<座標点T extends 配置物座標点>(e: Drag中値, ドラッグしたコンポーネント: 自動リサイズ付箋View<座標点T>): void;
}

export class 配置物選択機能集約 implements I配置物選択機能集約 {
    // public ホバー中の付箋: 矢印接続可能付箋<any>| null = null;
    // public ホバー中矢印: 矢印集約<any>| null = null;
    // public 選択中付箋: 矢印接続可能付箋<any>| null = null;
    // public 選択中矢印: 矢印集約<any>| null = null;
    public ホバー中配置物: I配置物集約 | null = null;
    public 選択中配置物: I配置物集約[] = [];
    private _i配置物選択機能集約用のキャンバス機能 : I配置物選択機能集約用のキャンバス機能;
    private _選択物まとめて移動サービス : まとめて移動サービス;
    

    public constructor(
        i配置物選択機能集約用のキャンバス機能 : I配置物選択機能集約用のキャンバス機能,
        選択物まとめて移動サービス: まとめて移動サービス
    ) {
        this._i配置物選択機能集約用のキャンバス機能 = i配置物選択機能集約用のキャンバス機能;
        this._選択物まとめて移動サービス = 選択物まとめて移動サービス;
    }

    private On右クリック(e: MouseEvent): void {
        if (this.選択中配置物) {
            if (this.選択中配置物 instanceof 矢印接続可能付箋Old) {

            } else if (this.選択中配置物 instanceof 折れ線矢印集約) {

            }
        }
    }

    public set選択中配置物(配置物: I配置物集約): void {
        if (this.ホバー中配置物 === 配置物) { this.ホバー解除(); }
        this.選択中配置物.map((配置物) => {
                                配置物.通常状態のzIndexにする();
                                配置物.選択解除された時の処理();}
                            );
        this.選択中配置物 = [配置物];
        配置物.選択された時の処理();
        配置物.選択状態のzIndexにする();
    }

    public 追加選択(配置物: I配置物集約): void {
        if (this.選択中配置物.includes(配置物)) { return; }
        if (this.ホバー中配置物 === 配置物) { this.ホバー解除(); }
        this.選択中配置物.push(配置物);
        配置物.選択された時の処理();
        配置物.選択状態のzIndexにする();
    }

    public setホバー中配置物(配置物: I配置物集約): void {
        if (this.選択中配置物.includes(配置物)) { return; }
        this.ホバー中配置物?.ホバー解除されたときの処理();
        this.ホバー中配置物 = 配置物;
        this.ホバー中配置物.ホバーされたときの処理();
    }

    public 選択解除(): void {
        this.選択中配置物.map((配置物) => {
                                配置物.通常状態のzIndexにする();
                                配置物.選択解除された時の処理();}
                            );
        this.選択中配置物 = [];
    }

    public ホバー解除(): void {
        this.ホバー中配置物?.ホバー解除されたときの処理();
        this.ホバー中配置物 = null;
    }

    public 全ての接続点を表示非表示切り替え(表示する: boolean): void {
        this._i配置物選択機能集約用のキャンバス機能.全ての接続点を表示非表示切り替え(表示する);
        //選択中やホバー中の配置物はそのままにする
        if (this.選択中配置物.length > 0) {
            this.set選択中配置物(this.選択中配置物[0]);
            for (let i = 1; i < this.選択中配置物.length; i++) {
                this.追加選択(this.選択中配置物[i]);
            }
        }
        if (this.ホバー中配置物) {this.setホバー中配置物(this.ホバー中配置物);}
    }

    public まとめて移動<座標点T extends 配置物座標点>(e: Drag中値, ドラッグしたコンポーネント: 自動リサイズ付箋View<座標点T>): void {
        this._選択物まとめて移動サービス.配置物をまとめて移動処理(e,this.選択中配置物, ドラッグしたコンポーネント);
    }

}
