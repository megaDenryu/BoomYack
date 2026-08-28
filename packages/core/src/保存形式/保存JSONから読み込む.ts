// ディスク上の保存JSON (unknown) を最新版ボードへ読み込む唯一の入口。
// 最新版ならそのまま、旧版なら移行して返す。どちらでもなければ何が不正かを
// 型付きの失敗として返す (無言の既定値埋めはしない)。

import type { 最新版ボードJSON } from './最新版保存形式';
import { is最新版ボードJSON, is最新版配置物JSON } from './最新版型ガード';
import { is旧版ボードJSON, is旧版配置物JSON } from './旧版型ガード';
import { 旧版ボードを最新版へ移行する } from './旧版から最新版へ移行する';
import { isオブジェクト, isボード共通メタ } from './共通型ガード';

export type ボード読み込み結果 =
    | { readonly kind: '成功'; readonly ボード: 最新版ボードJSON; readonly 移行した: boolean }
    | { readonly kind: '保存データ不正'; readonly 理由: string };

function 不正の理由を特定する(生データ: unknown): string {
    if (!isオブジェクト(生データ)) {
        return `ボードJSONがオブジェクトでない (実際: ${生データ === null ? 'null' : typeof 生データ})`;
    }
    if (!isボード共通メタ(生データ)) {
        return 'ボードのメタ情報 (version/id/name/createdAt/updatedAt/描画原点/配置物リスト) が欠落または型不一致';
    }
    const 配置物リスト = 生データ.配置物リスト as unknown[];
    for (let i = 0; i < 配置物リスト.length; i++) {
        const 配置物 = 配置物リスト[i];
        if (!is旧版配置物JSON(配置物) && !is最新版配置物JSON(配置物)) {
            const type表示 = isオブジェクト(配置物) ? String(配置物.type) : typeof 配置物;
            return `配置物リスト[${i}] (type: ${type表示}) がどの版の形式にも一致しない`;
        }
    }
    return '旧版・最新版のどちらの形式にも一致しない';
}

export function 保存JSONから最新版ボードを読み込む(生データ: unknown): ボード読み込み結果 {
    if (is最新版ボードJSON(生データ)) {
        return { kind: '成功', ボード: 生データ, 移行した: false };
    }
    if (is旧版ボードJSON(生データ)) {
        return { kind: '成功', ボード: 旧版ボードを最新版へ移行する(生データ), 移行した: true };
    }
    return { kind: '保存データ不正', 理由: 不正の理由を特定する(生データ) };
}
