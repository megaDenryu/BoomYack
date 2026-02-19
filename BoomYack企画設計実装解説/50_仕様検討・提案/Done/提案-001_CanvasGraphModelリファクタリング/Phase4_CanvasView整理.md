# Phase 4: CanvasViewのスリム化【✅ Done】

> **リスク**: 低（プロキシメソッド削除のみ。呼び出し元変更は機械的）

## 概要

`CanvasView`のプロキシメソッド（`保存()`、`読み込み()`、`グラフ選択()`等）を排除。
`StickyGraphBoard`等の上位層が直接`model`・`persistence`・`キャンバスグラフ操作サービス`にアクセスする形に変更。
CanvasViewはDOM構築とUIイベントハンドリングのみに集中させる。

## 削除対象プロキシメソッド（予定）

```typescript
// CanvasView から削除するメソッド例
保存(): void               // → CanvasPersistenceManager.保存() に直接アクセス
読み込み(): void            // → 同上
ローカル保存(): void        // → 同上
ローカル読み込み(): void    // → 同上
グラフ選択(): void          // → キャンバスグラフ操作サービス.グラフを選択() に直接アクセス
グラフをテキストとしてコピー(): void  // → 同上
```

## 実装手順

1. `grep -r "canvasView\." --include="*.ts"` でCanvasViewのプロキシ呼び出しを全抽出
2. 呼び出し元（主に`StickyGraphBoard`）を直接依存先のサービスに向け替え
3. `CanvasView`から削除しても型エラーが出ないことをcleanBuildで確認

## 変更対象ファイル

| ファイル | 変更内容 |
|---|---|
| `CanvasView.ts` | プロキシメソッド群を大幅削除 |
| `StickyGraphBoard（付箋グラフボード.ts）` | `canvasView.保存()` → `persistence.保存()` 等に直接アクセス |

## 備考

`CanvasView`が`StickyGraphBoard`から直接DI注入される設計になっていれば、フィールドを`public readonly`で公開するだけでphase4は完了する見込み。