// 接続 (矢印) の追加・削除と、グラフ一括追加の3 tool (issue #7)。

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ボード操作サービス, AI向けボードサービス } from '@boomyack/core';
import { jsonResponse, 座標スキーマ, サイズスキーマ, コンテンツ表現スキーマ, expectedRevisionの説明 } from './共通';

export function 接続ツールを登録する(
    server: McpServer,
    操作サービス: ボード操作サービス,
    AIサービス: AI向けボードサービス,
    IDを生成する: () => string,
): void {
    server.tool(
        'boomyack_add_edge',
        '既存の付箋2枚の間に矢印 (接続) を張る。矢印はfrom付箋の右辺からto付箋の左辺へ接続され、' +
        '付箋を動かしてもUI上で追従する。',
        {
            canvasId: z.string().min(1).describe('ボードのid'),
            expectedRevision: z.number().int().describe(expectedRevisionの説明),
            fromNoteId: z.string().min(1).describe('始点の付箋のid'),
            toNoteId: z.string().min(1).describe('終点の付箋のid'),
        },
        async ({ canvasId, expectedRevision, fromNoteId, toNoteId }) => {
            const 矢印ID = IDを生成する();
            const 結果 = await 操作サービス.編集コマンドを適用する(canvasId, expectedRevision, {
                kind: '接続を追加する', 矢印ID, from付箋ID: fromNoteId, to付箋ID: toNoteId,
            });
            if (結果.kind !== '成功') return jsonResponse(結果);
            return jsonResponse({ kind: '成功', 矢印ID, revision: 結果.ボード.revision });
        },
    );

    server.tool(
        'boomyack_delete_edge',
        '矢印 (接続) を1本削除する。矢印のidは boomyack_get_board の接続一覧にある。',
        {
            canvasId: z.string().min(1).describe('ボードのid'),
            expectedRevision: z.number().int().describe(expectedRevisionの説明),
            edgeId: z.string().min(1).describe('削除する矢印のid'),
        },
        async ({ canvasId, expectedRevision, edgeId }) => {
            const 結果 = await 操作サービス.編集コマンドを適用する(canvasId, expectedRevision, { kind: '接続を削除する', 矢印ID: edgeId });
            if (結果.kind !== '成功') return jsonResponse(結果);
            return jsonResponse({ kind: '成功', revision: 結果.ボード.revision });
        },
    );

    server.tool(
        'boomyack_apply_graph',
        '複数の付箋と接続を1回の操作としてまとめて追加する (グラフ構築の主用途)。付箋には一時キー ' +
        '(key) を付け、edgesのfrom/toには一時キーか既存の付箋idを書く。途中で1つでも失敗したら' +
        '何も保存されない。成功時のcreatedIdsで一時キーと実idの対応が返る。',
        {
            canvasId: z.string().min(1).describe('ボードのid'),
            expectedRevision: z.number().int().describe(expectedRevisionの説明),
            notes: z.array(z.object({
                key: z.string().min(1).describe('このリクエスト内だけで通用する一時キー'),
                content: コンテンツ表現スキーマ,
                position: 座標スキーマ.optional(),
                size: サイズスキーマ.optional(),
                背景色: z.string().optional(),
            })).describe('追加する付箋のリスト'),
            edges: z.array(z.object({
                from: z.string().min(1).describe('一時キーまたは既存の付箋id'),
                to: z.string().min(1).describe('一時キーまたは既存の付箋id'),
            })).describe('追加する接続のリスト'),
        },
        async ({ canvasId, expectedRevision, notes, edges }) =>
            jsonResponse(await AIサービス.グラフを一括追加する(canvasId, { expectedRevision, notes, edges })),
    );
}
