// 付箋の追加・更新・削除の3 tool (issue #7)。編集コマンドへの薄い翻訳だけを行い、
// 整合性 (付箋削除時の矢印同時削除など) はcoreのボード操作サービスが保証する。

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ボード操作サービス } from '@boomyack/core';
import { 表現を保存形式のコンテンツへ変換する } from '@boomyack/core';
import { jsonResponse, 座標スキーマ, サイズスキーマ, コンテンツ表現スキーマ, expectedRevisionの説明 } from './共通';

export function 付箋ツールを登録する(server: McpServer, 操作サービス: ボード操作サービス, IDを生成する: () => string): void {
    server.tool(
        'boomyack_add_note',
        '付箋を1件追加する。positionを省略すると既存の付箋群と重ならない位置に自動配置される。' +
        '複数の付箋と接続をまとめて作るときは boomyack_apply_graph を使うほうがよい。',
        {
            canvasId: z.string().min(1).describe('ボードのid'),
            expectedRevision: z.number().int().describe(expectedRevisionの説明),
            content: コンテンツ表現スキーマ.describe('付箋の中身'),
            position: 座標スキーマ.optional().describe('省略時は自動配置'),
            size: サイズスキーマ.optional(),
            背景色: z.string().optional().describe('CSSの色 (例 #ffd0d0)。省略時は既定の黄色'),
        },
        async ({ canvasId, expectedRevision, content, position, size, 背景色 }) => {
            const 付箋ID = IDを生成する();
            const 結果 = await 操作サービス.編集コマンドを適用する(canvasId, expectedRevision, {
                kind: '付箋を追加する',
                付箋ID,
                コンテンツ: 表現を保存形式のコンテンツへ変換する(content),
                position,
                size,
                設定状態: 背景色 === undefined ? undefined : { 背景色, 文字サイズ: 14, 文字色: '#000000' },
            });
            if (結果.kind !== '成功') return jsonResponse(結果);
            return jsonResponse({ kind: '成功', 付箋ID, revision: 結果.ボード.revision });
        },
    );

    server.tool(
        'boomyack_update_note',
        '付箋の内容・色・位置・サイズを更新する。指定したフィールドだけが変わる。',
        {
            canvasId: z.string().min(1).describe('ボードのid'),
            expectedRevision: z.number().int().describe(expectedRevisionの説明),
            noteId: z.string().min(1).describe('付箋のid (boomyack_get_boardのid)'),
            content: コンテンツ表現スキーマ.optional(),
            背景色: z.string().optional(),
            文字サイズ: z.number().optional(),
            文字色: z.string().optional(),
            position: 座標スキーマ.optional(),
            size: サイズスキーマ.optional(),
        },
        async ({ canvasId, expectedRevision, noteId, content, 背景色, 文字サイズ, 文字色, position, size }) => {
            const 結果 = await 操作サービス.編集コマンドを適用する(canvasId, expectedRevision, {
                kind: '付箋を更新する',
                付箋ID: noteId,
                コンテンツ: content === undefined ? undefined : 表現を保存形式のコンテンツへ変換する(content),
                背景色, 文字サイズ, 文字色, position, size,
            });
            if (結果.kind !== '成功') return jsonResponse(結果);
            return jsonResponse({ kind: '成功', revision: 結果.ボード.revision });
        },
    );

    server.tool(
        'boomyack_delete_note',
        '付箋を1件削除する。その付箋に接続している矢印も一緒に削除される。',
        {
            canvasId: z.string().min(1).describe('ボードのid'),
            expectedRevision: z.number().int().describe(expectedRevisionの説明),
            noteId: z.string().min(1).describe('削除する付箋のid'),
        },
        async ({ canvasId, expectedRevision, noteId }) => {
            const 結果 = await 操作サービス.編集コマンドを適用する(canvasId, expectedRevision, { kind: '付箋を削除する', 付箋ID: noteId });
            if (結果.kind !== '成功') return jsonResponse(結果);
            return jsonResponse({ kind: '成功', revision: 結果.ボード.revision });
        },
    );
}
