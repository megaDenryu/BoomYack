// ボード自体の一覧・作成・名前変更・削除の4 tool (issue #7)。

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ボード操作サービス } from '@boomyack/core';
import { jsonResponse, expectedRevisionの説明 } from './共通';

export function ボード管理ツールを登録する(server: McpServer, 操作サービス: ボード操作サービス): void {
    server.tool(
        'boomyack_list_boards',
        'BoomYack (付箋グラフボード) の保存済みボード一覧 (id・name・日時) を取得する。' +
        '他のboomyack toolを呼ぶ前に、まずこれでボードのid (canvasId) を確認すること。',
        {},
        async () => jsonResponse(await 操作サービス.ボード一覧を取得する()),
    );

    server.tool(
        'boomyack_create_board',
        '空のボードを新規作成する。結果に新しいボードのidと初期revisionが含まれる。',
        { name: z.string().min(1).describe('ボードの表示名') },
        async ({ name }) => jsonResponse(await 操作サービス.ボードを新規作成する(name)),
    );

    server.tool(
        'boomyack_rename_board',
        'ボードの表示名を変更する。',
        {
            canvasId: z.string().min(1).describe('ボードのid'),
            expectedRevision: z.number().int().describe(expectedRevisionの説明),
            name: z.string().min(1).describe('新しい表示名'),
        },
        async ({ canvasId, expectedRevision, name }) =>
            jsonResponse(await 操作サービス.ボード名を変更する(canvasId, expectedRevision, name)),
    );

    server.tool(
        'boomyack_delete_board',
        'ボードを完全に削除する。取り消せない破壊的操作なので、ユーザーの明確な指示がある場合だけ使うこと。',
        {
            canvasId: z.string().min(1).describe('ボードのid'),
            expectedRevision: z.number().int().describe(expectedRevisionの説明),
        },
        async ({ canvasId, expectedRevision }) =>
            jsonResponse(await 操作サービス.ボードを削除する(canvasId, expectedRevision)),
    );
}
