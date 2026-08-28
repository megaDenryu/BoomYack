// AIが使うボードの読み書き境界 (issue #6)。読み取りは保存JSONでなく要約を返し、
// 書き込みはグラフ一括追加をボード操作サービスの一括適用へ翻訳する。原子性と
// revisionの1回だけの更新は一括適用が保証する。

import type { ボード操作サービス } from '../ボード操作/ボード操作サービス';
import type { ボード編集コマンド } from '../ボード操作/ボード編集コマンド';
import type { ボード操作失敗 } from '../ボード操作/ボード操作結果';
import { 既定の付箋設定状態 } from '../ボード操作/配置の既定値を決める';
import { 表現を保存形式のコンテンツへ変換する } from './付箋コンテンツ表現';
import { ボードを要約する, ボードを配置付きで要約する } from './ボードを要約する';
import type { ボード要約, 配置付きボード要約 } from './ボード要約型';
import type { グラフ一括追加の指示, グラフ一括追加結果 } from './グラフ一括追加型';

export type ボード要約取得結果 = { readonly kind: '成功'; readonly 要約: ボード要約 } | ボード操作失敗;
export type 配置付きボード要約取得結果 = { readonly kind: '成功'; readonly 要約: 配置付きボード要約 } | ボード操作失敗;

export interface AI向けボードサービス依存 {
    readonly 操作サービス: ボード操作サービス;
    IDを生成する(): string;
}

export class AI向けボードサービス {
    public constructor(private readonly 依存: AI向けボードサービス依存) {}

    public async ボード要約を取得する(ボードID: string): Promise<ボード要約取得結果> {
        const 読み込み = await this.依存.操作サービス.ボードを読み込む(ボードID);
        if (読み込み.kind !== '成功') return 読み込み;
        return { kind: '成功', 要約: ボードを要約する(読み込み.ボード) };
    }

    public async 配置付きボード要約を取得する(ボードID: string): Promise<配置付きボード要約取得結果> {
        const 読み込み = await this.依存.操作サービス.ボードを読み込む(ボードID);
        if (読み込み.kind !== '成功') return 読み込み;
        return { kind: '成功', 要約: ボードを配置付きで要約する(読み込み.ボード) };
    }

    public async グラフを一括追加する(ボードID: string, 指示: グラフ一括追加の指示): Promise<グラフ一括追加結果> {
        const 重複キー = 指示.notes.map(x => x.key).filter((key, i, 全部) => 全部.indexOf(key) !== i);
        if (重複キー.length > 0) {
            return { kind: '一時キー不正', 理由: `一時キーが重複している: ${[...new Set(重複キー)].join(', ')}` };
        }
        const createdIds: Record<string, string> = {};
        for (const note of 指示.notes) createdIds[note.key] = this.依存.IDを生成する();
        const 端点を実IDへ解決する = (端点: string): string => createdIds[端点] ?? 端点;

        const コマンド列: ボード編集コマンド[] = [
            ...指示.notes.map((note): ボード編集コマンド => ({
                kind: '付箋を追加する',
                付箋ID: createdIds[note.key],
                コンテンツ: 表現を保存形式のコンテンツへ変換する(note.content),
                position: note.position,
                size: note.size,
                設定状態: note.背景色 === undefined ? undefined : { ...既定の付箋設定状態, 背景色: note.背景色 },
            })),
            ...指示.edges.map((edge): ボード編集コマンド => ({
                kind: '接続を追加する',
                矢印ID: this.依存.IDを生成する(),
                from付箋ID: 端点を実IDへ解決する(edge.from),
                to付箋ID: 端点を実IDへ解決する(edge.to),
            })),
        ];
        const 適用 = await this.依存.操作サービス.編集コマンドを一括適用する(ボードID, 指示.expectedRevision, コマンド列);
        if (適用.kind !== '成功') return 適用;
        return { kind: '成功', revision: 適用.ボード.revision, createdIds };
    }
}
