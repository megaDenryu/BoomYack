import { style, keyframes } from '@vanilla-extract/css';

// アニメーション
export const panelFadeIn = keyframes({
    '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.9)' },
    '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
});

export const panelFadeOut = keyframes({
    '0%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
    '100%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.9)' }
});

// オーバーレイ背景
export const overlayBackdrop = style({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease'
});

export const overlayBackdropVisible = style({
    opacity: 1,
    pointerEvents: 'auto'
});

// セーブパネルコンテナ
export const savePanelContainer = style({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 999,
    width: '400px',
    maxHeight: '80vh',
    backgroundColor: '#2d2d2d',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    color: '#fff'
});

// ヘッダー
export const panelHeader = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #444',
    backgroundColor: '#363636'
});

export const panelTitle = style({
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0
});

export const closeButton = style({
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#aaa',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    ':hover': {
        backgroundColor: '#555',
        color: '#fff'
    }
});

// コンテンツエリア
export const panelContent = style({
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto'
});

// 入力グループ
export const inputGroup = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
});

export const inputLabel = style({
    fontSize: '14px',
    fontWeight: '500',
    color: '#bbb'
});

export const textInput = style({
    padding: '12px 16px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #555',
    backgroundColor: '#3d3d3d',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    ':focus': {
        borderColor: '#4CAF50'
    },
    '::placeholder': {
        color: '#888'
    }
});

// モード選択
export const modeSelector = style({
    display: 'flex',
    gap: '12px'
});

export const modeButton = style({
    flex: 1,
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '8px',
    border: '2px solid #555',
    backgroundColor: '#3d3d3d',
    color: '#aaa',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
        borderColor: '#666',
        color: '#fff'
    }
});

export const modeButtonActive = style({
    borderColor: '#4CAF50',
    backgroundColor: '#1e3a21',
    color: '#6abe6e',
    boxShadow: '0 0 8px rgba(76, 175, 80, 0.3)',
    ':hover': {
        borderColor: '#5bc95f',
        backgroundColor: '#254528',
        color: '#7dce81'
    }
});

// アクションボタン
export const actionButtonGroup = style({
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
});

export const primaryButton = style({
    flex: 1,
    padding: '14px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
        backgroundColor: '#45a049'
    },
    ':active': {
        backgroundColor: '#3d8b40'
    },
    ':disabled': {
        backgroundColor: '#555',
        color: '#888',
        cursor: 'not-allowed'
    }
});

export const secondaryButton = style({
    flex: 1,
    padding: '14px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    borderRadius: '8px',
    border: '2px solid #555',
    backgroundColor: 'transparent',
    color: '#aaa',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
        borderColor: '#666',
        color: '#fff'
    }
});

// セーブデータリスト
export const saveListContainer = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '200px',
    overflowY: 'auto'
});

export const saveListItem = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: '#3d3d3d',
    border: '2px solid #555',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
        borderColor: '#6abe6e',
        backgroundColor: '#454545'
    }
});

export const saveListItemSelected = style({
    borderColor: '#4CAF50',
    borderWidth: '2px',
    backgroundColor: '#1e3a21',
    boxShadow: '0 0 8px rgba(76, 175, 80, 0.4), inset 0 0 0 1px rgba(76, 175, 80, 0.3)',
    ':hover': {
        borderColor: '#5bc95f',
        backgroundColor: '#254528'
    }
});

export const saveItemName = style({
    fontSize: '14px',
    fontWeight: '500',
    color: '#fff'
});

export const saveItemDate = style({
    fontSize: '12px',
    color: '#888'
});

export const jsonFileOutputButton = style({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#f44336',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    ':hover': {
        backgroundColor: 'rgba(244, 67, 54, 0.2)'
    }
})

export const deleteItemButton = style({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#f44336',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    ':hover': {
        backgroundColor: 'rgba(244, 67, 54, 0.2)'
    }
});

// タブ
export const tabContainer = style({
    display: 'flex',
    borderBottom: '1px solid #444'
});

export const tab = style({
    flex: 1,
    padding: '12px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderBottom: '2px solid transparent',
    ':hover': {
        color: '#fff',
        backgroundColor: '#3a3a3a'
    }
});

export const tabActive = style({
    color: '#6abe6e',
    borderBottomColor: '#4CAF50',
    borderBottomWidth: '3px',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    ':hover': {
        color: '#7dce81',
        backgroundColor: 'rgba(76, 175, 80, 0.15)'
    }
});

// メッセージ
export const emptyMessage = style({
    padding: '24px',
    textAlign: 'center',
    color: '#888',
    fontSize: '14px'
});

// 仮ゴミ箱関連
export const trashToggleButton = style({
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    padding: '6px 10px',
    fontSize: '12px',
    borderRadius: '6px',
    border: '1px solid #f44336',
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    color: '#f44336',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    ':hover': {
        backgroundColor: 'rgba(244, 67, 54, 0.25)'
    }
});

export const trashBadge = style({
    backgroundColor: '#f44336',
    color: '#fff',
    borderRadius: '10px',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: 'bold'
});

export const trashedItem = style({
    opacity: 0.6,
    backgroundColor: '#3a2a2a',
    border: '1px dashed #f44336',
    ':hover': {
        backgroundColor: '#3f2f2f',
        borderColor: '#ff6659'
    }
});

export const restoreButton = style({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#4CAF50',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    ':hover': {
        backgroundColor: 'rgba(76, 175, 80, 0.2)'
    }
});
