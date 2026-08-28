// MCPツール群の共通部品。ツールの応答は結果オブジェクトをそのままJSON文字列で返し、
// 失敗も kind 付きの判別共用体として返す (AIが分岐しやすい形)。

import { z } from 'zod';

export function textResponse(text: string): { content: Array<{ type: 'text'; text: string }> } {
    return { content: [{ type: 'text', text }] };
}

export function jsonResponse(値: unknown): { content: Array<{ type: 'text'; text: string }> } {
    return textResponse(JSON.stringify(値, null, 2));
}

export const 座標スキーマ = z.object({ x: z.number(), y: z.number() });

export const サイズスキーマ = z.object({ width: z.number(), height: z.number() });

export const コンテンツ表現スキーマ = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('text'), text: z.string() }),
    z.object({ kind: z.literal('titled'), title: z.string(), body: z.string() }),
    z.object({ kind: z.literal('fudaba_ref'), cardId: z.string() }),
]);

export const expectedRevisionの説明 =
    '直前に読み取ったボードのrevision。保存時点のボードのrevisionと一致しない場合はrevision競合で失敗する。' +
    'その場合はボードを読み直して最新のrevisionでやり直すこと。';
