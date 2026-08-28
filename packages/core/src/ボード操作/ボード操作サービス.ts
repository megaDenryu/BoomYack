// UI・MCP・他ビューが共通で使うボード操作の境界 (issue #4)。保存ファイルを直接編集して
// よいのはこのサービスとリポジトリ実装だけで、呼び出し側は編集コマンドで意図を表す。
// 書き込みは常に「読み込み→revision照合→コマンド適用→revision+1で保存」の1本道で、
// コマンド列の適用が1つでも失敗したら保存しない (部分保存を作らない)。
// 楽観ロック (issue #5): 全書き込みは読み取り時のrevisionをexpectedRevisionとして受け取り、
// ディスク上のrevisionと一致しなければrevision競合で失敗する。時刻でなく単調増加する
// revisionを正典とするため、時計精度や同一ミリ秒更新に依存しない。

import { 最新版のversion } from '../保存形式/最新版保存形式';
import type { 最新版ボードJSON } from '../保存形式/最新版保存形式';
import { 保存JSONから最新版ボードを読み込む } from '../保存形式/保存JSONから読み込む';
import type { ボード保存リポジトリ, ボード一覧項目JSON } from './ボード保存リポジトリ';
import type { ボード編集コマンド } from './ボード編集コマンド';
import type { ボード操作結果, ボード削除結果 } from './ボード操作結果';
import { ボード編集コマンドを適用する } from './配置物を編集する';

export interface ボード操作サービス依存 {
    readonly リポジトリ: ボード保存リポジトリ;
    IDを生成する(): string;
    現在時刻をISO文字列で得る(): string;
}

export class ボード操作サービス {
    public constructor(private readonly 依存: ボード操作サービス依存) {}

    public async ボード一覧を取得する(): Promise<readonly ボード一覧項目JSON[]> {
        return this.依存.リポジトリ.一覧を取得する();
    }

    public async ボードを読み込む(ボードID: string): Promise<ボード操作結果> {
        const 生データ = await this.依存.リポジトリ.生データを読み込む(ボードID);
        if (生データ === null) return { kind: 'ボード不在', ボードID };
        const 結果 = 保存JSONから最新版ボードを読み込む(生データ);
        if (結果.kind === '保存データ不正') return { kind: '保存データ不正', ボードID, 理由: 結果.理由 };
        return { kind: '成功', ボード: 結果.ボード };
    }

    public async ボードを新規作成する(名前: string): Promise<ボード操作結果> {
        const 現在時刻 = this.依存.現在時刻をISO文字列で得る();
        const ボード: 最新版ボードJSON = {
            version: 最新版のversion,
            id: this.依存.IDを生成する(),
            name: 名前,
            createdAt: 現在時刻,
            updatedAt: 現在時刻,
            revision: 0,
            描画原点: { x: 0, y: 0 },
            配置物リスト: [],
        };
        await this.依存.リポジトリ.最新版ボードを書き込む(ボード.id, ボード);
        return { kind: '成功', ボード };
    }

    public async ボード名を変更する(ボードID: string, expectedRevision: number, 新しい名前: string): Promise<ボード操作結果> {
        const 読み込み = await this.revisionを照合して読み込む(ボードID, expectedRevision);
        if (読み込み.kind !== '成功') return 読み込み;
        return this.保存する({ ...読み込み.ボード, name: 新しい名前 });
    }

    public async ボードを削除する(ボードID: string, expectedRevision: number): Promise<ボード削除結果> {
        const 読み込み = await this.revisionを照合して読み込む(ボードID, expectedRevision);
        if (読み込み.kind === '対象不在') throw new Error('到達しないはずの分岐: 読み込みが対象不在を返した');
        if (読み込み.kind !== '成功') return 読み込み;
        await this.依存.リポジトリ.削除する(ボードID);
        return { kind: '成功' };
    }

    public async 編集コマンドを適用する(ボードID: string, expectedRevision: number, コマンド: ボード編集コマンド): Promise<ボード操作結果> {
        return this.編集コマンドを一括適用する(ボードID, expectedRevision, [コマンド]);
    }

    public async 編集コマンドを一括適用する(ボードID: string, expectedRevision: number, コマンド列: readonly ボード編集コマンド[]): Promise<ボード操作結果> {
        const 読み込み = await this.revisionを照合して読み込む(ボードID, expectedRevision);
        if (読み込み.kind !== '成功') return 読み込み;
        let ボード = 読み込み.ボード;
        for (const コマンド of コマンド列) {
            const 編集 = ボード編集コマンドを適用する(ボード, コマンド);
            if (編集.kind !== '成功') return 編集;
            ボード = 編集.ボード;
        }
        return this.保存する(ボード);
    }

    private async revisionを照合して読み込む(ボードID: string, expectedRevision: number): Promise<ボード操作結果> {
        const 読み込み = await this.ボードを読み込む(ボードID);
        if (読み込み.kind !== '成功') return 読み込み;
        if (読み込み.ボード.revision !== expectedRevision) {
            return { kind: 'revision競合', ボードID, expectedRevision, 現在のrevision: 読み込み.ボード.revision };
        }
        return 読み込み;
    }

    private async 保存する(ボード: 最新版ボードJSON): Promise<ボード操作結果> {
        const 保存版: 最新版ボードJSON = {
            ...ボード,
            updatedAt: this.依存.現在時刻をISO文字列で得る(),
            revision: ボード.revision + 1,
        };
        await this.依存.リポジトリ.最新版ボードを書き込む(保存版.id, 保存版);
        return { kind: '成功', ボード: 保存版 };
    }
}
