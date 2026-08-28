// ボードの読み取り2 tool (issue #7)。保存JSONそのものは返さず、AI向けの要約だけを返す。

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { AI向けボードサービス } from '@boomyack/core';
import { jsonResponse } from './共通';

export function ボード読み取りツールを登録する(server: McpServer, AIサービス: AI向けボードサービス): void {
    server.tool(
        'boomyack_get_board',
        'ボードの要約 (付箋のid・内容・背景色、矢印ID付きの接続関係 from→to、未接続矢印数、revision) を返す。' +
        '書き込み系toolのexpectedRevisionには、ここで得たrevisionを渡す。座標が必要な場合は ' +
        'boomyack_get_board_with_layout を使う。',
        { canvasId: z.string().min(1).describe('ボードのid (boomyack_list_boardsのidと同じ)') },
        async ({ canvasId }) => jsonResponse(await AIサービス.ボード要約を取得する(canvasId)),
    );

    server.tool(
        'boomyack_get_board_with_layout',
        'boomyack_get_board と同じ要約に、各付箋の座標 (position) とサイズ (size) を加えて返す。' +
        '付箋の空間的な配置・まとまりを読みたい場面で使う。',
        { canvasId: z.string().min(1).describe('ボードのid') },
        async ({ canvasId }) => jsonResponse(await AIサービス.配置付きボード要約を取得する(canvasId)),
    );
}
