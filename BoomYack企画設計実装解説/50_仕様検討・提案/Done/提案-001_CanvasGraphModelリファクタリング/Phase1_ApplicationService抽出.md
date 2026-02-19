# Phase 1: ApplicationServiceロジックの抽出【✅ Done — commit `13eb00d`, `6feae6c`】

> **リスク**: 低〜中（メソッド移動が主。CanvasView側のプロキシ呼び出しが変わる）

## 概要

`CanvasGraphModel`からグラフ分析・クリップボード・JSON出力のロジックを`キャンバスグラフ操作サービス`に抽出。
Modelはインフラサービス・MouseEventを知らない純粋な状態管理に特化させる。

同時に、グラフ計算サービス群の`CanvasGraphModel`依存を`Iグラフ配置先`インターフェースに置き換えてISPの準備をした。

## 抽出対象メソッド

```
CanvasGraphModel.グラフを抽出()
CanvasGraphModel.グラフを選択()
CanvasGraphModel.グラフを選択してjsonファイル出力()
CanvasGraphModel.グラフをテキストとしてコピー()
CanvasGraphModel.クリップボードから貼り付け(e: MouseEvent)  ← UIイベントがModelに存在するレイヤー違反
CanvasGraphModel.Json出力サービス                          ← インフラ依存
CanvasGraphModel.クリップボードサービス                      ← インフラ依存
```

**移動先**: 新クラス `キャンバスグラフ操作サービス`（ApplicationService層）

## 新クラス構造

```typescript
// コンストラクタでModelへの参照とインフラサービスを受け取る
class キャンバスグラフ操作サービス {
    constructor(
        readonly model: CanvasGraphModel,
        readonly json出力: Json出力サービス,
        readonly クリップボード: クリップボードサービス
    ) {}

    グラフを選択してjsonファイル出力(): void { ... }
    グラフをテキストとしてコピー(): void { ... }
    クリップボードから貼り付け(e: MouseEvent): void { ... }
}
```

## 変更対象ファイル

| ファイル | 変更内容 |
|---|---|
| `配置物リポジトリ.ts` | `Iグラフ配置先`インターフェース追加 |
| `グラフ計算サービス/レイアウトStrategy/*.ts` | 全Strategy: `CanvasGraphModel` → `Iグラフ配置先`に依存切り替え |
| `グラフ計算サービス/グラフ計算サービス.ts` | `model` → `配置先: Iグラフ配置先` |
| `CanvasGraphModel.ts` | `implements Iグラフ配置先`追加、ApplicationServiceメソッド削除 |
| `キャンバスグラフ操作サービス.ts` | **新規作成** |
| `CanvasView.ts` | `グラフ操作サービス`経由に変更 |