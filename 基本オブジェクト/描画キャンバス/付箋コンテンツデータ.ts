/**
 * 付箋の中身の形を表す判別共用体。設計2026-07-14_付箋コンテンツ設計.md 4.3節の型を実装する。
 * 種別が増えても既存種別の型・変換ロジックには影響しないよう、種別ごとに独立したinterfaceで表す。
 */
export interface 自由テキストコンテンツデータ {
    readonly 種別: "自由テキスト";
    readonly text: string;
}

export interface タイトル付きコンテンツデータ {
    readonly 種別: "タイトル付き";
    readonly タイトル: string;
    readonly 本文: string;
}

/**
 * Fudaba(札場)の作業アイテムをボード上に投影する外部参照コンテンツ。
 * ARCHITECTURE.md「ルーム・ボード・文書からはリンクで参照する」原則の通り、
 * 永続化するのは弱参照の札IDのみで、タイトル・状態等の実体データは複製しない
 * (設計2026-07-14_付箋コンテンツ設計.md 7.3節)。
 */
export interface 札参照コンテンツデータ {
    readonly 種別: "札参照";
    readonly 札ID: string;
}

export type 付箋コンテンツデータ = 自由テキストコンテンツデータ | タイトル付きコンテンツデータ | 札参照コンテンツデータ;

export function 自由テキストコンテンツを作る(text: string): 自由テキストコンテンツデータ {
    return { 種別: "自由テキスト", text };
}

export function タイトル付きコンテンツを作る(タイトル: string, 本文: string): タイトル付きコンテンツデータ {
    return { 種別: "タイトル付き", タイトル, 本文 };
}

export function 札参照コンテンツを作る(札ID: string): 札参照コンテンツデータ {
    return { 種別: "札参照", 札ID };
}

/**
 * AI連携仕様(/BoomYack/AI/Generate・/BoomYack/AI/Decompose)とグラフのテキストコピー機能が要求する
 * 平文表現への射影。コンテンツ種別が増えてもここに1ケース足すだけでよい。
 * 札参照は外部データの投影であり、勝手にLLMへ渡すと実体と乖離した平文が独り歩きするため、
 * 識別可能なプレースホルダー文字列を返すに留める(7.3節)。
 */
export function 付箋コンテンツをtextへ変換(コンテンツ: 付箋コンテンツデータ): string {
    switch (コンテンツ.種別) {
        case "自由テキスト":
            return コンテンツ.text;
        case "タイトル付き":
            return `${コンテンツ.タイトル}\n${コンテンツ.本文}`;
        case "札参照":
            return `[Fudaba札#${コンテンツ.札ID}]`;
    }
}

/** JSON側の判別共用体。データクラス側の型と1対1対応させる */
export type I付箋コンテンツJSON =
    | { 種別: "自由テキスト"; text: string }
    | { 種別: "タイトル付き"; タイトル: string; 本文: string }
    | { 種別: "札参照"; 札ID: string };

export function 付箋コンテンツデータtoJSON(コンテンツ: 付箋コンテンツデータ): I付箋コンテンツJSON {
    switch (コンテンツ.種別) {
        case "自由テキスト":
            return { 種別: "自由テキスト", text: コンテンツ.text };
        case "タイトル付き":
            return { 種別: "タイトル付き", タイトル: コンテンツ.タイトル, 本文: コンテンツ.本文 };
        case "札参照":
            return { 種別: "札参照", 札ID: コンテンツ.札ID };
    }
}

/**
 * 版ごとの型→最新への変換をここに凝縮する。
 * 旧JSON(コンテンツキーなし、textのみ)は「自由テキスト」として読む後方互換変換。
 */
export function 付箋コンテンツデータfromJSON(
    コンテンツJSON: I付箋コンテンツJSON | undefined,
    旧形式text: string | undefined
): 付箋コンテンツデータ {
    if (コンテンツJSON !== undefined) {
        switch (コンテンツJSON.種別) {
            case "自由テキスト":
                return 自由テキストコンテンツを作る(コンテンツJSON.text);
            case "タイトル付き":
                return タイトル付きコンテンツを作る(コンテンツJSON.タイトル, コンテンツJSON.本文);
            case "札参照":
                return 札参照コンテンツを作る(コンテンツJSON.札ID);
        }
    }
    return 自由テキストコンテンツを作る(旧形式text ?? "");
}
