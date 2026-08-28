import { SvgC } from "SengenUI/index";

/**
 * 点ハンドルの見た目(SVG形状+ドラッグ/ホバー時の色変化)を差し替え可能にする契約。
 * 点ハンドルView(枠: ドラッグ・位置管理・回転)はこの形状の内部実装を知らない。
 */
export interface Iハンドル形状 {
    readonly svg: SvgC;
    ドラッグ時のスタイル変更(isDragging: boolean): void;
    ホバー時のスタイル変更(isHovered: boolean): void;
}
