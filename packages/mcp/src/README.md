# @boomyack/mcp

MCP ツール登録 package である (issue #7)。入口は `BoomYackツールを登録する(server, 依存)` で、boomyack_* の 12 tool を登録する。`@boomyack/core` のサービスだけを呼ぶ薄い adapter であり、保存JSONを独自に解釈・編集しない。サービスの構築とリポジトリ実装・ID 生成の注入は、利用側 (Jimbo) のコンポジションルートが行う。
