import { LV2HtmlComponentBase, Px長さ } from "SengenUI/index";

import { 付箋設定状態 } from "../設定パネル";
import { 付箋コンテンツデータ } from "../../描画キャンバス/付箋コンテンツデータ";

/**
 * どのコンテンツ種別でも共通して必要になる依存関係。初期値(初期テキスト等)は
 * 種別ごとに形が異なるため含めず、種別ごとの依存関係interfaceがこれを拡張する。
 */
export interface 付箋コンテンツView共通依存関係 {
    最小高さ: Px長さ;
    onTextChange: (text: string) => void;
    onHeightChange: (newHeight: number) => void;
    onBlurTextCommit: (oldText: string, newText: string) => void;
    onFocus: () => void;
}

/**
 * 付箋コンテンツ(自由テキスト)を構築するために枠(自動リサイズ付箋View)から渡す依存関係。
 */
export interface 付箋コンテンツView依存関係 extends 付箋コンテンツView共通依存関係 {
    初期テキスト: string;
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
    /** AI生成/分解・グラフのテキストコピー等が要求する平文表現 */
    get text(): string;
    setText(text: string): void;
    /** シリアライズ用の構造化データ。種別ごとのフィールド(タイトル/本文等)を欠落させずに永続化するために必要 */
    get コンテンツデータ(): 付箋コンテンツデータ;
    設定を適用(設定: 付箋設定状態): void;
}
