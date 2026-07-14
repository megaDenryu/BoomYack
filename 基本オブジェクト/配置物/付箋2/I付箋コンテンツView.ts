import { LV2HtmlComponentBase, Px長さ } from "SengenUI/index";

import { 付箋設定状態 } from "../設定パネル";

/**
 * 付箋コンテンツ(自由テキスト/将来のタイトル付き・キー値リスト等)を構築するために
 * 枠(自動リサイズ付箋View)から渡す依存関係。
 */
export interface 付箋コンテンツView依存関係 {
    初期テキスト: string;
    最小高さ: Px長さ;
    onTextChange: (text: string) => void;
    onHeightChange: (newHeight: number) => void;
    onBlurTextCommit: (oldText: string, newText: string) => void;
    onFocus: () => void;
}

/**
 * 付箋の「枠」(ドラッグ・矢印接続・選択・コンテキストメニュー・zIndex)から独立して
 * 差し替え可能な付箋コンテンツの契約。枠はコンテンツの内部実装を知らず、この
 * インターフェース越しにのみテキストの読み書きと見た目の適用を行う。
 *
 * サイズ契約: 枠はコンテンツに利用可能幅を(CSSのwidth:100%を通じて)与え、
 * コンテンツは自然高さの変化を依存関係.onHeightChangeで枠へ通知する。
 * 枠はその通知を受けて外形を確定し、接続点・矢印の再配置を行う(一方向ループ)。
 */
export interface I付箋コンテンツView extends LV2HtmlComponentBase {
    get text(): string;
    setText(text: string): void;
    設定を適用(設定: 付箋設定状態): void;
}
