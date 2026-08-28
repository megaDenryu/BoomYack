# @boomyack/core

DOM / SengenUI 非依存の純粋ドメイン層である (tsconfig の lib から DOM を外して機械的に強制している)。

実装済み:

- `保存形式/` — 保存JSONの正典と version migration 層 (issue #3)。公開境界は `index.ts`。読み込みは `保存JSONから最新版ボードを読み込む` の 1 口で、旧版 (text付箋・まっすぐ矢印・middlePoints省略) は最新版へ移行され、不正データは型付きの失敗になる。書き込み側は `最新版ボードJSON` 型の値だけを永続化する

今後ここに実装する:

- Board Application Service (UI/MCP 共通の操作境界) — issue #4
- revision による楽観ロックの検証 — issue #5 (revision フィールド自体は最新版形式が既に持つ)
- AI 向け semantic Board API と atomic graph mutation — issue #6

注意: このパッケージから `packages/ui` (描画層) を import してはならない。依存の向きは ui → core の一方向である。
