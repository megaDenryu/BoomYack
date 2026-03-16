import { style } from '@vanilla-extract/css';

export const sticky_graph_board_container = style({
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    // Why: タッチデバイスでブラウザのデフォルトジェスチャ（スクロール・ピンチズーム等）を抑制し、独自のピンチズームとドラッグを使う
    touchAction: 'none'
});
