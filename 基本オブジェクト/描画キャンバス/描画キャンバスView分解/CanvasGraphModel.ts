import { I描画空間, Px2DVector, 描画基準座標, 描画座標点, 画面座標点 } from "SengenUI/index";
import { I接触点を教えてくれる人, I配置物集約, リスト配置可能, 接触判定可能な点, I接続点, I接触点登録先, is折れ線矢印集約 } from "../../I配置物";

import { 無分割管理 } from "../../接触点を教えてくれる人/無分割管理";
import { I配置物リポジトリ, Iグラフ配置先 } from "../../配置物リポジトリ";
import { 付箋集約 } from "../../配置物/付箋2/付箋集約";
import { 折れ線矢印VM, 折れ線矢印集約 } from "../../配置物";
import { 接続点 } from "../../配置物/矢印接続可能なもの/接続点";
import { キャンバスメタデータ } from "../データクラス";
import { キャンバスID } from "../../ID";

/** グラフの変更イベント */
export type GraphEvent = 
    | { type: 'ADDED', item: I配置物集約 }
    | { type: 'REMOVED', item: I配置物集約 }
    | { type: 'CLEARED' }
    | { type: 'UPDATED' }; 

export interface ICanvasItemFactory {
    create付箋(pos: 描画座標点, text?: string, id?: string): 付箋集約<描画座標点>;
    create折れ線矢印(折れ線矢印vm: 折れ線矢印VM<描画座標点>): 折れ線矢印集約<描画座標点>;
}

export class CanvasGraphModel implements I描画空間, I配置物リポジトリ<描画座標点>, I接触点を教えてくれる人<描画座標点>, リスト配置可能<描画座標点>, Iグラフ配置先 {
    public 配置物リスト: I配置物集約[] = [];
    private _i接触点を教えてくれる人: I接触点を教えてくれる人<描画座標点> & リスト配置可能<描画座標点>;
    public readonly 描画基準座標: 描画基準座標;
    public metadata: キャンバスメタデータ;
    
    // イベントリスナー
    private _listeners: Set<(e: GraphEvent) => void> = new Set();
    
    // Factory
    private _factory?: ICanvasItemFactory;

    constructor() {
        this.描画基準座標 = new 描画基準座標(new 画面座標点(Px2DVector.fromNumbers(0,0)));
        this._i接触点を教えてくれる人 = new 無分割管理();
        this.metadata = キャンバスメタデータ.create(new キャンバスID("default"), "New Canvas");
    }
    
    public setFactory(factory: ICanvasItemFactory) {
        this._factory = factory;
    }
    
    public update拡縮率(delta: number, center: 画面座標点) {
        this.描画基準座標.拡縮率 = delta;
        this.描画基準座標.拡縮中心点 = center;
        this.notify({ type: 'UPDATED' });
    }

    public subscribe(listener: (e: GraphEvent) => void): () => void {
        this._listeners.add(listener);
        return () => { this._listeners.delete(listener); };
    }
    
    public notify(event: GraphEvent) {
        this._listeners.forEach(l => l(event));
    }

    // --- I配置物リポジトリ の実装 ---
    
    public add付箋(pos: Px2DVector, text?: string): 付箋集約<描画座標点> {
        return this.描画座標点でadd付箋(描画座標点.fromPx2DVector(pos, this.描画基準座標), text);
    }

    public 描画座標点でadd付箋(pos: 描画座標点, text?: string, 希望ID?: string): 付箋集約<描画座標点> {
        if (!this._factory) throw new Error("Factory not set");
        const 採用ID = this.衝突しない場合に限り希望IDを採用する(希望ID);
        const item = this._factory.create付箋(pos, text, 採用ID);
        this.add配置物(item);
        return item;
    }

    /**
     * 希望IDがボード内の既存配置物と衝突する場合はundefinedを返し、呼び出し側で新規ID発行させる。
     * ボード内でID文字列が重複すると、削除カスケードやUndo/Redoの矢印再接続がID文字列一致で
     * 対象を特定しているため、無関係な配置物を巻き込んで壊す（同一ボードへのコピー&貼り付けは
     * 必ず既存付箋とIDが衝突するため、この安全策なしでは通常操作が壊れる）。
     */
    private 衝突しない場合に限り希望IDを採用する(希望ID?: string): string | undefined {
        if (希望ID === undefined) return undefined;
        const 衝突している = this.配置物リスト.some(item => item.idString === 希望ID);
        return 衝突している ? undefined : 希望ID;
    }

    public add折れ線矢印(折れ線矢印vm: 折れ線矢印VM<描画座標点>): 折れ線矢印集約<描画座標点> {
        if (!this._factory) throw new Error("Factory not set");
        const item = this._factory.create折れ線矢印(折れ線矢印vm);
        this.add配置物(item);
        return item;
    }

    public add配置物(item: I配置物集約 | 接触判定可能な点) {
        if ('接触判定対象を登録する' in item) {
            this.配置物リスト.push(item);
            item.接触判定対象を登録する(this._i接触点を教えてくれる人);
            this.notify({ type: 'ADDED', item });
        } else {
            this._i接触点を教えてくれる人.add配置物(item);
        }
    }
    
    public remove配置物(item: I配置物集約) {
        const index = this.配置物リスト.indexOf(item);
        if (index > -1) {
            this.配置物リスト.splice(index, 1);

            // カスケード削除対象の特定と削除
            // 削除対象（item）に接続している矢印を抽出し連鎖削除する
            const 削除対象矢印群 = this.配置物リスト.filter(other => {
                if (is折れ線矢印集約<描画座標点>(other)) {
                    const arrow = other;
                    if (arrow.get始点接続付箋ID()?.id === item.idString || arrow.get終点接続付箋ID()?.id === item.idString) {
                        return true;
                    }
                }
                return false;
            });
            
            for (const arrow of 削除対象矢印群) {
                this.remove配置物(arrow);
            }

            this.notify({ type: 'REMOVED', item });
        }
    }
    
    public 全配置物クリア() {
        const items = [...this.配置物リスト];
        this.配置物リスト = [];
        this._i接触点を教えてくれる人 = new 無分割管理();
        
        items.forEach(item => {
            this.notify({ type: 'REMOVED', item });
        });
        this.notify({ type: 'CLEARED' });
    }

    public 接触点を取得(pos: 描画座標点): 接触判定可能な点|null {
        return this._i接触点を教えてくれる人.接触点を取得(pos);
    }
    
    public 接続点を取得(pos: 描画座標点): I接続点<描画座標点>|null {
        return this._i接触点を教えてくれる人.接続点を取得(pos);
    }

    public 未接続の点ハンドルを接続点と接続をtryする(接続点: 接続点<描画座標点>): void {
        this._i接触点を教えてくれる人.未接続の点ハンドルを接続点と接続をtryする(接続点);
    }
    
    public update描画基準座標原点(new原点: 画面座標点) {
        this.描画基準座標.描画原点 = new原点;
        this.notify({ type: 'UPDATED' });
    }

    public 配置物再描画(): void {
        for (const 配置物 of this.配置物リスト){
            配置物.再描画();
        }
    }

    // --- I接触点を教えてくれる人 / リスト配置可能 の実装 (委譲) ---

    // add配置物 is already implemented above

    public add接続点(接続点: 接続点<描画座標点>): void {
        this._i接触点を教えてくれる人.add接続点(接続点);
    }
    public add配置物リスト(nodes: Iterable<接触判定可能な点>): void {
        this._i接触点を教えてくれる人.add配置物リスト(nodes);
    }
    public add接続点リスト(接続点リスト: Iterable<接続点<描画座標点>>): void {
        this._i接触点を教えてくれる人.add接続点リスト(接続点リスト);
    }

}


