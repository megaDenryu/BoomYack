---
description: Implementation plan for Proposal-001 (CanvasGraphModel Refactoring)
---
# Implementation Plan: 提案-001 CanvasGraphModel Refactoring

提案-001 に基づき、`CanvasGraphModel` の責務分割を行います。

## Phase 1: Create Repository Layer
データ管理（配置物リスト、追加・削除操作）を担当する `CanvasGraphRepository` を作成し、現行の `CanvasGraphModel` からロジックを委譲させます。

- [ ] `CanvasGraphRepository.ts` を作成（`I配置物` の配列管理）。
- [ ] `CanvasGraphModel` に `CanvasGraphRepository` インスタンスを持たせる。
- [ ] `add付箋`, `remove配置物` 等のメソッドを Repository への委譲に変更。
- [ ] 既存機能（追加・削除）が正常動作することを確認。

## Phase 2: Extract Contact Resolver
接触判定ロジックを担当する `ContactResolverService` を作成します。

- [ ] `ContactResolverService.ts` を作成。
- [ ] `I接触点を教えてくれる人` インターフェースの実装を `CanvasGraphModel` から移動。
- [ ] `CanvasGraphModel` は `ContactResolverService` を保持し、リクエストを委譲。
- [ ] 矢印接続時の動作確認。

## Phase 3: Separate Rendering Controller
描画ループと再描画スケジューリングを担当する `CanvasRenderingController` を作成します。

- [ ] `CanvasRenderingController.ts` を作成。
- [ ] `requestAnimationFrame` や `再描画` フラグ管理を `CanvasGraphModel` から移動。
- [ ] Controller が Repository の変更を監視し、View に描画指示を出すフローに変更。

## Phase 4: Final Cleanup & Integration
`CanvasGraphModel` を削除、または軽量なファサードとして再定義し、`CanvasView` が直接 Repository/Service/Controller を利用するように変更します。

- [ ] `CanvasView` の依存関係を `CanvasGraphModel` から新クラス群へ変更。
- [ ] 不要になった `CanvasGraphModel` コードの削除。
- [ ] 全体動作確認（リグレッションテスト）。
