import { style } from '@vanilla-extract/css';

export const 設定パネルコンテナ = style({
    position: 'absolute',
    minWidth: '200px',
    backgroundColor: '#ffffff',
    border: '2px solid #333',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: '1000'
});

export const 設定パネルヘッダー = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid #ddd'
});

export const 設定パネルタイトル = style({
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333'
});

export const 閉じるボタン = style({
    width: '24px',
    height: '24px',
    border: 'none',
    backgroundColor: '#ff4444',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ':hover': {
        backgroundColor: '#cc0000'
    }
});

export const 設定項目 = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
});

export const 設定項目ラベル = style({
    fontSize: '12px',
    color: '#666'
});

export const カラー入力 = style({
    width: '100%',
    height: '32px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer'
});

export const 数値入力 = style({
    width: '100%',
    height: '32px',
    padding: '0 8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px'
});