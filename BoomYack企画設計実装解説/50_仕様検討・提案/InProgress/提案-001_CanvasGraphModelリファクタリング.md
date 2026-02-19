---
type: Proposal
status: InProgress
created: 2026-02-19
updated: 2026-02-19
author: AI Agent
supersedes: 提案-001_v1 (99_Archive/提案-001_CanvasGraphModelリファクタリング_v1_Draft.md)
progress:
  phase0: done
  phase1: done
  phase2: done
  phase3: done
  phase4: pending
---
# 提案-001: BoomYackキャンバス基盤アーキテクチャリファクタリング

> **v1からの変更点**: CanvasGraphModel単体の3分割から、アーキテクチャ全体の段階的リファクタリングへと方針を拡大。
> v1ではCanvasGraphModelの責務分割のみが対象だったが、コードベース精査の結果、CanvasGraphModel以前に対処すべき構造問題が複数発見されたため計画を再構成した。

## 1. 現状 (Current State)

キャンバス基盤は以下のクラス群で構成されている:

| クラス | ファイル | 行数 | 現在の責務 |
|---|---|---|---|
| `CanvasGraphModel` | `描画キャンバスView分解/CanvasGraphModel.ts` | ~260行 | 配置物リスト管理 + 接触判定 + 描画スケジューリング + グラフ分析 + クリップボード/JSON出力 |
| `CanvasView` | `描画キャンバスView分解/CanvasView.ts` | ~320行 | DOM構築 + イベントハンドリング + Persistence/Model/Factoryの組み立て + 大量のプロキシメソッド |
| `CanvasItemFactory` | `描画キャンバスView分解/CanvasItemFactory.ts` | ~130行 | 配置物生成 + 設定パネル表示（衝突判定サービスを内包） |
| `CanvasPersistenceManager` | `描画キャンバスView分解/CanvasPersistenceManager.ts` | ~170行 | 保存/読み込み/シリアライズ/デシリアライズ（比較的クリーン） |
| `I配置物リポジトリ` | `配置物リポジトリ.ts` | ~15行 | コレクション管理 + ファクトリ + 接触判定を1インターフェースに混在 |

## 2. 問題点・課題 (Problem / Motivation)

### 2-1. `instanceof`地獄 — Open-Closed原則の崩壊【最重要】

コードベース全体で`矢印接続可能付箋Old`と`折れ線矢印集約`に対する`instanceof`チェックが**10箇所以上**散在している:

- `CanvasGraphModel.ts:100,102` — `add配置物()`内で接触判定の登録分岐
- `まとめて移動サービス.ts:23,27` — ドラッグ対象抽出
- `配置物連結グラフ.ts:64,71` — グラフ検索
- `配置物情報.ts:46,49` — 配置物情報ファクトリ
- `配置物選択管理.ts:43,45` — 右クリック処理（**空分岐で未実装**）

**影響**: 新しい配置物タイプ（例: `グループミニキャンバス`、型定義は存在するが未実装）を追加するたびに、上記全ファイルを修正する必要がある。

### 2-2. `CanvasGraphModel`にApplicationServiceロジックが侵入

ModelがMouseEventを直接受け取り（`クリップボードから貼り付け(e: MouseEvent)`）、JSON出力サービスやクリップボードサービスといったインフラ層を直接保持している。明確なレイヤー違反。

- `グラフを選択してjsonファイル出力()` — ファイルI/Oユースケース
- `グラフをテキストとしてコピー()` — クリップボードユースケース
- `クリップボードから貼り付け(e: MouseEvent)` — UIイベント処理がModelに存在
- `Json出力サービス` / `クリップボードサービス` — インフラサービスの直接保持

### 2-3. `I配置物リポジトリ`のISP違反

```typescript
// 現状: 4つの責務が1インターフェースに混在
interface I配置物リポジトリ<座標点T> {
    配置物リスト: I配置物集約[];           // コレクション管理
    add付箋(pos): 矢印接続可能付箋Old;    // ファクトリ（具象型を返す！）
    add折れ線矢印(...): 折れ線矢印集約;   // ファクトリ
    接触点を取得(pos): ...;              // 接触判定
    未接続の点ハンドルを接続点と接続をtryする(...): void; // 接続ロジック
}
```

ファクトリメソッドが具象型`矢印接続可能付箋Old`を返すため、このインターフェースに依存する全コードが具象クラスに引きずられる。

### 2-4. 責務の過集中 (God Class)

`CanvasGraphModel`(260行)と`CanvasView`(320行)が100行を超え始めており、変更の影響範囲が広くテスト困難な状態。

### 2-5. `CanvasView`のプロキシメソッド過多

`CanvasView`が`保存()`, `読み込み()`, `ローカル保存()`, `ローカル読み込み()`, `グラフ選択()`, `グラフをテキストとしてコピー()`など大量のプロキシメソッドを持ち、上位層（`StickyGraphBoard`）がModelに直接アクセスすべき所をViewに委譲させている。

### 2-6. Oldクラスの残存

`矢印接続可能付箋Old` — 名前に"Old"がついたまま唯一の付箋実装として使われている。`自動リサイズ付箋View`と`自動リサイズ付箋View2`も両方存在し、中途半端な移行の痕跡が残る。

## 3. 提案内容 (Proposed Solution)

CanvasGraphModel単体の分割ではなく、**段階的にアーキテクチャ全体を改善**する。各Phaseは独立してmerge/revert可能な単位にする。

### Phase 0: instanceof排除【最優先・影響範囲小】

`I配置物集約`にポリモーフィックなメソッドを追加し、各具象クラスが自分の登録方法を知るようにする。

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
    // 既存...
    接触判定対象を登録する(target: I接触点登録先): void;
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

同様に`配置物連結グラフ`、`配置物情報`、`まとめて移動サービス`のinstanceof分岐も各配置物側に移動。

**変更対象ファイル・行**:
- `I配置物.ts` — インターフェース拡張
- `矢印接続可能付箋Old.ts` — メソッド実装
- `折れ線矢印集約.ts` — メソッド実装
- `CanvasGraphModel.ts:95-108` — instanceof分岐の除去
- `まとめて移動サービス.ts:20-30` — 同上
- `配置物連結グラフ.ts:60-80` — 同上
- `配置物情報.ts:44-53` — 同上

### Phase 1: ApplicationServiceロジックの抽出

`CanvasGraphModel`からグラフ分析・クリップボード・JSON出力のロジックを`キャンバスユースケースサービス`に抽出。ModelはMouseEventもインフラサービスも知らない純粋な状態管理に特化させる。

```
// 抽出対象メソッド群 → 新クラスへ移動
CanvasGraphModel.グラフを抽出()
CanvasGraphModel.グラフを選択()
CanvasGraphModel.グラフを選択してjsonファイル出力()
CanvasGraphModel.グラフをテキストとしてコピー()
CanvasGraphModel.クリップボードから貼り付け(e: MouseEvent)  ← レイヤー違反
CanvasGraphModel.Json出力サービス                          ← インフラ依存
CanvasGraphModel.クリップボードサービス                      ← インフラ依存
```

**新クラス**: `キャンバスグラフ操作サービス`（ApplicationService層）
- コンストラクタでModelへの参照とインフラサービスを受け取る
- `CanvasView`がこのサービスを呼び出す形に変更

### Phase 2: `I配置物リポジトリ`のインターフェース分割

```typescript
// 純粋なコレクション管理（ISP原則に基づく分割）
interface I配置物コレクション {
    readonly 配置物リスト: ReadonlyArray<I配置物集約>;
    add配置物(item: I配置物集約): void;
    remove配置物(item: I配置物集約): void;
    全配置物クリア(): void;
}

// 接触判定は既存のI接触点を教えてくれる人をそのまま使う
// ファクトリはCanvasItemFactoryが既に担っている

// I配置物リポジトリは廃止し、利用箇所は上記の分割インターフェースに置き換え
```

### Phase 3: 描画スケジューリングのView層移動

`requestAnimationFrame`ロジックを`CanvasGraphModel`からView層に移動。  
Modelの`GraphEvent`をViewがsubscribeし、View側でバッチ再描画をスケジューリングする形に変更。

```
// Before: Model内に描画ロジック
CanvasGraphModel.再描画をスケジュール()  ← requestAnimationFrame
CanvasGraphModel.即座に再描画()
CanvasGraphModel.配置物再描画()

// After: View側で制御
CanvasView が GraphEvent('UPDATED') を受け取り、
requestAnimationFrame でバッチ再描画をスケジューリング
```

### Phase 4: CanvasViewのスリム化

プロキシメソッド（`保存()`, `読み込み()`, `グラフ選択()`等）を排除。  
`StickyGraphBoard`が`model`や`persistence`、`キャンバスグラフ操作サービス`に直接アクセスする形に変更。  
CanvasViewはDOM構築とUIイベントハンドリングのみに集中させる。

### 3-1. UI/UX設計案 (UI Design)
全Phaseが内部リファクタリングであるため、**既存のUI/UXに変更はありません。**
描画パフォーマンス（ズーム・パン時の滑らかさ）が維持・向上されることを確認します。

### 3-2. 設計憲法・適合チェック (Constitution Check)
- [x] DOM操作を直接行っていないか？ → Phase 3でDOM操作はView層に集約される
- [x] LV2コンポーネントを継承していないか？ → はい、新規クラスはすべてPlainクラス
- [x] スタイルは Vanilla Extract を使用しているか？ → 該当なし（ロジックのみ）
- [x] 安易な `any` や `cast` を使用する計画になっていないか？ → はい。instanceof排除により型安全性が**向上**する
- [x] `Functional DDD` の原則に沿っているか？ → Phase 1でModelからインフラ依存と副作用を排除し純粋な状態管理に近づける

## 4. 影響範囲 (Impact)

### Phase別影響マトリクス

| ファイル | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|---|:---:|:---:|:---:|:---:|:---:|
| `I配置物.ts` | **変更** | - | - | - | - |
| `矢印接続可能付箋Old.ts` | **変更** | - | - | - | - |
| `折れ線矢印集約.ts` | **変更** | - | - | - | - |
| `CanvasGraphModel.ts` | 変更 | **大幅変更** | 変更 | **大幅変更** | - |
| `まとめて移動サービス.ts` | **変更** | - | - | - | - |
| `配置物連結グラフ.ts` | **変更** | - | - | - | - |
| `配置物情報.ts` | **変更** | - | - | - | - |
| `CanvasView.ts` | - | 変更 | - | 変更 | **大幅変更** |
| `CanvasItemFactory.ts` | - | - | 変更 | - | - |
| `配置物リポジトリ.ts` | - | - | **廃止** | - | - |
| `StickyGraphBoard（付箋グラフボード.ts）` | - | - | - | - | 変更 |
| **新規作成** | - | `キャンバスグラフ操作サービス.ts` | - | - | - |

### 各Phaseのリスク評価

| Phase | リスク | 理由 |
|---|---|---|
| Phase 0 | **低** | メソッド追加のみ。既存の呼び出し元は順次置換。型エラーで漏れを検知可能 |
| Phase 1 | **低〜中** | メソッド移動が主。CanvasView側のプロキシ呼び出しが変わる |
| Phase 2 | **中** | ISP分割でインターフェースの利用箇所すべてに波及。ただし静的型検査で安全に実施可能 |
| Phase 3 | **中** | 描画タイミングの変更はパフォーマンスに直結。手動テスト必須 |
| Phase 4 | **低** | プロキシメソッド削除のみ。呼び出し元変更は機械的 |

## 実装進捗 (Implementation Progress)

> **最終更新**: 2026-02-19

| Phase | 内容 | ステータス | BoomYack commit |
|---|---|---|---|
| Phase 0 | instanceof排除、ポリモーフィックメソッド追加 | ✅ Done | `055cfb0` |
| Phase 1 | `キャンバスグラフ操作サービス`抽出、`Iグラフ配置先`導入 | ✅ Done | `13eb00d`, `6feae6c` |
| Phase 2 | `I矢印生成先`でISP分割、`接続点`の依存絞り込み | ✅ Done | `0a56b51` |
| Phase 3 | `requestAnimationFrame`をView層へ移動 | ✅ Done | `c8a6853` |
| Phase 4 | `CanvasView`プロキシメソッドの整理、上位層からの直接アクセス化 | ⏳ Pending | - |

### Phase 4 詳細（未実装）

`CanvasView`が`保存()`, `読み込み()`, `グラフ選択()`等大量のプロキシメソッドを持ち、上位層（`StickyGraphBoard`等）が直接`model`/`persistence`/`グラフ操作サービス`にアクセスする形に変更。

**実装時の確認事項**:
- `CanvasView`から削除できるプロキシメソッド一覧を`grep`で抽出
- `StickyGraphBoard`等の呼び出し元を確認し残留が必要なものを別途対応

## 5. 代替案 (Alternatives)

### 代替案A: CanvasGraphModel単体の3分割（v1提案）
**不採用理由**: 分割後のRepository・ContactResolver・RenderingController内にinstanceof分岐がそのまま再現される。根本原因（Open-Closed原則違反）を先に解決しないと分割の意味が薄い。

### 代替案B: 全体を一度にリライト
**不採用理由**: 影響範囲が大きすぎてリグレッションリスクが高い。Phase分割による段階的改善のほうが安全かつ各段階でのrevertが可能。

### 代替案C: 現状維持
**不採用理由**: `グループミニキャンバス`等の新配置物タイプを追加する際にinstanceofチェックが爆発する。技術的負債が開発速度を著しく低下させるため却下。
