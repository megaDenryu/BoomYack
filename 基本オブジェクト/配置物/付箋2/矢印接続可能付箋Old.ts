import { I描画空間, Px2DVector, 描画座標点, 配置物座標点 } from "SengenUI/index";
import { Iシリアライズ可能配置物, I付箋VM, I付箋集約, I選択可能配置物 } from "../../I配置物";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";

import { I接続点親情報, 接続点 } from "../矢印接続可能なもの/接続点";
import { 矢印接続可能なもの, 矢印接続可能なもの依存関係 } from "../矢印接続可能なもの/矢印接続可能なもの";
import { 付箋選択状態, 自動リサイズ付箋View2, 自動リサイズ付箋View2オプション } from "./自動リサイズ付箋View2";
import { 付箋データ, 座標データ, サイズデータ } from "../../描画キャンバス/データクラス";
import { 付箋ID } from "../../ID";
import { 自動リサイズ付箋View, 自動リサイズ付箋Viewオプション, 自動リサイズ付箋用コンテキストメニュー依存関係 } from "./自動リサイズ付箋View";
import { 折れ線矢印集約 } from "../折れ線矢印";
import { 付箋設定状態 } from "../設定パネル";

/**
 * 実装上のtodoリスト
 * ✅ 第一段階最終目標: 折れ線矢印ViewTestで矢印接続可能付箋を表示し、矢印接続可能付箋をドラッグすると、付箋viewと矢印接続可能viewの両方が同期して動くこと
 * ✅ 1. 折れ線矢印ViewTestに矢印接続可能付箋のインスタンスを追加し、表示を確認する
 * ✅ 2. 矢印接続可能付箋のドラッグイベントを矢印接続可能なものStateに伝播させる仕組みを実装
 * ✅ 3. リサイズ時（leftHandleドラッグ中、rightHandleドラッグ中、onHeightChange）にも接続点座標を更新
 * ✅ 4. 矢印接続可能なものViewの再レンダリングメソッドを実装
 */
export class 矢印接続可能付箋Old<座標点T extends 配置物座標点> implements I付箋集約, I選択可能配置物, Iシリアライズ可能配置物, I接続点親情報<座標点T> {
    public type: "付箋" = "付箋";
    public readonly view: 自動リサイズ付箋View<座標点T> | 自動リサイズ付箋View2<座標点T>;
    public readonly vm: I付箋VM;
    public get 矢印接続可能なもの(): 矢印接続可能なもの<座標点T> { return this.view.矢印接続可能なもの; }
    private _i描画基準座標を持つ: I描画空間;
    private _i配置物選択機能集約: I配置物選択機能集約;
    private _設定状態: 付箋設定状態;

    public constructor(
        options: 自動リサイズ付箋Viewオプション<座標点T>,
        矢印接続可能なもの依存関係: 矢印接続可能なもの依存関係<座標点T>,
        id: 付箋ID,
        コンテキストメニュー依存関係: 自動リサイズ付箋用コンテキストメニュー依存関係
    ) {
        this._i配置物選択機能集約 = 矢印接続可能なもの依存関係.i配置物選択機能集約;
        this._設定状態 = 付箋設定状態.create();
        // ドラッグ・リサイズイベントをフックするためのオプション拡張
        const enhancedOptions = this.options強化(options);
        // this.view = new 自動リサイズ付箋View2(enhancedOptions,矢印接続可能なもの依存関係,id)
        this.view = new 自動リサイズ付箋View(enhancedOptions, 矢印接続可能なもの依存関係, id, コンテキストメニュー依存関係)
            .選択するを登録((e) => {
                if (e.ctrlKey) {
                    this._i配置物選択機能集約.追加選択(this);
                    return;
                }
                this._i配置物選択機能集約.set選択中配置物(this);
            })
            .onHover(() => { this._i配置物選択機能集約.setホバー中配置物(this); })

        this._i描画基準座標を持つ = 矢印接続可能なもの依存関係.i描画空間;
        this.設定を適用(this._設定状態);
    }

    /** I接続点親情報の実装: 配置物ID */
    public get 配置物ID(): 付箋ID {
        return this.id;
    }

    /**
     * オプションを拡張してドラッグ・リサイズイベントをフックする
     */
    private options強化(options: 自動リサイズ付箋Viewオプション<座標点T>): 自動リサイズ付箋Viewオプション<座標点T> {
        return {
            ...options,
            onDragEnd: () => { this.矢印接続可能なもの.接続している矢印リスト().forEach(矢印 => {矢印.始点と終点の付箋の接続点を最短のものに切り替える();}); },
            onDrag: (e, ドラッグしたコンポーネント) => {this._i配置物選択機能集約.まとめて移動(e, ドラッグしたコンポーネント);}
        };
    }

    public get 接続点リスト(): Iterable<接続点<座標点T>> {
        return this.矢印接続可能なもの.接続点リスト();
    }

    /** テキストを取得（View経由） */
    public get text(): string {
        return this.view.text;
    }


    public get 描画座標点(): 描画座標点 {
        return this.view.position.to描画座標点();
    }

    public get size(): Px2DVector {
        return this.view.getSize();
    }

    public get衝突判定用矩形(): { 位置: 描画座標点; サイズ: Px2DVector } {
        const viewの矩形 = this.view.get衝突判定用矩形();
        return { 位置: viewの矩形.位置.to描画座標点(), サイズ: viewの矩形.サイズ };
    }

    public 位置を設定(pos: 座標点T): void {
        this.view.位置を設定(pos);
        this.view.update接続点座標();
    }

    public 再描画(): void {
        this.view.update接続点座標();
        this.view.再描画();
    }

    public 選択された時の処理(): void {
        this.矢印接続可能なもの.アニメーションさせながらshow();
        this.view.set選択状態(付箋選択状態.選択);
    }

    public 選択解除された時の処理(): void {
        this.矢印接続可能なもの.アニメーションさせながらhide();
        this.view.set選択状態(付箋選択状態.なし);
    }

    public ホバーされたときの処理(): void {
        this.矢印接続可能なもの.アニメーションさせながらshow();
        this.view.set選択状態(付箋選択状態.ホバー);
    }

    public ホバー解除されたときの処理(): void {
        this.矢印接続可能なもの.アニメーションさせながらhide();
        this.view.set選択状態(付箋選択状態.なし);
    }

    public 接続点を表示非表示切り替え(表示する: boolean): void {
        if (表示する) {
            this.矢印接続可能なもの.アニメーションさせながらshow();
            this.view.set選択状態(付箋選択状態.矢印選択);
        } else {
            this.矢印接続可能なもの.アニメーションさせながらhide();
            this.view.set選択状態(付箋選択状態.なし);
        }
    }

    public 選択状態のzIndexにする(): void {
        this.view.選択状態のzIndexにする();
    }

    public 通常状態のzIndexにする(): void {
        this.view.通常状態のzIndexにする();
    }

    /**
     * シリアライズ用データを生成する
     */
    public toシリアライズデータ(): 付箋データ {
        const position = this.view.position.px2DVector;
        const size = this.view.getSize();
        return 付箋データ.create(
            this.id,
            座標データ.fromPx2DVector(position),
            サイズデータ.create(size.x.値, size.y.値),
            this.text
        );
    }

    /** ID取得 */
    public get id(): 付箋ID { return this.view.配置物ID; }

    public 接続点から矢印を作る(上下左右: '上' | '下' | '左' | '右'): 折れ線矢印集約<座標点T> {
        const point = this.矢印接続可能なもの.接続点_上;
        return point.矢印作成()
    }

    public 別の付箋へ矢印を作る(対象付箋: 矢印接続可能付箋Old<座標点T>): 折れ線矢印集約<座標点T> {
        const 対象への方向ベクトル = 対象付箋.描画座標点.minus(this.描画座標点);
        // 各方向との内積を計算し、最大の内積を持つ方向を選択
        const 自分の接続点 = this.矢印接続可能なもの.対象方向へもっとも成す角が小さい接続点を取得する(対象への方向ベクトル);
        // 相手の接続点は逆方向（対象から自分への方向ベクトル）で計算
        const 自分への方向ベクトル = 対象への方向ベクトル.times(-1);
        const 相手の接続点 = 対象付箋.矢印接続可能なもの.対象方向へもっとも成す角が小さい接続点を取得する(自分への方向ベクトル);

        const 矢印: 折れ線矢印集約<座標点T> = 自分の接続点.矢印作成()
        矢印.終点ハンドル.接続(相手の接続点);
        return 矢印;
    }

    public get設定状態(): 付箋設定状態 {
        return this._設定状態;
    }

    public 設定を適用(新設定: 付箋設定状態): void {
        this._設定状態 = 新設定;
        this.view.設定を適用(新設定);
    }
}
