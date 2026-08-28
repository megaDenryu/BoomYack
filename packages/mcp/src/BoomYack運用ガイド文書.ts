// BoomYackの推奨運用パターンの本文。help tool (topic: 'boomyack') とガイド文書が
// この定数だけを参照する単一ソースとする。
// 注意: 利用側のrendererからもimportされうるため、Node組込モジュール・zod・
// MCP SDK等への依存を持たない純粋な文字列定数だけをこのファイルに置くこと。
export const BoomYack運用ガイド文書 = `BoomYack 推奨運用パターン (ボード確認 -> 読み取り -> グラフ構築)

BoomYackは付箋(ノード)と矢印(エッジ)で企画やアイデアを整理するグラフボードで、
JimboアプリのBoardタブから人間がGUIで操作しているものと同じデータをMCP経由で読み書きできる。

1. boomyack_list_boards でボード一覧を取得し、操作したいボードのid (canvasId) を確認する。
   ボードが無ければ boomyack_create_board で作れる。
2. boomyack_get_board(canvasId) で付箋一覧(id・内容・背景色)と接続関係(矢印ID・from -> to)、
   revision を取得する。付箋の座標も必要なら boomyack_get_board_with_layout を使う。
3. 書き込み系tool (add/update/delete_note, add/delete_edge, apply_graph, rename/delete_board) は
   すべて expectedRevision を要求する。直前の読み取りで得た revision を渡し、revision競合が
   返ったらボードを読み直して最新の revision でやり直す。人間がUIで同じボードを編集していても、
   この仕組みでお互いの変更を上書きし合わない。
4. 複数の付箋と接続をまとめて作るときは boomyack_apply_graph を使う。付箋に一時キーを付け、
   edges で一時キー同士(または既存付箋id)を接続すると、1回の保存で原子的に追加される。
5. 追加や変更のあとは boomyack_get_board で反映結果を確認する。`;
