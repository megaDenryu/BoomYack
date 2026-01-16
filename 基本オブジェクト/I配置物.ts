import { Drag中値, LV2HtmlComponentBase, Px2DVector, 図形内座標点, 描画座標点, 配置物座標点 } from "SengenUI/index";
import { number } from "zod/v4";



import { I点state } from "./配置物/折れ線矢印/折れ線矢印state";
import { I点ハンドルView } from "./配置物/折れ線矢印/折れ線矢印View";
import { I接続点親情報, 接続点 } from "./配置物/矢印接続可能なもの/接続点";
import { 接続参照データ, 接続点位置, 配置物データ } from "./描画キャンバス/データクラス";
import { 付箋ID } from "./ID";

export type 配置物type = "折れ線矢印" | "まっすぐ矢印" | "なめらか曲線矢印" | "付箋" | "自動リサイズ付箋" | "グループミニキャンバス";

export interface Iシリアライズ可能配置物 {
    toシリアライズデータ(): 配置物データ;
}

export interface I選択可能配置物 {
    選択された時の処理(): void;
    選択解除された時の処理(): void;
    ホバーされたときの処理(): void;
    ホバー解除されたときの処理(): void;
    接続点を表示非表示切り替え?(表示する: boolean): void;
}

export interface I衝突判定可能 {
    get衝突判定用矩形(): { 位置: 描画座標点; サイズ: Px2DVector };
}

export interface I配置物集約 extends I選択可能配置物, Iシリアライズ可能配置物, I衝突判定可能 {
    type: 配置物type;
    readonly view: LV2HtmlComponentBase
    再描画(): void;
    選択状態のzIndexにする(): void;
    通常状態のzIndexにする(): void;
}

export interface 接触判定可能な点 {
    判定(pos: Px2DVector): boolean;
    描画座標点: 描画座標点;
}

export interface Iグループミニキャンバス集約 {
    readonly view: IグループミニキャンバスView;
    readonly vm: IグループミニキャンバスVM;
}

export interface IグループミニキャンバスVM {
}

export interface IグループミニキャンバスView {
}

export interface I付箋集約 extends I配置物集約 {
    type: "付箋";
    readonly view: I付箋View;
    readonly vm: I付箋VM;
}

export interface I付箋VM {
}

export interface I付箋View extends Iドラッグ移動可能,LV2HtmlComponentBase{
}

export interface I自動リサイズ付箋集約 extends I配置物集約 {
    type: "自動リサイズ付箋";
    readonly view: I自動リサイズ付箋View;
    readonly vm: I自動リサイズ付箋VM;
}

export interface I自動リサイズ付箋VM {
}

export interface I自動リサイズ付箋View extends LV2HtmlComponentBase {
}

export interface Iまっすぐ矢印集約 extends I配置物集約 {
    type: "まっすぐ矢印";
    readonly view: Iまっすぐ矢印View;
    readonly vm: Iまっすぐ矢印VM;
}

export interface Iまっすぐ矢印VM {
}

export interface Iまっすぐ矢印View extends LV2HtmlComponentBase {
}

export interface Iなめらか曲線矢印集約 extends I配置物集約 {
    type: "なめらか曲線矢印";
    readonly view: Iなめらか曲線矢印View;
    readonly vm: Iなめらか曲線矢印VM;
}

export interface Iなめらか曲線矢印VM {
}

export interface Iなめらか曲線矢印View extends LV2HtmlComponentBase {
}



export interface I点と線のリポジトリ<座標点T extends 配置物座標点> {
    get点ハンドルByIndex(index: number): I点ハンドル<座標点T> | null;
    get線分ハンドルByIndex(index: number): I線分ハンドル<座標点T> | null;
    insert中点(insertIndex: number, pos: 座標点T): this;
    delete中点(index: number): this;
}

export interface I点ハンドル<座標点T extends 配置物座標点> extends Iドラッグ移動可能{
    ドラッグ移動処理(e: Drag中値): this;
    render(): this;
    移動終了(e: Drag中値): void;
    move(diff: Px2DVector): this;
    移動開始(e: Drag中値): void;
    setPosition(pos: 配置物座標点): this
    state: I点state<座標点T>;
    view: I点ハンドルView;
    get next線分ハンドル(): I線分ハンドル<座標点T>| null;
    get prev線分ハンドル(): I線分ハンドル<座標点T>| null;
    get 描画座標点(): 描画座標点;
    index: number;
    親の折れ線矢印集約:I折れ線矢印集約<座標点T>;
}

export interface I接続点と接続可能 {

}

export interface I矢印集約<座標点T extends 配置物座標点> extends I配置物集約, I点と線のリポジトリ<座標点T> {
    type: "まっすぐ矢印";
}

export interface I線分ハンドル<座標点T extends 配置物座標点> extends Iドラッグ移動可能{
    ドラッグ移動処理(e: Drag中値): this;
    render(): this;
    set親の集約(親: I点と線のリポジトリ<座標点T>): void;
    set線分の位置(位置: number): void;
}

export interface I折れ線矢印VM {
}

export interface I折れ線矢印View extends LV2HtmlComponentBase {
}

export interface I折れ線矢印集約<座標点T extends 配置物座標点> extends I配置物集約, I点と線のリポジトリ<座標点T> {
    type: "折れ線矢印";
    始点と終点の付箋の接続点を最短のものに切り替える():void;
}



export interface I接触点を教えてくれる人<座標点T extends 配置物座標点> {
    接触点を取得(pos: 描画座標点):接触判定可能な点|null;
    接続点を取得(pos: 描画座標点): I接続点<座標点T>|null;
    未接続の点ハンドルを接続点と接続をtryする(接続点:接続点<座標点T>):void;

    add配置物(node:接触判定可能な点):void;
    add接続点(接続点: 接続点<座標点T>):void;

    
}

export interface リスト配置可能<座標点T extends 配置物座標点> {
    add配置物リスト(nodes: Iterable<接触判定可能な点>):void;
    add接続点リスト(接続点リスト: Iterable<接続点<座標点T>>):void;
}

export interface I接続点<座標点T extends 配置物座標点> {
    接続(点ハンドル: I点ハンドル<座標点T>): void;
    接続解除(点ハンドル: I点ハンドル<座標点T>): void;
    親interface: I接続点親情報<座標点T>;
    /** この接続点の親配置物ID */
    get 親配置物ID(): 付箋ID;
    /** この接続点の位置（上/下/左/右） */
    get 接続位置(): 接続点位置;
    /** 接続参照データを生成 */
    get接続参照データ(): 接続参照データ;
}


export class 配置物zIndex {
    /**
     * 付箋内部の階層構造定義
     * スタッキングコンテキストを作らないため、親要素にはzIndexを設定しない
     */
    public static readonly 付箋内部構造 = {
        ホバー用四角形: "0",
        コンテナ: "1",      // テキストエリアを含むメインコンテナ
        ヘッダー: "2",      // 付箋のヘッダー部分
        リサイズハンドル: "3",  // 左右のリサイズハンドル
    };

    /**
     * 折れ線矢印内部の階層構造定義
     */
    public static readonly 矢印内部構造 = {
        線分: "1",
        点ハンドル: "2",
    };

    public static readonly 付箋 = {
        ホバー用四角形: "1",
        付箋: "2"
    }


    public static readonly お絵描きキャンバス = "0";
    public static readonly キャンバス = {
        描画キャンバス: "1",
        図形内キャンバス: "2",
        配置物コンテナ: "3",
        コンテキストメニューコンテナ: "4",
    }

    public  static readonly 選択状態 = {
        未選択:"0",
        選択中:"100",
    }

}

export interface Iドラッグ移動可能 {
    ドラッグ移動処理(e: Drag中値): this;
}


