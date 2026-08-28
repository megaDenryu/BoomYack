// BoomYackの全12 toolをMcpServerへ登録する入口 (issue #7)。
// このpackageはcoreのサービスを呼ぶ薄いadapterであり、保存JSONを独自に解釈・編集しない。
// サービスの構築と依存 (リポジトリ実装・ID生成) の注入は利用側のコンポジションルートが行う。

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ボード操作サービス, AI向けボードサービス } from '@boomyack/core';
import { ボード管理ツールを登録する } from './ボード管理ツール登録';
import { ボード読み取りツールを登録する } from './ボード読み取りツール登録';
import { 付箋ツールを登録する } from './付箋ツール登録';
import { 接続ツールを登録する } from './接続ツール登録';

export interface BoomYackツール依存 {
    readonly 操作サービス: ボード操作サービス;
    readonly AIサービス: AI向けボードサービス;
    IDを生成する(): string;
}

export function BoomYackツールを登録する(server: McpServer, 依存: BoomYackツール依存): void {
    ボード管理ツールを登録する(server, 依存.操作サービス);
    ボード読み取りツールを登録する(server, 依存.AIサービス);
    付箋ツールを登録する(server, 依存.操作サービス, 依存.IDを生成する);
    接続ツールを登録する(server, 依存.操作サービス, 依存.AIサービス, 依存.IDを生成する);
}
