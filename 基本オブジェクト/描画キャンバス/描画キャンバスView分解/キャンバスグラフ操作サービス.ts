import { MouseEventData, 画面座標点 } from "SengenUI/index";
import { I配置物集約 } from "../../I配置物";
import { Iグラフ配置先 } from "../../配置物リポジトリ";
import { 配置物連結グラフ, 配置物連結グラフをすべて抽出, 配置物連結グラフ群 } from "../配置物グラフ/配置物連結グラフ";
import { テキスト用グラフ, テキスト用グラフ_付箋textfromJson, 付箋text, 配置物連結グラフtoテキスト用グラフノード } from "../配置物グラフ/テキスト化情報";
import { JSONファイル出力サービス } from "BoomYack/基本オブジェクト/ファイル入出力/JSONファイル出力サービス";
import { クリップボードサービス } from "BoomYack/基本オブジェクト/ファイル入出力/クリップボードサービス";
import { テキスト用グラフからキャンバスに配置するサービス } from "BoomYack/基本オブジェクト/グラフ計算サービス/グラフ計算サービス";

export class キャンバスグラフ操作サービス {
    private readonly Json出力サービス: JSONファイル出力サービス = JSONファイル出力サービス.create();
    private readonly クリップボードサービス: クリップボードサービス = クリップボードサービス.create();

    constructor(
        private readonly 配置先: Iグラフ配置先,
        private readonly ファイル名: () => string
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

    public グラフJson出力(_選択配置物: I配置物集約): void {}

    public async クリップボードから貼り付け(e: MouseEvent): Promise<void> {
        console.log('[BoomYack貼り付け] 貼り付け処理開始');
        const data = new MouseEventData(e);
        const pos = new 画面座標点(data.pos2DVector).to描画座標点(this.配置先.描画基準座標);
        const text = await this.クリップボードサービス.貼り付け();
        console.log('[BoomYack貼り付け] クリップボードから取得したテキスト長:', text.length);
        const グラフ: テキスト用グラフ<付箋text> | null = テキスト用グラフ_付箋textfromJson(text);
        if (グラフ === null) {
            console.error('[BoomYack貼り付け] ✗ グラフのパースに失敗しました');
            console.error('[BoomYack貼り付け] 受け取ったテキスト(最初300文字):', text.substring(0, 300));
            return;
        }
        try {
            console.log('[BoomYack貼り付け] ✓ グラフのパース成功, 配置開始');
            グラフ.exec(グラフ => {
                return new テキスト用グラフからキャンバスに配置するサービス(this.配置先, グラフ, pos).グラフを配置する();
            });
            console.log('[BoomYack貼り付け] ✓ 貼り付け完了');
        } catch (error) {
            console.error('[BoomYack貼り付け] ✗ 配置処理中にエラー:', error instanceof Error ? error.message : error);
            if (error instanceof Error) {
                console.error('[BoomYack貼り付け] スタックトレース:', error.stack);
            }
        }
    }
}
