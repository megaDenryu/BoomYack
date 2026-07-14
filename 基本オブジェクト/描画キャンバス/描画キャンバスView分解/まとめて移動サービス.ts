import { Canvas座標Base, Drag中値, 配置物座標点 } from "SengenUI/index";
import { Iドラッグ移動可能, I配置物集約 } from "BoomYack/基本オブジェクト/I配置物";
import { 自動リサイズ付箋View } from "BoomYack/基本オブジェクト/配置物/付箋2/自動リサイズ付箋View";

/**
 * 点ハンドルと付箋ハンドルをまとめて移動させる。
 * 
 */
export class まとめて移動サービス {

    public constructor() {
    }

    private 選択中の配置物からまとめて動かすIドラッグ移動可能を抽出<座標点T extends Canvas座標Base<座標点T> & 配置物座標点>(選択中配置物: I配置物集約[],ドラッグしたコンポーネント: 自動リサイズ付箋View<座標点T>): Iドラッグ移動可能[] {
        return 選択中配置物.flatMap((配置物) => 配置物.ドラッグ移動対象を収集する(ドラッグしたコンポーネント));
    }

    private ドラッグ移動可能をまとめて移動処理(配置物リスト: Iドラッグ移動可能[], e: Drag中値): void {
        配置物リスト.forEach((配置物) => {
            配置物.ドラッグ移動処理(e);
        });

    }

    public 配置物をまとめて移動処理<座標点T extends Canvas座標Base<座標点T> & 配置物座標点>(e: Drag中値, 選択中配置物: I配置物集約[], ドラッグしたコンポーネント: 自動リサイズ付箋View<座標点T>): void {
        const ドラッグ移動可能リスト = this.選択中の配置物からまとめて動かすIドラッグ移動可能を抽出(選択中配置物,ドラッグしたコンポーネント);
        this.ドラッグ移動可能をまとめて移動処理(ドラッグ移動可能リスト, e);
    }

}