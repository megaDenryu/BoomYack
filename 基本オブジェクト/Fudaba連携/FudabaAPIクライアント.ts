import { Fudaba札DTO, Fudaba札DTOかどうか判定する } from "./Fudaba札DTO";

const AgentRoom内蔵サーバー既定ベースURL = "http://localhost:7100";
const 札一覧取得パス = "/api/fudaba/items";

/**
 * 単一IDでの札取得結果。Fudaba APIには`GET /items/:id`が存在しない
 * (設計2026-07-14_付箋コンテンツ設計.md 7.1節)ため、一覧取得+クライアント側検索で
 * 賄う。検索した結果が「見つかった」「札は無い」「通信できなかった」のどれかを
 * 判別共用体で表し、呼び出し側が例外を握り潰さず状態ごとに扱えるようにする。
 */
export type 札取得結果 =
    | { 種別: "成功"; 札: Fudaba札DTO }
    | { 種別: "未検出" }
    | { 種別: "通信失敗"; 理由: string };

/**
 * BoomYack(Jimbo electron-appレンダラー)から、AgentRoom内蔵サーバー(既定:7100)に
 * 間借りされたFudaba APIを直接fetchする薄いRESTクライアント。
 * AgentRoom内蔵サーバーは全オリジン許可のCORSヘッダーを既に付与しているため、
 * BoomYack側の追加対応なしに動作する(設計2026-07-14_付箋コンテンツ設計.md 7.1節)。
 */
export class FudabaAPIクライアント {
    public constructor(
        private readonly ベースURL: string = AgentRoom内蔵サーバー既定ベースURL
    ) {}

    /** ラベルフィルタなしの全札一覧を取得する。小規模データセット前提のYAGNI(7.1節)。 */
    public async 一覧を取得する(): Promise<Fudaba札DTO[]> {
        const response = await fetch(`${this.ベースURL}${札一覧取得パス}`);
        if (!response.ok) {
            throw new Error(`Fudaba札一覧の取得に失敗しました: HTTP ${response.status}`);
        }
        const json: unknown = await response.json();
        if (!Array.isArray(json)) {
            throw new Error("Fudaba札一覧のレスポンス形式が不正です(配列ではありません)");
        }
        const 検証済み一覧: Fudaba札DTO[] = [];
        for (const 要素 of json) {
            if (!Fudaba札DTOかどうか判定する(要素)) {
                throw new Error("Fudaba札一覧のレスポンス形式が不正です(要素が札DTOの形をしていません)");
            }
            検証済み一覧.push(要素);
        }
        return 検証済み一覧;
    }

    /**
     * 一覧を取得し、ID(文字列比較)が一致する札を検索する。
     * 見つからない場合と通信自体に失敗した場合を判別共用体で区別して返し、
     * 例外を投げてボード全体を壊さない(呼び出し側で「参照解決不可」表示に写像する)。
     */
    public async IDで札を取得する(札ID: string): Promise<札取得結果> {
        try {
            const 一覧 = await this.一覧を取得する();
            const 該当札 = 一覧.find((札) => String(札.id) === 札ID);
            if (該当札 === undefined) {
                return { 種別: "未検出" };
            }
            return { 種別: "成功", 札: 該当札 };
        } catch (e) {
            return { 種別: "通信失敗", 理由: e instanceof Error ? e.message : String(e) };
        }
    }
}
