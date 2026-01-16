import { Drag中値, 配置物座標点 } from "SengenUI/index";
import { Iドラッグ移動可能, I配置物集約 } from "BoomYack/基本オブジェクト/I配置物";
import { 折れ線矢印集約 } from "BoomYack/基本オブジェクト/配置物";
import { 矢印接続可能付箋Old } from "BoomYack/基本オブジェクト/配置物/付箋2/矢印接続可能付箋Old";
import { 自動リサイズ付箋View } from "BoomYack/基本オブジェクト/配置物/付箋2/自動リサイズ付箋View";
import { 始点ハンドル, 終点ハンドル } from "BoomYack/基本オブジェクト/配置物/折れ線矢印/矢印集約";




/**
 * 点ハンドルと付箋ハンドルをまとめて移動させる。
 * 
 */
export class まとめて移動サービス {

    public constructor() {
    }

    private 選択中の配置物からまとめて動かすIドラッグ移動可能を抽出<座標点T extends 配置物座標点>(選択中配置物: I配置物集約[],ドラッグしたコンポーネント: 自動リサイズ付箋View<座標点T>): Iドラッグ移動可能[] {
        const 配置物リスト: Iドラッグ移動可能[] = [];
        選択中配置物.forEach((配置物) => {
            if (配置物 instanceof 矢印接続可能付箋Old) {
                if (配置物.view === ドラッグしたコンポーネント) {return;}
                配置物リスト.push(配置物.view);

            } else if (配置物 instanceof 折れ線矢印集約) {
                配置物リスト.push(...配置物.点ハンドルリスト)
            }
        });
        return 配置物リスト;
    }

    private ドラッグ移動可能をまとめて移動処理(配置物リスト: Iドラッグ移動可能[], e: Drag中値): void {
        配置物リスト.forEach((配置物) => {
            配置物.ドラッグ移動処理(e);
        });

    }

    public 配置物をまとめて移動処理<座標点T extends 配置物座標点>(e: Drag中値, 選択中配置物: I配置物集約[], ドラッグしたコンポーネント: 自動リサイズ付箋View<座標点T>): void {
        const ドラッグ移動可能リスト = this.選択中の配置物からまとめて動かすIドラッグ移動可能を抽出(選択中配置物,ドラッグしたコンポーネント);
        this.ドラッグ移動可能をまとめて移動処理(ドラッグ移動可能リスト, e);
    }

}