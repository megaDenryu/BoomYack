# Phase 3: 描画スケジューリングのView層移動【✅ Done — commit `c8a6853`】

> **リスク**: 中（描画タイミングの変更はパフォーマンスに直結。手動テスト必須）

## 概要

`requestAnimationFrame`ロジックを`CanvasGraphModel`から削除し、View層（`CanvasView`）に移動。
ModelのGraphEventをViewがsubscribeし、View側でバッチ再描画をスケジューリングする形に変更。

## Before

```
CanvasGraphModel.再描画をスケジュール()  ← requestAnimationFrame を保持
CanvasGraphModel.即座に再描画()
CanvasGraphModel.配置物再描画()
```

## After

```
CanvasView.再描画をスケジュール()       ← View側で requestAnimationFrame を管理
// CanvasGraphModel が GraphEvent('UPDATED') を emit
// CanvasView が UPDATED を受け取り、rAFでバッチ再描画をスケジューリング
```

## 変更対象ファイル

| ファイル | 変更内容 |
|---|---|
| `CanvasGraphModel.ts` | `requestAnimationFrame`/`cancelAnimationFrame`を削除 |
| `CanvasView.ts` | `再描画をスケジュール()`追加、`UPDATED`イベント受信時にrAFでバッチ再描画 |

## 検証ポイント

- ズーム・パン時のfpsが変化していないか
- 複数の`UPDATED`イベントが短時間に連続した場合にrAFが正しくバッチされるか