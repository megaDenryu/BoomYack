// AI向けAPIで付箋の中身を表す判別共用体 (issue #6)。保存形式の付箋コンテンツJSONとは
// 独立させ、保存形式の版・描画都合をAI向けAPIへ漏らさない。kindの値は英語のプロトコル
// トークンとし、MCPのJSONスキーマにそのまま使えるようにする。
// 札参照は弱参照のままで、BoomYack側でFudabaの札実体を複製・展開しない。

import type { 付箋コンテンツJSON } from '../保存形式/最新版保存形式';

export type 付箋コンテンツ表現 =
    | { readonly kind: 'text'; readonly text: string }
    | { readonly kind: 'titled'; readonly title: string; readonly body: string }
    | { readonly kind: 'fudaba_ref'; readonly cardId: string };

export function 保存形式のコンテンツを表現へ変換する(コンテンツ: 付箋コンテンツJSON): 付箋コンテンツ表現 {
    switch (コンテンツ.種別) {
        case '自由テキスト': return { kind: 'text', text: コンテンツ.text };
        case 'タイトル付き': return { kind: 'titled', title: コンテンツ.タイトル, body: コンテンツ.本文 };
        case '札参照': return { kind: 'fudaba_ref', cardId: コンテンツ.札ID };
    }
}

export function 表現を保存形式のコンテンツへ変換する(表現: 付箋コンテンツ表現): 付箋コンテンツJSON {
    switch (表現.kind) {
        case 'text': return { 種別: '自由テキスト', text: 表現.text };
        case 'titled': return { 種別: 'タイトル付き', タイトル: 表現.title, 本文: 表現.body };
        case 'fudaba_ref': return { 種別: '札参照', 札ID: 表現.cardId };
    }
}
