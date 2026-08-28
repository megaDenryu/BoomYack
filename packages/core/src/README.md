# @boomyack/core

DOM / SengenUI 非依存の純粋ドメイン層の置き場所である。実装は issue で行う:

- 保存JSONの正典と version migration 層 — issue #3
- Board Application Service (UI/MCP 共通の操作境界) — issue #4
- revision による楽観ロック — issue #5
- AI 向け semantic Board API と atomic graph mutation — issue #6

注意: このパッケージから `packages/ui` (描画層) を import してはならない。依存の向きは ui → core の一方向である。
