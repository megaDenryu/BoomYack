---
type: technical_spec
status: seed
tags: [仕様書, UI設計, SengenUI, 状態遷移]
---

# 提案-012: SengenUIベースのUI状態遷移・実装設計

本ドキュメントでは、AI拡張生成機能をSengenUI（TypeScript）で実装するための、コンポーネントごとの明確な状態遷移（ステートマシン）とDOM設計を定義する。
HTMLモックアップ上で構築した機能と演出を、システムの構成要素として言語化したものである。

## 1. 状態遷移フローと責務配置

複雑性を解消するため、UIのレイヤーを「ノード本体」「オーバーレイ演出層」「コントロール層」の3つに分離し、独立した状態を持たせる。

### 1-1. コンポーネントツリー
```text
CanvasView (統括)
 ├── NodeLayer (z-index: 200/210)
 │    ├── CardNode (起点ノード)
 │    │    └── ExpandActionBtn (✨ボタン - 新規コンポーネント)
 │    └── DraftNodeSystem (生成された仮ノード群 - SengenUIコンポーネント管理)
 ├── EffectLayer (z-index: 500)
 │    └── ParticleEmitter (パーティクル放出用 - 新規コンポーネント)
 └── UILayer (z-index: 1000)
      └── ReviewBar (採用/破棄表示バー - 新規コンポーネント)
```

## 2. コンポーネントごとのステートマシン設計

SengenUI法（第2条3項、第4条）およびVanilla Extractを踏まえ、各要素の状態は `data-state` 属性で厳密に管理する。

### 2-1. `ExpandActionBtn` (✨マジックボタン)
起点ノードにアタッチされる拡張トリガーボタン。クリック透過を防ぐため `pointer-events: auto` となる。

| State (`data-state`) | 発生条件 | UI表現 (CSSアサイン) |
| :--- | :--- | :--- |
| `hidden` | 起点ノード非選択時 | `opacity: 0; pointer-events: none` |
| `visible` | 起点ノード選択時（通常待機）| `opacity: 1; right: -50px` (ネオングラデーション表示) |
| `loading` | ボタンクリック処理中 | ✨アイコンが非表示、スピナー表示 |
| `disabled` | 他の生成処理が進行中の場合 | `filter: grayscale(1); pointer-events: none` |

**遷移トリガー (SengenUI イベント)**:
- `onClick` → CanvasViewへ `GraphExpandRequested` カスタムイベント発火 → 状態を `loading` に遷移。
- サーバー応答受信時（成功/失敗） → 状態を `hidden` に戻し、GraphNode側の状態へ委譲。

### 2-2. `GraphNode` (ノード本体のDraft状態拡張)
生成された仮ノード。SengenUIの `LV2HtmlComponentBase` 継承コンポーネント（現状のCardNode等）に対して属性状態を拡張する。

| State (`data-state`) | 発生条件 | UI表現 (CSSアサイン) |
| :--- | :--- | :--- |
| `normal` | 通常のノード | 既存のスタイル |
| `draft` | AI生成による仮配置時 | `border: 2px dashed var(--accentColor); animation: pulseGlow 2s infinite;` (きらびやかな紫の明滅) |
| `accepting` | ユーザーが「採用」押下 | (0.2s間) `transform: scale(1.05);` → `normal`に完全移行 |
| `rejecting` | ユーザーが「破棄」押下 | (0.2s間) `transform: scale(0.9); opacity: 0;` → DOM削除 |

**SengenUI実装上の注意点**:
- Draft状態におけるテキストやスタイルの直接編集は許可しないため、対象コンポーネント内部のイベントリスナーで `data-state="draft"` 時は編集モード移行をブロックするガード節を設定する。

### 2-3. `ReviewBar` (フローティング承認バー)
キャンバス下のGUIレイヤー。

| State (`data-state`) | 発生条件 | UI表現 (CSSアサイン) |
| :--- | :--- | :--- |
| `hidden` | 通常時 / 処理完了後 | `transform: translateY(100px); pointer-events: none;` |
| `active` | AI生成後（DraftNodeが存在する間） | `transform: translateY(0); pointer-events: auto;` |

## 3. アニメーション（演出）実装指針

「きらびやかでミステリアスな魔法感」を明るいキャンバス上で実装に取り入れるための技術仕様。

1. **PulseGlow (明滅する仮枠線)**:
   - Vanilla Extractにて `keyframes` を定義。
   - `box-shadow` を用いた明滅を表現。明るい背景（BoomYackの基本色）に対し、きらびやかさを強調するため `inset` シャドウと強いボーダーカラー (`#8b5cf6` 等のパープルやシアン) を重畳する（モックアップのLight版で実証）。
2. **ParticleEmitter (粒子の飛散)**:
   - DOMの肥大化を防ぐため、キャンバス上で絶対座標を受け取り、1回使い捨てで複数の `div` 要素を生成・アニメーション・削除（`setTimeout` または `animationend` イベント）する独立したオブジェクトとして管理する。Reactのような仮想DOM差分に巻き込まれないSengenUIのDOM追記の利点を活かして実装する。
