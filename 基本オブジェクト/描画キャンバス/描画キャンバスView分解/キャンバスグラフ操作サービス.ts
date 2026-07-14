import { MouseEventData, 画面座標点, 描画座標点, Px2DVector } from "SengenUI/index";
import { I付箋シリアライズ可能, I配置物集約 } from "../../I配置物";
import { Iグラフ配置先 } from "../../配置物リポジトリ";
import { 配置物連結グラフ, 配置物連結グラフをすべて抽出, 配置物連結グラフ群 } from "../配置物グラフ/配置物連結グラフ";
import { テキスト用グラフ, テキスト用グラフノード, テキスト用グラフ_付箋textfromJson, 付箋text, 配置物連結グラフtoテキスト用グラフノード } from "../配置物グラフ/テキスト化情報";
import { 付箋コンテンツをtextへ変換 } from "../付箋コンテンツデータ";
import { JSONファイル出力サービス } from "BoomYack/基本オブジェクト/ファイル入出力/JSONファイル出力サービス";
import { クリップボードサービス } from "BoomYack/基本オブジェクト/ファイル入出力/クリップボードサービス";
import { テキスト用グラフからキャンバスに配置するサービス } from "BoomYack/基本オブジェクト/グラフ計算サービス/グラフ計算サービス";
import { Iキャンバスコマンド } from "BoomYack/基本オブジェクト/キャンバス操作/コマンドリポジトリ/Iキャンバスコマンド";
import { 配置物追加コマンド } from "BoomYack/基本オブジェクト/キャンバス操作/コマンドリポジトリ/具体的なコマンド群";
import { CanvasGraphModel } from "./CanvasGraphModel";
import { ボード基準座標変換 } from "BoomYack/基本オブジェクト/キャンバス操作/座標変換/ボード基準座標変換";

export class キャンバスグラフ操作サービス {
    private readonly Json出力サービス: JSONファイル出力サービス = JSONファイル出力サービス.create();
    private readonly クリップボードサービス: クリップボードサービス = クリップボードサービス.create();

    constructor(
        private readonly 配置先: Iグラフ配置先,
        private readonly ファイル名: () => string,
        private readonly 座標変換: ボード基準座標変換
    ) {}

    public グラフを抽出(): 配置物連結グラフ群 {
        return 配置物連結グラフをすべて抽出(this.配置先.配置物リスト);
    }

    public グラフを選択(配置物: I配置物集約): 配置物連結グラフ | null {
        return this.グラフを抽出().配置物が含まれるグラフを取得(配置物);
    }

    public グラフを選択してjsonファイル出力(配置物: I配置物集約): void {
        const テキスト用グラフ = this.グラフを選択(配置物)?.exec(グラフ => {
            return グラフ.exec(配置物連結グラフtoテキスト用グラフノード);
        });
        if (!テキスト用グラフ) return;
        this.Json出力サービス.出力(テキスト用グラフ, `${this.ファイル名()}.graphtext.json`);
    }

    public グラフをテキストとしてコピー(選択配置物: I配置物集約): void {
        const テキスト用グラフ = this.グラフを選択(選択配置物)?.exec(グラフ => {
            return グラフ.exec(配置物連結グラフtoテキスト用グラフノード);
        });
        if (!テキスト用グラフ) return;
        this.クリップボードサービス.コピー(テキスト用グラフ.toJson());
    }

    /**
     * 選択中の配置物のみをコピーする（接続グラフを辿らない）。
     * 付箋のテキストをリンクなしのグラフノードとしてシリアライズし、クリップボードに書き込む。
     */
    public 選択中の配置物をコピー(選択配置物リスト: I配置物集約[]): void {
        // 付箋のみを対象とする（矢印は単独コピーの意味がないため除外）
        const 付箋リスト = 選択配置物リスト.filter(
            (item): item is I付箋シリアライズ可能 & I配置物集約 => item.type === "付箋"
        );
        if (付箋リスト.length === 0) return;

        const ノードリスト = 付箋リスト.map(付箋 => {
            const データ = 付箋.toシリアライズデータ();
            const text = 付箋コンテンツをtextへ変換(データ.コンテンツ);
            const id: string = 付箋.idString;
            return new テキスト用グラフノード<付箋text>({ text }, id, [], []);
        });

        const グラフ = new テキスト用グラフ<付箋text>(ノードリスト, "interface 付箋text{text:string;}");
        this.クリップボードサービス.コピー(グラフ.toJson());
    }

    public グラフJson出力(_選択配置物: I配置物集約): void {}

    public async クリップボードから貼り付け(e?: MouseEvent, onCommandPush?: (cmd: Iキャンバスコマンド) => void): Promise<void> {
        console.log('[BoomYack貼り付け] 貼り付け処理開始');
        const text = await this.クリップボードサービス.貼り付け();
        let pos: 描画座標点;
        if (e) {
            const data = new MouseEventData(e);
            const 補正済み画面座標点 = this.座標変換.画面座標点を補正する(data.position.x, data.position.y);
            pos = 補正済み画面座標点.to描画座標点(this.配置先.描画基準座標);
        } else {
            const centerPx = Px2DVector.fromNumbers(window.innerWidth / 2, window.innerHeight / 2); // 画面中央
            pos = new 画面座標点(centerPx).to描画座標点(this.配置先.描画基準座標);
        }
        console.log('[BoomYack貼り付け] クリップボードから取得したテキスト長:', text.length);
        const グラフ: テキスト用グラフ<付箋text> | null = テキスト用グラフ_付箋textfromJson(text);
        if (グラフ === null) {
            console.warn('[BoomYack貼り付け] グラフ情報のパースに失敗しました。通常のテキストとして付箋に貼り付けます。');
            const item = this.配置先.描画座標点でadd付箋(pos, text);
            if (onCommandPush && item) {
                onCommandPush(new 配置物追加コマンド(this.配置先 as CanvasGraphModel, item));
            }
            return;
        }
        try {
            console.log('[BoomYack貼り付け] ✓ グラフのパース成功, 配置開始');
            let addedItems: I配置物集約[] = [];
            グラフ.exec(グラフ => {
                addedItems = new テキスト用グラフからキャンバスに配置するサービス(this.配置先, グラフ, pos).グラフを配置する();
            });
            if (onCommandPush && addedItems.length > 0) {
                onCommandPush(new 配置物追加コマンド(this.配置先 as CanvasGraphModel, addedItems));
            }
            console.log('[BoomYack貼り付け] ✓ 貼り付け完了');
        } catch (error) {
            console.error('[BoomYack貼り付け] ✗ 配置処理中にエラー:', error instanceof Error ? error.message : error);
            if (error instanceof Error) {
                console.error('[BoomYack貼り付け] スタックトレース:', error.stack);
            }
        }
    }
}
