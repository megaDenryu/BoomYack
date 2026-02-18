---
type: Proposal
status: Draft
created: 2026-02-19
author: AI Agent
---
# 提案-001: CanvasGraphModelの責務分割とリファクタリング計画

## 1. 現状 (Current State)
`CanvasGraphModel` (`app-ts/src/BoomYack/基本オブジェクト/描画キャンバス/描画キャンバスView分解/CanvasGraphModel.ts`) は、現在以下の3つの主要な責務を単一のクラスで担っています。

1.  **Repository**: 配置物のリスト管理 (`add付箋`, `remove配置物`, etc.)
2.  **Contact Resolver**: マウス位置からの接触判定 (`接触点を取得`, `I接触点を教えてくれる人`の実装)
3.  **Rendering Controller**: 描画ループの制御 (`requestAnimationFrame`による再描画スケジューリング)

## 2. 問題点・課題 (Problem / Motivation)
- **責務の過集中 (God Class)**: クラスが肥大化しつつあり、変更の影響範囲が予測しづらい状態です。特に「描画制御」と「データ管理」が密結合しているため、データロジックのテストが困難です。
- **SengenUI憲法違反の懸念**: `Functional DDD` の原則（可変状態の分離）に反し、状態（`描画基準座標`）とロジック、さらに副作用（描画命令）が混在しています。
- **拡張性の欠如**: 今後「レイヤー機能」や「サブグラフ（グループ）」を実装する際、現在の構造では複雑度が指数関数的に増大します。

## 3. 提案内容 (Proposed Solution)
`CanvasGraphModel` を以下の3つのクラス・サービスに分割することを提案します。

1.  **`CanvasGraphRepository` (New)**:
    -   純粋なデータ管理（配置物リストの保持、追加、削除）。
    -   イベント通知 (`ADDED`, `REMOVED`) の発行。
    -   `CanvasGraphModel` からデータ管理部分を委譲。

2.  **`ContactResolverService` (Refactor)**:
    -   既存の `I接触点を教えてくれる人` ロジックを独立したサービスとして切り出し。
    -   Repositoryを受け取り、計算結果（接触点）を返す純粋な計算機に近い形を目指す。

3.  **`CanvasRenderingController` (New/Refactor)**:
    -   `requestAnimationFrame` ループと再描画スケジューリングを管理。
    -   Model (Repository) の変更イベントを購読し、View (Placement Views) に描画を指示する。

### 3-1. UI/UX設計案 (UI Design)
内部リファクタリングであるため、**既存のUI/UXに変更はありません。**
ただし、描画パフォーマンス（ズーム・パン時の滑らかさ）が維持・向上されることを確認します。

### 3-2. 設計憲法・適合チェック (Constitution Check)
- [x] DOM操作を直接行っていないか？ -> はい（Controller分割によりDOM操作も整理される）
- [x] LV2コンポーネントを継承していないか？ -> はい
- [x] スタイルは Vanilla Extract を使用しているか？ -> 該当なし（ロジックのみ）
- [x] 安易な `any` や `cast` を使用する計画になっていないか？ -> はい、型安全性を重視する

## 4. 影響範囲 (Impact)
- `CanvasView.ts`: Modelの生成・利用部分に変更が入ります。
- `CanvasItemFactory.ts`: Modelへの依存方法が変わる可能性があります。
- 既存のテストコード（もしあれば）。

## 5. 代替案 (Alternatives)
- **現状維持**: 小規模なうちは問題ないが、ボイスロイド同人誌作成ツールとして機能拡張（レイヤー、タイムライン等）が進むにつれ、技術的負債が開発速度を著しく低下させるリスクがあるため却下。
