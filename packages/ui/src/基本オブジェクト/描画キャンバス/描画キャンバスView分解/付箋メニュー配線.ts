import { 描画座標点 } from "SengenUI/index";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { Iキャンバスコマンド } from "../../キャンバス操作/コマンドリポジトリ/Iキャンバスコマンド";
import { VoiceRecognitionService } from "../../キャンバス操作/音声認識サービス";
import { ボード基準座標変換 } from "../../キャンバス操作/座標変換/ボード基準座標変換";
import { AiOperationService } from "../../AI連携/AiOperationService";
import { 付箋集約 } from "../../配置物/付箋2/付箋集約";
import { 自動リサイズ付箋用コンテキストメニュー依存関係 } from "../../配置物/付箋2/自動リサイズ付箋View";
import { キャンバスグラフ操作サービス } from "./キャンバスグラフ操作サービス";
import { 付箋設定パネル表示 } from "./付箋設定パネル表示";

export interface 付箋メニュー配線依存関係 {
    selection: I配置物選択機能集約;
    graph: キャンバスグラフ操作サービス;
    ai: AiOperationService;
    voice: VoiceRecognitionService;
    settings: 付箋設定パネル表示;
    座標変換: ボード基準座標変換;
    onDelete(): void;
    onCommandPush: ((command: Iキャンバスコマンド) => void) | undefined;
}

export function 付箋メニュー配線を作る(付箋を得る: () => 付箋集約<描画座標点>, dep: 付箋メニュー配線依存関係)
    : 自動リサイズ付箋用コンテキストメニュー依存関係 {
    return {
        座標変換: dep.座標変換,
        on削除: dep.onDelete,
        on設定パネル表示: position => dep.settings.表示する(付箋を得る(), position),
        onAI生成: () => dep.ai.executeGenerate(付箋を得る()),
        onAI分解_LLM: () => dep.ai.executeDecompose(付箋を得る(), "意味クラスタ"),
        onAI分解_区切り文字: () => dep.ai.executeDecompose(付箋を得る(), "文単位"),
        onグラフをテキストとしてコピー: () => dep.graph.グラフをテキストとしてコピー(付箋を得る()),
        onグラフをJSON出力: () => dep.graph.グラフを選択してjsonファイル出力(付箋を得る()),
        on選択配置物をコピー: () => dep.graph.選択中の配置物をコピー(dep.selection.選択中配置物),
        onクリップボードから貼り付け: e => dep.graph.クリップボードから貼り付け(e, dep.onCommandPush),
        onグラフ選択: () => {
            const graph = dep.graph.グラフを選択(付箋を得る());
            if (graph) for (const item of graph.配置物集約リスト) dep.selection.追加選択(item);
        },
        onマイク入力トグル: () => dep.voice.toggleRecording(),
        getマイク入力状態: () => dep.voice.getIsRecording(),
        onマイク状態監視登録: callback => dep.voice.onStateChange(callback),
    };
}
