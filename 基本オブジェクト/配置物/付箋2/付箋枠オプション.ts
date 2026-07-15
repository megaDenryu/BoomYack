import { Canvas座標Base, Drag中値, Px2DVector, Px長さ, 配置物座標点, 描画座標点 } from "SengenUI/index";
import { コンテキストメニューコンテナ } from "BoomYack/基本オブジェクト/キャンバス操作/円状コンテキストメニュー/コンテキストメニューコンテナ";
import { ボード基準座標変換 } from "BoomYack/基本オブジェクト/キャンバス操作/座標変換/ボード基準座標変換";
import { FudabaAPIクライアント } from "../../Fudaba連携/FudabaAPIクライアント";
import { 付箋コンテンツデータ } from "../../描画キャンバス/付箋コンテンツデータ";
import { 付箋枠 } from "./付箋枠";

export interface 自動リサイズ付箋Viewオプション<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> {
    position: 座標点T;
    size: Px2DVector;
    minHeight: Px長さ;
    初期コンテンツ: 付箋コンテンツデータ;
    コンテキストメニューコンテナ: コンテキストメニューコンテナ;
    fudabaAPIクライアント: FudabaAPIクライアント;
    onDrag?: (e: Drag中値, ドラッグしたコンポーネント: 付箋枠<座標点T>) => void;
    onResize?: () => void;
    onTextChange?: (text: string) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onTextCommit?: (oldText: string, newText: string) => void;
}

export interface 自動リサイズ付箋用コンテキストメニュー依存関係 {
    座標変換: ボード基準座標変換;
    on削除: () => void;
    on設定パネル表示: (現在位置: 描画座標点) => void;
    onAI生成?: () => void;
    onAI分解_LLM?: () => void;
    onAI分解_区切り文字?: () => void;
    onグラフをテキストとしてコピー?: () => void;
    onグラフをJSON出力?: () => void;
    on選択配置物をコピー?: () => void;
    onクリップボードから貼り付け?: (e: MouseEvent) => void;
    onグラフ選択?: () => void;
    onマイク入力トグル?: () => void;
    getマイク入力状態?: () => boolean;
    onマイク状態監視登録?: (callback: (isRecording: boolean) => void) => void;
}
