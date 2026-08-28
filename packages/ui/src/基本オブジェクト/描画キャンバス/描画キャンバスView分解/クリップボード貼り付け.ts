import { MouseEventData, 画面座標点, 描画座標点, Px2DVector } from "SengenUI/index";
import { I配置物集約 } from "../../I配置物";
import { Iキャンバスコマンド } from "../../キャンバス操作/コマンドリポジトリ/Iキャンバスコマンド";
import { 配置物追加コマンド } from "../../キャンバス操作/コマンドリポジトリ/具体的なコマンド群";
import { ボード基準座標変換 } from "../../キャンバス操作/座標変換/ボード基準座標変換";
import { クリップボードサービス } from "../../ファイル入出力/クリップボードサービス";
import { テキスト用グラフからキャンバスに配置するサービス } from "../../グラフ計算サービス/グラフ計算サービス";
import { テキスト用グラフ, テキスト用グラフ_付箋textfromJson, 付箋text } from "../配置物グラフ/テキスト化情報";
import { CanvasGraphModel } from "./CanvasGraphModel";

export async function クリップボードから貼り付ける(model: CanvasGraphModel, clipboard: クリップボードサービス,
    座標変換: ボード基準座標変換, e?: MouseEvent,
    commandを積む?: (command: Iキャンバスコマンド) => void): Promise<void> {
    console.log("[BoomYack貼り付け] 貼り付け処理開始");
    const text = await clipboard.貼り付け();
    const pos = 貼り付け位置を得る(model, 座標変換, e);
    console.log("[BoomYack貼り付け] クリップボードから取得したテキスト長:", text.length);
    const graph: テキスト用グラフ<付箋text> | null = テキスト用グラフ_付箋textfromJson(text);
    if (graph === null) {
        console.warn("[BoomYack貼り付け] グラフ情報のパースに失敗しました。通常のテキストとして付箋に貼り付けます。");
        const item = model.描画座標点でadd付箋(pos, text);
        if (commandを積む && item) commandを積む(new 配置物追加コマンド(model, item));
        return;
    }
    try {
        console.log("[BoomYack貼り付け] ✓ グラフのパース成功, 配置開始");
        let added: I配置物集約[] = [];
        graph.exec(value => { added = new テキスト用グラフからキャンバスに配置するサービス(model, value, pos).グラフを配置する(); });
        if (commandを積む && added.length > 0) commandを積む(new 配置物追加コマンド(model, added));
        console.log("[BoomYack貼り付け] ✓ 貼り付け完了");
    } catch (error) {
        console.error("[BoomYack貼り付け] ✗ 配置処理中にエラー:", error instanceof Error ? error.message : error);
        if (error instanceof Error) console.error("[BoomYack貼り付け] スタックトレース:", error.stack);
    }
}

function 貼り付け位置を得る(model: CanvasGraphModel, 座標変換: ボード基準座標変換,
    e?: MouseEvent): 描画座標点 {
    if (e) {
        const data = new MouseEventData(e);
        return 座標変換.画面座標点を補正する(data.position.x, data.position.y).to描画座標点(model.描画基準座標);
    }
    return new 画面座標点(Px2DVector.fromNumbers(window.innerWidth / 2, window.innerHeight / 2))
        .to描画座標点(model.描画基準座標);
}
