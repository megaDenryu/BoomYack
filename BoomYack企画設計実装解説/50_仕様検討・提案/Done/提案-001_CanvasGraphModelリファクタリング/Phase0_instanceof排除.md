# Phase 0: instanceof排除【✅ Done — commit `055cfb0`】

> **リスク**: 低（メソッド追加のみ。型エラーで漏れを検知可能）

## 概要

`I配置物集約`にポリモーフィックなメソッドを追加し、各具象クラスが自分の登録方法を知るようにする。

## Before / After

```typescript
// Before: CanvasGraphModel内のinstanceof分岐
if (item instanceof 矢印接続可能付箋Old) {
    this._i接触点を教えてくれる人.add接続点リスト(item.接続点リスト);
} else if (item instanceof 折れ線矢印集約) {
    this._i接触点を教えてくれる人.add配置物(item.始点ハンドル);
    this._i接触点を教えてくれる人.add配置物(item.終点ハンドル);
}

// After: 各配置物が自身で登録（Visitorパターン簡略版）
interface I配置物集約 {
    接触判定対象を登録する(target: I接触点登録先): void;
    ドラッグ移動対象を収集する(roster: I移動対象ロスター): void;
    idString: string;
}

// 矢印接続可能付箋Old側
接触判定対象を登録する(target: I接触点登録先): void {
    target.add接続点リスト(this.接続点リスト);
}

// 折れ線矢印集約側
接触判定対象を登録する(target: I接触点登録先): void {
    target.add配置物(this.始点ハンドル);
    target.add配置物(this.終点ハンドル);
}
```

## 変更対象ファイル

| ファイル | 変更内容 |
|---|---|
| `I配置物.ts` | `I接触点登録先`追加、`接触判定対象を登録する`・`ドラッグ移動対象を収集する`・`idString`をI配置物集約に追加 |
| `矢印接続可能付箋Old.ts` | 上記3メソッド実装 |
| `折れ線矢印集約.ts` | 上記3メソッド実装 |
| `CanvasGraphModel.ts:95-108` | instanceof分岐の除去 |
| `まとめて移動サービス.ts:20-30` | 同上 |
| `配置物連結グラフ.ts:60-80` | 同上 |
| `配置物情報.ts:44-53` | 同上 |