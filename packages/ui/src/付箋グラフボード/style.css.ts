import { style } from '@vanilla-extract/css';

export const sticky_graph_board_container = style({
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    touchAction: 'none',
    // 恒等transform。祖先にtransformがあるとposition:fixedの子孫の包含ブロックが
    // ビューポートからこの要素に切り替わる（CSS仕様）。これによりSengenUIの
    // setViewportPositionByTransform()で配置される全配置物・メニュー等の基準が
    // ボードルートに固定され、overflow:hiddenのクリップも効くようになる。
    // 単体アプリではボードルート＝ビューポート全域なので数値的には恒等（無変化）。
    transform: 'translate(0px, 0px)'
});
