import { Drag中値, Drag開始値, I描画空間, Px2DVector, 描画座標点, 画面座標点, 配置物座標点 } from "SengenUI/index";

import {  I折れ線矢印集約, I点ハンドル, I線分ハンドル, I点と線のリポジトリ, I接触点を教えてくれる人, Iシリアライズ可能配置物 } from "../../I配置物";
import { 中点ハンドルView, 折れ線矢印View } from "./折れ線矢印View";
import { 中点State, 始点State, 終点State } from "./折れ線矢印state";
import { 折れ線矢印VM } from "./折れ線矢印VM";

import { 始点ハンドル, 終点ハンドル, 線分ハンドル } from "./矢印集約";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { 折れ線矢印データ, 座標データ } from "../../描画キャンバス/データクラス";
import { 折れ線矢印ID } from "../../ID";
import { I接続点親情報 } from "../矢印接続可能なもの/接続点";
import { 矢印設定状態 } from "../設定パネル";
/**
 * 目標
 * 始点.線分1.中点2.線分3.中点4....中点N.線分N+1.終点
 * となってるとき、
 * 1. 線分iを動かしたときの処理:
 *      1. 線分iの始点(点i-1)と終点(点i+1)を動かす
 *      2. 点i-1の前の線分i-2と点i+1の後の線分i+2も動かす
 * 2. 点kを動かしたときの処理:
 *      1. 点kの前の線分k-1と点kの後の線分k+1を動かす
 */

export class 折れ線矢印集約<座標点T extends 配置物座標点> implements I折れ線矢印集約<座標点T>, Iシリアライズ可能配置物 {
    public type: "折れ線矢印" = "折れ線矢印";
    public readonly view: 折れ線矢印View;
    public readonly 始点ハンドル: 始点ハンドル<座標点T>;
    public readonly 終点ハンドル: 終点ハンドル<座標点T>;
    public readonly 線分ハンドルリスト: 線分ハンドル<座標点T>[];
    public readonly 点ハンドルリスト: I点ハンドル<座標点T>[];
    private _i接触点を教えてくれる人: I接触点を教えてくれる人<座標点T>;
    private _i描画基準座標を持つ: I描画空間;
    private _i配置物選択機能集約:I配置物選択機能集約;
    private _id: 折れ線矢印ID;
    private _設定状態: 矢印設定状態;

    public constructor(
        vm: 折れ線矢印VM<座標点T>,
        i接触点を教えてくれる人: I接触点を教えてくれる人<座標点T>,
        i描画基準座標を持つ: I描画空間,
        i配置物選択機能集約:I配置物選択機能集約,
    ) {
        this._id = vm.配置物ID;
        this._i接触点を教えてくれる人 = i接触点を教えてくれる人;
        this._i描画基準座標を持つ = i描画基準座標を持つ;
        this._i配置物選択機能集約 = i配置物選択機能集約;
        this._設定状態 = 矢印設定状態.create();
        this.始点ハンドル = new 始点ハンドル(new 始点State(vm.start), this, this._i描画基準座標を持つ, this._i接触点を教えてくれる人, i配置物選択機能集約);
        this.終点ハンドル = new 終点ハンドル(new 終点State(vm.end), this, vm.中点リスト.length + 1, this._i描画基準座標を持つ, this._i接触点を教えてくれる人, i配置物選択機能集約);
        const 中点ハンドルリスト = vm.中点リスト.map((pos, index) => new 中点ハンドル(new 中点State(pos), index+1, this, this._i描画基準座標を持つ));
        this.点ハンドルリスト = [this.始点ハンドル, ...中点ハンドルリスト, this.終点ハンドル];
        this.線分ハンドルリスト = this.create線分ハンドルリスト(this.点ハンドルリスト);
        this.view = new 折れ線矢印View( this.始点ハンドル.view, this.終点ハンドル.view)
                        .onClick((e) => {
                            if (e.ctrlKey) {
                                this._i配置物選択機能集約.追加選択(this);
                                return;
                            }
                            this._i配置物選択機能集約.set選択中配置物(this);
                        })
                        .onHover(() => {this._i配置物選択機能集約.setホバー中配置物(this);});
        中点ハンドルリスト.forEach( (中点ハンドル) => {
            this.view.add中点ハンドル(中点ハンドル.view);
        });
        this.線分ハンドルリスト.forEach( (線分ハンドル) => {
            this.view.add線分ハンドル(線分ハンドル.view);
        });

        this.点ハンドルリスト.forEach( (中点ハンドル) => {
            中点ハンドル.render();
        });
        this.線分ハンドルリスト.forEach( (線分ハンドル) => {
            線分ハンドル.render();
        });
    }

    判定(pos: Px2DVector): boolean {
        throw new Error("画面座標点の実装が必要です");
    }
    get 画面座標点():画面座標点 {
        throw new Error("画面座標点の実装が必要です");
    }

    public get衝突判定用矩形(): { 位置: 描画座標点; サイズ: Px2DVector } {
        // 矢印のバウンディングボックスを計算（始点と終点、全中点を含む最小矩形）
        const 全点リスト = [this.始点ハンドル.描画座標点, ...this.点ハンドルリスト.slice(1, -1).map(p => p.描画座標点), this.終点ハンドル.描画座標点];
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        全点リスト.forEach(点 => {
            const x = 点.px2DVector.x.値;
            const y = 点.px2DVector.y.値;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });
        
        const 位置 = 描画座標点.fromNumbers(minX, minY, 全点リスト[0].描画基準座標);
        const サイズ = Px2DVector.fromNumbers(maxX - minX, maxY - minY);
        return { 位置, サイズ };
    }



    get点ハンドルByIndex(index: number): I点ハンドル<座標点T> | null {
        return this.点ハンドルリスト[index] || null;
    }

    get線分ハンドルByIndex(index: number): I線分ハンドル<座標点T> | null {
        return this.線分ハンドルリスト[index] || null;
    }

    getLast線分ハンドル(): I線分ハンドル<座標点T> {
        return this.線分ハンドルリスト[this.線分ハンドルリスト.length - 1];
    }

    private create線分ハンドルリスト(点ハンドルリスト: I点ハンドル<座標点T>[]): 線分ハンドル<座標点T>[] {
        const list: 線分ハンドル<座標点T>[] = [];
        const 線分ハンドルの数 = 点ハンドルリスト.length - 1;
        for (let i = 0; i < 線分ハンドルの数; i++) {
            const start点ハンドル = 点ハンドルリスト[i];
            const end点ハンドル = 点ハンドルリスト[i + 1];
            const i番目の線分ハンドル = new 線分ハンドル(
                start点ハンドル,
                end点ハンドル,
                this._i描画基準座標を持つ
            );
            i番目の線分ハンドル.set親の集約(this);
            i番目の線分ハンドル.set線分の位置(i);
            list.push(i番目の線分ハンドル);
        }
        return list;
    }

    public insert中点(insertIndex: number, pos: 座標点T): this {
        // 中点ハンドルを追加しそれに伴い線分ハンドルも追加する。線分のindexを指定するとその線分の中に中点を追加する。
        // 例えば[始点, 中点1, 中点2, 終点]のとき、index 1を指定すると線分1(中点1と中点2の間)が分割される
        
        // 新しい中点を挿入（insertIndex+1の位置に挿入）
        const 新しい中点 = new 中点ハンドル(
            new 中点State(pos),
            insertIndex + 1, // 線分indexの次の位置
            this,
            this._i描画基準座標を持つ
        );
        this.点ハンドルリスト.splice(insertIndex + 1, 0, 新しい中点);
        
        // すべての点のindexを更新
        this.点ハンドルリスト.forEach((点ハンドル, idx) => {
            点ハンドル.index = idx;
        });
        
        // 分割される線分を削除
        const 削除される線分 = this.線分ハンドルリスト.splice(insertIndex, 1)[0];
        
        // 2つの新しい線分を作成
        const 新しい線分1 = new 線分ハンドル(
            this.点ハンドルリスト[insertIndex],
            this.点ハンドルリスト[insertIndex + 1],
            this._i描画基準座標を持つ
        );
        const 新しい線分2 = new 線分ハンドル(
            this.点ハンドルリスト[insertIndex + 1],
            this.点ハンドルリスト[insertIndex + 2],
            this._i描画基準座標を持つ
        );
        
        // 新しい線分に親と位置をセット
        新しい線分1.set親の集約(this);
        新しい線分1.set線分の位置(insertIndex);
        新しい線分2.set親の集約(this);
        新しい線分2.set線分の位置(insertIndex + 1);
        
        // 新しい線分を配列に挿入
        this.線分ハンドルリスト.splice(insertIndex, 0, 新しい線分1, 新しい線分2);
        
        // 挿入後のすべての線分の位置を更新
        for (let i = insertIndex + 2; i < this.線分ハンドルリスト.length; i++) {
            this.線分ハンドルリスト[i].set線分の位置(i);
        }
        
        // 新しい中点と線分をViewに追加
        this.view.add中点ハンドル(新しい中点.view);
        this.view.add線分ハンドル(新しい線分1.view);
        this.view.add線分ハンドル(新しい線分2.view);
        
        // 削除される線分のViewをDOMから削除
        削除される線分.view.delete();
        
        // すべての点ハンドル・線分ハンドルを再描画
        this.点ハンドルリスト.forEach((点ハンドル) => {
            点ハンドル.render();
        });
        this.線分ハンドルリスト.forEach((線分ハンドル) => {
            線分ハンドル.render();
        });
        
        return this;
    }

    public delete中点(deleteIndex: number): this {
        // 中点ハンドルを削除しそれに伴い線分ハンドルも統合する。中点のindexを指定するとその中点が削除される。
        // 例えば[始点, 線分0, 中点1, 線分1,  中点2, 線分2, 終点]のとき、index 1を指定すると中点1が削除され線分0と線分1が統合され、
        // [始点, 線分0, 中点2, 線分2, 終点]となる。

        // 削除対象を取得
        const 削除される中点 = this.点ハンドルリスト[deleteIndex];
        const 削除される線分1 = this.線分ハンドルリスト[deleteIndex - 1];
        const 削除される線分2 = this.線分ハンドルリスト[deleteIndex];

        // 中点を削除
        this.点ハンドルリスト.splice(deleteIndex, 1);
        // すべての点のindexを更新
        this.点ハンドルリスト.forEach((点ハンドル, idx) => {
            点ハンドル.index = idx;
        });
        

        // 統合される線分を削除
        this.線分ハンドルリスト.splice(deleteIndex - 1, 2);

        // 新しい線分を作成（削除後の点ハンドルリストを使用）
        // 削除された中点の前の点と後の点を結ぶ
        const 新しい線分 = new 線分ハンドル(
            this.点ハンドルリスト[deleteIndex - 1],
            this.点ハンドルリスト[deleteIndex],
            this._i描画基準座標を持つ
        );
        新しい線分.set親の集約(this);
        新しい線分.set線分の位置(deleteIndex - 1);

        // 新しい線分をリストに挿入
        this.線分ハンドルリスト.splice(deleteIndex - 1, 0, 新しい線分);

        // 挿入後のすべての線分の位置を更新
        for (let i = deleteIndex; i < this.線分ハンドルリスト.length; i++) {
            this.線分ハンドルリスト[i].set線分の位置(i);
        }

        // Viewの更新
        if (削除される中点 instanceof 中点ハンドル) {
            削除される中点.view.delete();
        }
        削除される線分1.view.delete();
        削除される線分2.view.delete();

        // 新しい線分のViewを追加
        this.view.add線分ハンドル(新しい線分.view);

        // 再描画
        this.点ハンドルリスト.forEach((点ハンドル) => {
            点ハンドル.render();
        });
        this.線分ハンドルリスト.forEach((線分ハンドル) => {
            線分ハンドル.render();
        });

        return this;
    }

    public 再描画(): void {
        for (const 点ハンドル of this.点ハンドルリスト) {
            点ハンドル.render();
        }
        for (const 線分ハンドル of this.線分ハンドルリスト) {
            線分ハンドル.render();
        }
    }

    // _i配置物選択機能集約から呼ばれるので_i配置物選択機能集約のメソッドをこの中で呼ぶと無限ループになるので注意
    public 選択された時の処理(): void {
        this.view.select();
    }

    public 選択解除された時の処理(): void {
        this.view.deselect();
    }

    public ホバーされたときの処理(): void{
        this.view.hover();
    }

    public ホバー解除されたときの処理(): void{
        this.view.unhover();
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
    public toシリアライズデータ(): 折れ線矢印データ {
        // 中点のリストを抽出（始点と終点を除く）
        const 中点座標リスト = this.点ハンドルリスト
            .slice(1, -1) // 始点と終点を除く
            .map(点ハンドル => 座標データ.fromPx2DVector(点ハンドル.state.pos.px2DVector));
        
        return 折れ線矢印データ.create(
            this._id,
            座標データ.fromPx2DVector(this.始点ハンドル.state.pos.px2DVector),
            中点座標リスト,
            座標データ.fromPx2DVector(this.終点ハンドル.state.pos.px2DVector),
            this.始点ハンドル.get接続参照データ(),
            this.終点ハンドル.get接続参照データ()
        );
    }

    /** ID取得 */
    public get id(): 折れ線矢印ID { return this._id; }

    public 始点と終点の付箋の接続点を最短のものに切り替える(){
        const 始点の付箋:I接続点親情報<座標点T>|undefined = this.始点ハンドル.接続点?.親interface;
        const 終点の付箋:I接続点親情報<座標点T>|undefined = this.終点ハンドル.接続点?.親interface;
        if (始点の付箋 == undefined || 終点の付箋 == undefined) {return;}
        if (始点の付箋 === 終点の付箋) {return;}
        const 中点が存在する = this.点ハンドルリスト.length > 2;
        if (中点が存在する) {
            const 始点の次の点 = this.点ハンドルリスト[1];
            const 終点の前の点 = this.点ハンドルリスト[this.点ハンドルリスト.length - 2];
            const 始点から次の点への方向ベクトル = 始点の次の点.描画座標点.minus(this.始点ハンドル.state.pos.to描画座標点());
            const 終点から前の点への方向ベクトル = 終点の前の点.描画座標点.minus(this.終点ハンドル.state.pos.to描画座標点());
            const 始点の最適な接続点 = 始点の付箋.矢印接続可能なもの.対象方向へもっとも成す角が小さい接続点を取得する(始点から次の点への方向ベクトル);
            const 終点の最適な接続点 = 終点の付箋.矢印接続可能なもの.対象方向へもっとも成す角が小さい接続点を取得する(終点から前の点への方向ベクトル);
            if (始点の最適な接続点 !== this.始点ハンドル.接続点) {this.始点ハンドル.接続(始点の最適な接続点);}
            if (終点の最適な接続点 !== this.終点ハンドル.接続点) {this.終点ハンドル.接続(終点の最適な接続点);}
        } else {
            const 最短ペア = 始点の付箋.矢印接続可能なもの.ほかの矢印接続可能な物と最も近い接続点のペアを取得する(終点の付箋.矢印接続可能なもの);
            const 始点の最短接続点 = 最短ペア.自分の接続点;
            const 終点の最短接続点 = 最短ペア.相手の接続点;
            if (始点の最短接続点 !== this.始点ハンドル.接続点) {this.始点ハンドル.接続(始点の最短接続点);}
            if (終点の最短接続点 !== this.終点ハンドル.接続点) {this.終点ハンドル.接続(終点の最短接続点);}
        }
    }
}



export class 中点ハンドル<座標点T extends 配置物座標点> implements I点ハンドル<座標点T> {
    private _view: 中点ハンドルView;
    public get view(): 中点ハンドルView { return this._view; }
    private _state: 中点State<座標点T>;
    public get state(): 中点State<座標点T> { return this._state; }

    public get next線分ハンドル(): I線分ハンドル<座標点T> {
        return this.親の折れ線矢印集約.get線分ハンドルByIndex(this.index) as I線分ハンドル<座標点T>;
    };
    public get prev線分ハンドル(): I線分ハンドル<座標点T> {
        return this.親の折れ線矢印集約.get線分ハンドルByIndex(this.index - 1) as I線分ハンドル<座標点T>;
    };

    public index: number;
    public readonly 親の折れ線矢印集約: I折れ線矢印集約<座標点T>;
    private _i描画基準座標を持つ: I描画空間;

    constructor(state: 中点State<座標点T>, index: number, i折れ線矢印集約: I折れ線矢印集約<座標点T>, i描画基準座標を持つ: I描画空間) {
        this._i描画基準座標を持つ = i描画基準座標を持つ;
        this.親の折れ線矢印集約 = i折れ線矢印集約;
        this._view = new 中点ハンドルView([
            {
                onハンドルドラッグ中: (e: Drag中値): void => {
                    this.ドラッグ移動処理(e);
                },
                onハンドルドラッグ終了: (e: Drag中値): void => {},
                on右クリック: (e: MouseEvent): void => {
                    e.preventDefault();// ブラウザのコンテキストメニューを抑制
                    this.親の折れ線矢印集約.delete中点(this.index);
                }
            }
        ]);
        this._state = state;
        this.index = index;
    }

    public get 描画座標点():描画座標点{
        return this._state.pos.to描画座標点();
    }

    public 判定(pos: Px2DVector): boolean {
        throw new Error("Method not implemented.");
    }

    public ドラッグ移動処理(e: Drag中値): this
    {
        // 拡縮率を考慮: 視覚的に正しい移動量にするため、deltaを拡縮率で割る
        const delta = e.data.直前のマウス位置から現在位置までの差分;
        const 拡縮率 = this._i描画基準座標を持つ.描画基準座標.拡縮率;
        const 補正されたdelta = Px2DVector.fromNumbers(
            delta.x / 拡縮率,
            delta.y / 拡縮率
        );
        this._state.setPosition(this._state.pos.plus(補正されたdelta) as 座標点T);
        this.render();
        // 接続している前後の線分を再描画
        this.prev線分ハンドル.render();
        this.next線分ハンドル.render();
        return this;
    }

    public render(): this {
        const pos = this._state.pos;
        this._view.位置を設定(pos);
        return this;
    }

    public move(diff: Px2DVector): this {
        return this.setPosition(this._state.pos.plus(diff) as 座標点T);
    }

    public 移動終了(e: Drag中値): void {
    }

    public 移動開始(e: Drag開始値): void {
    }

    public setPosition(pos: 座標点T): this {
        this._state.setPosition(pos);
        this.render();
        return this;
    }
}


