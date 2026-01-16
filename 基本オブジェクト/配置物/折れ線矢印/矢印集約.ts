import { Drag中値, Drag終了値, Drag開始値, I描画空間, Px2DVector, 描画座標点, 配置物座標点 } from "SengenUI/index";

import { I点と線のリポジトリ, I点ハンドル, I線分ハンドル, 接触判定可能な点, I接触点を教えてくれる人, I接続点, I接続点と接続可能, Iシリアライズ可能配置物, I折れ線矢印集約 } from "../../I配置物";
import { 始点State, 終点State } from "./折れ線矢印state";
import { 始点ハンドルView, 終点ハンドルView, 線分ハンドルView, 始点中心線分情報 } from "./折れ線矢印View";

import { 矢印ID } from "../../ID";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { 矢印データ, 座標データ, 接続参照データ } from "../../描画キャンバス/データクラス";

export class 矢印VM<座標点T extends 配置物座標点> {
    public readonly id: 矢印ID;
    public readonly start: 座標点T;
    public readonly end: 座標点T;

    public constructor(id: 矢印ID, start: 座標点T, end: 座標点T) {
        this.id = id;
        this.start = start;
        this.end = end;
    }

    /**
     * シリアライズ用データに変換
     */
    public toデータ(
        startRef?: 接続参照データ | null,
        endRef?: 接続参照データ | null
    ): 矢印データ {
        return 矢印データ.create(
            this.id,
            座標データ.fromPx2DVector(this.start.px2DVector),
            座標データ.fromPx2DVector(this.end.px2DVector),
            startRef,
            endRef
        );
    }

    /**
     * データクラスから矢印VMを作成
     */
    public static fromデータ<座標点T extends 配置物座標点>(
        data: 矢印データ,
        座標変換: (座標: 座標データ) => 座標点T
    ): 矢印VM<座標点T> {
        return new 矢印VM(
            data.id,
            座標変換(data.start),
            座標変換(data.end)
        );
    }
}


export class 始点ハンドル<座標点T extends 配置物座標点> implements I点ハンドル<座標点T>,接触判定可能な点,I接続点と接続可能 {
    private _view: 始点ハンドルView;
    public get view(): 始点ハンドルView { return this._view; }
    private _state: 始点State<座標点T>;
    public get state(): 始点State<座標点T> { return this._state; }
    public readonly 親の折れ線矢印集約: I折れ線矢印集約<座標点T>;
    private _i描画基準座標を持つ: I描画空間;
    public index: number = 0;
    private _i接触点を教えてくれる人: I接触点を教えてくれる人<座標点T>;
    private _i配置物選択機能集約:I配置物選択機能集約;
    private _i接続点: I接続点<座標点T>|null = null;
    public get 接続点(): I接続点<座標点T> | null {return this._i接続点;}
    // public readonly 親の折れ線矢印集約:I折れ線矢印集約<座標点T>;

    constructor(state: 始点State<座標点T>, i折れ線矢印集約: I折れ線矢印集約<座標点T>,
                 i描画基準座標を持つ: I描画空間, i接触点を教えてくれる人: I接触点を教えてくれる人<座標点T>,
                 i配置物選択機能集約:I配置物選択機能集約
        ) {
        this._state = state;
        this.親の折れ線矢印集約 = i折れ線矢印集約;
        this._i描画基準座標を持つ = i描画基準座標を持つ;
        this._i接触点を教えてくれる人 = i接触点を教えてくれる人;
        this._i配置物選択機能集約 = i配置物選択機能集約;
        this._view = new 始点ハンドルView([
            {
                onハンドルドラッグ開始: (e: Drag開始値): void => {this.移動開始(e);},
                onハンドルドラッグ中: (e: Drag中値): void => {this.ドラッグ移動処理(e);},
                onハンドルドラッグ終了: (e: Drag中値): void => {this.移動終了(e);}
            }
        ]);
        
    }

    public get 描画座標点():描画座標点{
        return this._state.pos.to描画座標点();
    }

    public 判定(pos: Px2DVector): boolean {
        const length = this._state.pos.px2DVector.minus(pos);
        return length.dot(length) <= 20 * 20;
    }

    public get nextハンドル(): I点ハンドル<座標点T> {
       const a = this.親の折れ線矢印集約.get点ハンドルByIndex(1);
         if (!a) throw new Error("存在しない点ハンドルにアクセスしようとしました");
         return a;
    }

    public get next線分ハンドル(): I線分ハンドル<座標点T> {
        const a = this.親の折れ線矢印集約.get線分ハンドルByIndex(0);
        if (!a) throw new Error("存在しない線分ハンドルにアクセスしようとしました");
        return a;
    }
    public get prev線分ハンドル(): null {
        return null;
    };

    public ドラッグ移動処理(e: Drag中値): this {
        // 拡縮率を考慮: 視覚的に正しい移動量にするため、deltaを拡縮率で割る
        const delta = e.data.直前のマウス位置から現在位置までの差分;
        const 拡縮率 = this._i描画基準座標を持つ.描画基準座標.拡縮率;
        const 補正されたdelta = Px2DVector.fromNumbers(
            delta.x / 拡縮率,
            delta.y / 拡縮率
        );
        this._state.setPosition(this._state.pos.plus(補正されたdelta) as 座標点T);
        this.render(); // 自分自身のビューも更新
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

    public setPosition(pos: 座標点T): this {
        this._state.setPosition(pos);
        this.render();
        this.next線分ハンドル.render();
        return this;
    }

    public 移動終了(e: Drag中値): void {
        const v接続点 = this._i接触点を教えてくれる人.接続点を取得(this.描画座標点);
        if (v接続点 == null){return}
        this.接続(v接続点);
        this._i配置物選択機能集約.全ての接続点を表示非表示切り替え(false);
    }

    public 移動開始(e: Drag開始値): void {
        this.接続解除();
        this._i配置物選択機能集約.全ての接続点を表示非表示切り替え(true);
    }
    
    public 接続( v接続点: I接続点<座標点T>){
        this.接続解除();
        this.view.見た目を接続状態にする();
        this._i接続点 = v接続点;
        this._i接続点.接続(this)
        return this;
    }

    private 接続解除(){
        this._i接続点?.接続解除(this);
        this._i接続点 = null;
        return this;
    }

    /** 接続されている場合、接続参照データを返す */
    public get接続参照データ(): 接続参照データ | null {
        return this._i接続点?.get接続参照データ() ?? null;
    }

    public get 未接続(): boolean {
        return this._i接続点 == null
    }
}

export class 終点ハンドル<座標点T extends 配置物座標点> implements I点ハンドル<座標点T>, 接触判定可能な点 {
    private _view: 終点ハンドルView;
    public get view(): 終点ハンドルView { return this._view; }
    private _state: 終点State<座標点T>;
    public get state(): 終点State<座標点T> { return this._state; }
    public readonly 親の折れ線矢印集約: I折れ線矢印集約<座標点T>;
    public index: number;
    private _i描画基準座標を持つ: I描画空間;
    private _i接触点を教えてくれる人: I接触点を教えてくれる人<座標点T>;
    private _i配置物選択機能集約:I配置物選択機能集約;
    private _i接続点: I接続点<座標点T>|null = null;
    public get 接続点(): I接続点<座標点T> | null {return this._i接続点;}

    constructor(state: 終点State<座標点T>, i折れ線矢印集約: I折れ線矢印集約<座標点T>, index: number, 
                i描画基準座標を持つ: I描画空間, i接触点を教えてくれる人: I接触点を教えてくれる人<座標点T>, i配置物選択機能集約:I配置物選択機能集約) {
        this._i描画基準座標を持つ = i描画基準座標を持つ;
        this._i接触点を教えてくれる人 = i接触点を教えてくれる人;
        this._i配置物選択機能集約 = i配置物選択機能集約;
        this._view = new 終点ハンドルView([{
            onハンドルドラッグ開始: (e: Drag開始値): void => {
                this.移動開始(e);
                
            },
            onハンドルドラッグ中: (e: Drag中値): void => {
                this.ドラッグ移動処理(e);
            },
            onハンドルドラッグ終了: (e: Drag中値): void => {
                this.移動終了(e);
                
            }
        }]);
        this._state = state;
        this.親の折れ線矢印集約 = i折れ線矢印集約;
        this.index = index;
    }

    public get 描画座標点():描画座標点{
        return this._state.pos.to描画座標点();
    }

    public 判定(pos: Px2DVector): boolean {
        const length = this._state.pos.px2DVector.minus(pos);
        return length.dot(length) <= 20 * 20;
    }

    public get next線分ハンドル(): null {
        return null;
    };

    public get prev線分ハンドル(): I線分ハンドル<座標点T> {
        return this.親の折れ線矢印集約.get線分ハンドルByIndex(this.index-1) as I線分ハンドル<座標点T>;
    }

    public ドラッグ移動処理(e: Drag中値): this {
        // 拡縮率を考慮: 視覚的に正しい移動量にするため、deltaを拡縮率で割る
        const delta = e.data.直前のマウス位置から現在位置までの差分;
        const 拡縮率 = this._i描画基準座標を持つ.描画基準座標.拡縮率;
        const 補正されたdelta = Px2DVector.fromNumbers(
            delta.x / 拡縮率,
            delta.y / 拡縮率
        );
        this._state.setPosition(this._state.pos.plus(補正されたdelta) as 座標点T);
        this.render(); // 自分自身のビューも更新
        this.prev線分ハンドル.render();
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

    public setPosition(pos: 座標点T): this {
        this._state.setPosition(pos);
        this.render();
        this.prev線分ハンドル.render();
        return this;
    }

    public 移動終了(e: Drag中値): void {
        const v接続点 = this._i接触点を教えてくれる人.接続点を取得(this.描画座標点);
        if (v接続点 == null) {return;}
        this.接続(v接続点);
        this._i配置物選択機能集約.全ての接続点を表示非表示切り替え(false);
    }

    public 移動開始(e: Drag開始値): void {
        this.接続解除();
        this._i配置物選択機能集約.全ての接続点を表示非表示切り替え(true);
    }

    public 接続( v接続点: I接続点<座標点T>){
        this.接続解除();
        this.view.見た目を接続状態にする();
        this._i接続点 = v接続点;
        this._i接続点.接続(this)
    }

    private 接続解除(){
        this._i接続点?.接続解除(this);
        this._i接続点 = null;
    }

    /** 接続されている場合、接続参照データを返す */
    public get接続参照データ(): 接続参照データ | null {
        return this._i接続点?.get接続参照データ() ?? null;
    }

    public get 未接続(): boolean {
        return this._i接続点 == null
    }
}

export class 線分ハンドル<座標点T extends 配置物座標点> implements I線分ハンドル<座標点T> {
    private _view: 線分ハンドルView;
    public get view(): 線分ハンドルView { return this._view; }
    public readonly 始点: I点ハンドル<座標点T>;
    public readonly 終点: I点ハンドル<座標点T>;
    private _親の集約: I点と線のリポジトリ<座標点T> | null = null;
    private _線分の位置: number = -1; // インデックス
    private _i描画基準座標を持つ: I描画空間;

    constructor(始点: I点ハンドル<座標点T>, 終点: I点ハンドル<座標点T>, i描画基準座標を持つ: I描画空間) {
        this.始点 = 始点;
        this.終点 = 終点;
        this._i描画基準座標を持つ = i描画基準座標を持つ;
        this._view = new 線分ハンドルView([{
            onハンドルドラッグ開始: (e: Drag開始値): void => {this.移動開始(e);},
            onハンドルドラッグ中: (e: Drag中値): void => {this.ドラッグ移動処理(e);},
            onハンドルドラッグ終了: (e: Drag終了値): void => {this.移動終了(e);},
            on右クリック: (e: MouseEvent): void => {
                this.線分ハンドルを右クリックしたときの処理(e);
            }
        }]);
    }

    public set親の集約(親: I点と線のリポジトリ<座標点T>) {
        this._親の集約 = 親;
        return this;
    }

    public set線分の位置(位置: number) {
        this._線分の位置 = 位置;
        return this;
    }

    public ドラッグ移動処理(e: Drag中値): this {
        // 拡縮率を考慮: 視覚的に正しい移動量にするため、deltaを拡縮率で割る
        const 拡縮率 = this._i描画基準座標を持つ.描画基準座標.拡縮率;
        const delta = e.data.直前のマウス位置から現在位置までの差分;
        const 補正されたdelta = Px2DVector.fromNumbers(
            delta.x / 拡縮率,
            delta.y / 拡縮率
        );
        this.始点.move(補正されたdelta);
        this.終点.move(補正されたdelta);
        this.render(); // 線分自身も再描画
        this.始点.prev線分ハンドル?.render();
        this.終点.next線分ハンドル?.render();
        return this;
    }



    private 移動終了(e: Drag終了値): void {
        this.始点.移動終了(e);
        this.終点.移動終了(e);
    }

    private 移動開始(e: Drag開始値): void {
        this.始点.移動開始(e);
        this.終点.移動開始(e);
    }

    public 線分ハンドルを右クリックしたときの処理(e: MouseEvent): this {
        e.preventDefault();// ブラウザのコンテキストメニューを抑制
        
        if (!this._親の集約 || this._線分の位置 < 0) {
            return this;
        }

        // 線分の中点を計算
        const 始点pos = this.始点.state.pos;
        const 終点pos = this.終点.state.pos;

        const 中点pos = 始点pos.plus(終点pos.px2DVector).divide(2) as 座標点T;

        // insert中点を呼び出す
        this._親の集約.insert中点(this._線分の位置, 中点pos);

        return this;
    }

    public render(): this {
        const 始点pos = this.始点.state.pos;
        const 終点pos = this.終点.state.pos;
        
        // 線分の角度を計算
        const v始点中心線分情報 = 始点中心線分情報.計算(始点pos, 終点pos);
        
        // 線分を描画
        this._view.render(v始点中心線分情報);
        
        // 終点の矢印を回転
        this.始点.view.回転角度を設定(v始点中心線分情報.angle);
        this.終点.view.回転角度を設定(v始点中心線分情報.angle);

        return this;
    }
}

