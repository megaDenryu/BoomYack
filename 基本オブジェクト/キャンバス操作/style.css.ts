import { style, keyframes } from '@vanilla-extract/css';

// アニメーション時間定数（ミリ秒）
export const 円状メニューアニメーション時間 = 75;

// keyframes名をエクスポート（setStyleCSSで使用するため）
export const fadeInKeyframes = keyframes({
    '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
    '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
});

export const fadeOutKeyframes = keyframes({
    '0%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
    '100%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' }
});

export const 円状メニューコンテナ = style({
    position: 'fixed',
    width: '200px',
    height: '200px',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    opacity: 0
});

export const 円状メニュー中央エリア = style({
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '30px',
    height: '30px',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    border: '2px solid #666'
});

export const 円状メニューアイテム = style({
    position: 'absolute',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    pointerEvents: 'auto',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.2s ease',
    ':hover': {
        backgroundColor: '#45a049',
        transform: 'translate(-50%, -50%) scale(1.15)'
    },
    ':active': {
        backgroundColor: '#3d8b40',
        transform: 'translate(-50%, -50%) scale(0.95)'
    }
});
