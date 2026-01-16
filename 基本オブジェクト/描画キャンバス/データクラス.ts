import { Px2DVector } from "SengenUI/index";

import { 付箋ID, 矢印ID, 折れ線矢印ID, キャンバスID, 配置物ID } from "../ID";

// ============================================
// JSON型定義 (interface)
// ============================================

/** 座標データJSON */
export interface I座標JSON {
    x: number;
    y: number;
}

/** サイズデータJSON */
export interface IサイズJSON {
    width: number;
    height: number;
}

/** 接続参照データJSON */
export interface I接続参照JSON {
    配置物ID: string;
    接続位置: 接続点位置;
}

/** 付箋データJSON */
export interface I付箋JSON {
    type: "付箋";
    id: string;
    position: I座標JSON;
    size: IサイズJSON;
    text: string;
}

/** 矢印データJSON */
export interface I矢印JSON {
    type: "まっすぐ矢印";
    id: string;
    start: I座標JSON;
    end: I座標JSON;
    startRef?: I接続参照JSON | null;
    endRef?: I接続参照JSON | null;
}

/** 折れ線矢印データJSON */
export interface I折れ線矢印JSON {
    type: "折れ線矢印";
    id: string;
    start: I座標JSON;
    中点リスト: Array<I座標JSON>;
    end: I座標JSON;
    startRef?: I接続参照JSON | null;
    endRef?: I接続参照JSON | null;
}

/** キャンバスメタデータJSON */
export interface IキャンバスメタデータJSON {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

/** 描画キャンバスデータJSON */
export interface I描画キャンバスJSON {
    version: string;
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    描画原点: I座標JSON;
    配置物リスト: ReadonlyArray<I付箋JSON | I矢印JSON | I折れ線矢印JSON>;
}

/**
 * 接続点の位置（上下左右）
 */
export type 接続点位置 = "上" | "下" | "左" | "右";

// ============================================
// データクラス
// ============================================

/**
 * 座標データ - 関数型DDD的な不変データクラス
 */
export class 座標データ {
    public readonly x: number;
    public readonly y: number;

    private constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public static create(x: number, y: number): 座標データ {
        return new 座標データ(x, y);
    }

    public static fromPx2DVector(vec: Px2DVector): 座標データ {
        return new 座標データ(vec.x.値, vec.y.値);
    }

    public toPx2DVector(): Px2DVector {
        return Px2DVector.fromNumbers(this.x, this.y);
    }

    public withX(x: number): 座標データ {
        return new 座標データ(x, this.y);
    }

    public withY(y: number): 座標データ {
        return new 座標データ(this.x, y);
    }

    public toJSON(): I座標JSON {
        return { x: this.x, y: this.y };
    }

    public static fromJSON(json: I座標JSON): 座標データ {
        return new 座標データ(json.x, json.y);
    }
}

/**
 * サイズデータ - 関数型DDD的な不変データクラス
 */
export class サイズデータ {
    public readonly width: number;
    public readonly height: number;

    private constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public static create(width: number, height: number): サイズデータ {
        return new サイズデータ(width, height);
    }

    public static fromPx2DVector(vec: Px2DVector): サイズデータ {
        return new サイズデータ(vec.x.値, vec.y.値);
    }

    public toPx2DVector(): Px2DVector {
        return Px2DVector.fromNumbers(this.width, this.height);
    }

    public withWidth(width: number): サイズデータ {
        return new サイズデータ(width, this.height);
    }

    public withHeight(height: number): サイズデータ {
        return new サイズデータ(this.width, height);
    }

    public toJSON(): IサイズJSON {
        return { width: this.width, height: this.height };
    }

    public static fromJSON(json: IサイズJSON): サイズデータ {
        return new サイズデータ(json.width, json.height);
    }
}

/**
 * 接続参照データ - 関数型DDD的な不変データクラス
 * 接続点がどの親配置物のどの位置に所属しているかを表す
 */
export class 接続参照データ {
    public readonly 配置物ID: 付箋ID;
    public readonly 接続位置: 接続点位置;

    private constructor(配置物ID: 付箋ID, 接続位置: 接続点位置) {
        this.配置物ID = 配置物ID;
        this.接続位置 = 接続位置;
    }

    public static create(配置物ID: 付箋ID, 接続位置: 接続点位置): 接続参照データ {
        return new 接続参照データ(配置物ID, 接続位置);
    }

    public with配置物ID(配置物ID: 付箋ID): 接続参照データ {
        return new 接続参照データ(配置物ID, this.接続位置);
    }

    public with接続位置(接続位置: 接続点位置): 接続参照データ {
        return new 接続参照データ(this.配置物ID, 接続位置);
    }

    public toJSON(): I接続参照JSON {
        return { 配置物ID: this.配置物ID.id, 接続位置: this.接続位置 };
    }

    public static fromJSON(json: I接続参照JSON): 接続参照データ {
        return new 接続参照データ(new 付箋ID(json.配置物ID), json.接続位置);
    }
}

/**
 * 付箋データ - 関数型DDD的な不変データクラス
 */
export class 付箋データ {
    public readonly type: "付箋" = "付箋";
    public readonly id: 付箋ID;
    public readonly position: 座標データ;
    public readonly size: サイズデータ;
    public readonly text: string;

    private constructor(
        id: 付箋ID,
        position: 座標データ,
        size: サイズデータ,
        text: string
    ) {
        this.id = id;
        this.position = position;
        this.size = size;
        this.text = text;
    }

    public static create(
        id: 付箋ID,
        position: 座標データ,
        size: サイズデータ,
        text: string
    ): 付箋データ {
        return new 付箋データ(id, position, size, text);
    }

    public withId(id: 付箋ID): 付箋データ {
        return new 付箋データ(id, this.position, this.size, this.text);
    }

    public withPosition(position: 座標データ): 付箋データ {
        return new 付箋データ(this.id, position, this.size, this.text);
    }

    public withSize(size: サイズデータ): 付箋データ {
        return new 付箋データ(this.id, this.position, size, this.text);
    }

    public withText(text: string): 付箋データ {
        return new 付箋データ(this.id, this.position, this.size, text);
    }

    public toJSON(): I付箋JSON {
        return {
            type: "付箋",
            id: this.id.id,
            position: this.position.toJSON(),
            size: this.size.toJSON(),
            text: this.text
        };
    }

    public static fromJSON(json: I付箋JSON): 付箋データ {
        return new 付箋データ(
            new 付箋ID(json.id),
            座標データ.fromJSON(json.position),
            サイズデータ.fromJSON(json.size),
            json.text
        );
    }
}

/**
 * 矢印データ - 関数型DDD的な不変データクラス
 */
export class 矢印データ {
    public readonly type: "まっすぐ矢印" = "まっすぐ矢印";
    public readonly id: 矢印ID;
    public readonly start: 座標データ;
    public readonly end: 座標データ;
    public readonly startRef?: 接続参照データ | null;
    public readonly endRef?: 接続参照データ | null;

    private constructor(
        id: 矢印ID,
        start: 座標データ,
        end: 座標データ,
        startRef?: 接続参照データ | null,
        endRef?: 接続参照データ | null
    ) {
        this.id = id;
        this.start = start;
        this.end = end;
        this.startRef = startRef;
        this.endRef = endRef;
    }

    public static create(
        id: 矢印ID,
        start: 座標データ,
        end: 座標データ,
        startRef?: 接続参照データ | null,
        endRef?: 接続参照データ | null
    ): 矢印データ {
        return new 矢印データ(id, start, end, startRef, endRef);
    }

    public withId(id: 矢印ID): 矢印データ {
        return new 矢印データ(id, this.start, this.end, this.startRef, this.endRef);
    }

    public withStart(start: 座標データ): 矢印データ {
        return new 矢印データ(this.id, start, this.end, this.startRef, this.endRef);
    }

    public withEnd(end: 座標データ): 矢印データ {
        return new 矢印データ(this.id, this.start, end, this.startRef, this.endRef);
    }

    public withStartRef(startRef: 接続参照データ | null): 矢印データ {
        return new 矢印データ(this.id, this.start, this.end, startRef, this.endRef);
    }

    public withEndRef(endRef: 接続参照データ | null): 矢印データ {
        return new 矢印データ(this.id, this.start, this.end, this.startRef, endRef);
    }

    public toJSON(): I矢印JSON {
        return {
            type: "まっすぐ矢印",
            id: this.id.id,
            start: this.start.toJSON(),
            end: this.end.toJSON(),
            startRef: this.startRef?.toJSON() ?? null,
            endRef: this.endRef?.toJSON() ?? null
        };
    }

    public static fromJSON(json: I矢印JSON): 矢印データ {
        return new 矢印データ(
            new 矢印ID(json.id),
            座標データ.fromJSON(json.start),
            座標データ.fromJSON(json.end),
            json.startRef ? 接続参照データ.fromJSON(json.startRef) : null,
            json.endRef ? 接続参照データ.fromJSON(json.endRef) : null
        );
    }
}

/**
 * 折れ線矢印データ - 関数型DDD的な不変データクラス
 */
export class 折れ線矢印データ {
    public readonly type: "折れ線矢印" = "折れ線矢印";
    public readonly id: 折れ線矢印ID;
    public readonly start: 座標データ;
    public readonly 中点リスト: ReadonlyArray<座標データ>;
    public readonly end: 座標データ;
    public readonly startRef?: 接続参照データ | null;
    public readonly endRef?: 接続参照データ | null;

    private constructor(
        id: 折れ線矢印ID,
        start: 座標データ,
        中点リスト: ReadonlyArray<座標データ>,
        end: 座標データ,
        startRef?: 接続参照データ | null,
        endRef?: 接続参照データ | null
    ) {
        this.id = id;
        this.start = start;
        this.中点リスト = 中点リスト;
        this.end = end;
        this.startRef = startRef;
        this.endRef = endRef;
    }

    public static create(
        id: 折れ線矢印ID,
        start: 座標データ,
        中点リスト: ReadonlyArray<座標データ>,
        end: 座標データ,
        startRef?: 接続参照データ | null,
        endRef?: 接続参照データ | null
    ): 折れ線矢印データ {
        return new 折れ線矢印データ(id, start, 中点リスト, end, startRef, endRef);
    }

    public withId(id: 折れ線矢印ID): 折れ線矢印データ {
        return new 折れ線矢印データ(id, this.start, this.中点リスト, this.end, this.startRef, this.endRef);
    }

    public withStart(start: 座標データ): 折れ線矢印データ {
        return new 折れ線矢印データ(this.id, start, this.中点リスト, this.end, this.startRef, this.endRef);
    }

    public with中点リスト(中点リスト: ReadonlyArray<座標データ>): 折れ線矢印データ {
        return new 折れ線矢印データ(this.id, this.start, 中点リスト, this.end, this.startRef, this.endRef);
    }

    public withEnd(end: 座標データ): 折れ線矢印データ {
        return new 折れ線矢印データ(this.id, this.start, this.中点リスト, end, this.startRef, this.endRef);
    }

    public withStartRef(startRef: 接続参照データ | null): 折れ線矢印データ {
        return new 折れ線矢印データ(this.id, this.start, this.中点リスト, this.end, startRef, this.endRef);
    }

    public withEndRef(endRef: 接続参照データ | null): 折れ線矢印データ {
        return new 折れ線矢印データ(this.id, this.start, this.中点リスト, this.end, this.startRef, endRef);
    }

    public toJSON(): I折れ線矢印JSON {
        return {
            type: "折れ線矢印",
            id: this.id.id,
            start: this.start.toJSON(),
            中点リスト: this.中点リスト.map(pt => pt.toJSON()),
            end: this.end.toJSON(),
            startRef: this.startRef?.toJSON() ?? null,
            endRef: this.endRef?.toJSON() ?? null
        };
    }

    public static fromJSON(json: I折れ線矢印JSON): 折れ線矢印データ {
        return new 折れ線矢印データ(
            new 折れ線矢印ID(json.id),
            座標データ.fromJSON(json.start),
            json.中点リスト.map(pt => 座標データ.fromJSON(pt)),
            座標データ.fromJSON(json.end),
            json.startRef ? 接続参照データ.fromJSON(json.startRef) : null,
            json.endRef ? 接続参照データ.fromJSON(json.endRef) : null
        );
    }
}

/**
 * すべての配置物データの共用型
 */
export type 配置物データ = 付箋データ | 折れ線矢印データ;

/**
 * キャンバスメタデータ - 関数型DDD的な不変データクラス
 */
export class キャンバスメタデータ {
    public readonly id: キャンバスID;
    public readonly name: string;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    private constructor(
        id: キャンバスID,
        name: string,
        createdAt: Date,
        updatedAt: Date
    ) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static create(
        id: キャンバスID,
        name: string,
        createdAt?: Date,
        updatedAt?: Date
    ): キャンバスメタデータ {
        const now = new Date();
        return new キャンバスメタデータ(
            id,
            name,
            createdAt ?? now,
            updatedAt ?? now
        );
    }

    public withName(name: string): キャンバスメタデータ {
        return new キャンバスメタデータ(this.id, name, this.createdAt, this.updatedAt);
    }

    public updateTimestamp(): キャンバスメタデータ {
        return new キャンバスメタデータ(this.id, this.name, this.createdAt, new Date());
    }

    public toJSON(): IキャンバスメタデータJSON {
        return {
            id: this.id.id,
            name: this.name,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }

    public static fromJSON(json: IキャンバスメタデータJSON): キャンバスメタデータ {
        return new キャンバスメタデータ(
            new キャンバスID(json.id),
            json.name,
            new Date(json.createdAt),
            new Date(json.updatedAt)
        );
    }
}

/**
 * 描画キャンバスデータ - 関数型DDD的な不変データクラス
 */
export class 描画キャンバスデータ {
    public readonly version: string;
    public readonly metadata: キャンバスメタデータ;
    public readonly 描画原点: 座標データ;
    public readonly 配置物リスト: ReadonlyArray<配置物データ>;

    private constructor(
        version: string,
        metadata: キャンバスメタデータ,
        描画原点: 座標データ,
        配置物リスト: ReadonlyArray<配置物データ>
    ) {
        this.version = version;
        this.metadata = metadata;
        this.描画原点 = 描画原点;
        this.配置物リスト = 配置物リスト;
    }

    public static create(
        version: string,
        metadata: キャンバスメタデータ,
        描画原点: 座標データ,
        配置物リスト: ReadonlyArray<配置物データ>
    ): 描画キャンバスデータ {
        return new 描画キャンバスデータ(version, metadata, 描画原点, 配置物リスト);
    }

    public withMetadata(metadata: キャンバスメタデータ): 描画キャンバスデータ {
        return new 描画キャンバスデータ(this.version, metadata, this.描画原点, this.配置物リスト);
    }

    public with描画原点(描画原点: 座標データ): 描画キャンバスデータ {
        return new 描画キャンバスデータ(this.version, this.metadata, 描画原点, this.配置物リスト);
    }

    public with配置物リスト(配置物リスト: ReadonlyArray<配置物データ>): 描画キャンバスデータ {
        return new 描画キャンバスデータ(this.version, this.metadata, this.描画原点, 配置物リスト);
    }

    public updateTimestamp(): 描画キャンバスデータ {
        return new 描画キャンバスデータ(
            this.version,
            this.metadata.updateTimestamp(),
            this.描画原点,
            this.配置物リスト
        );
    }

    public toJSON(): I描画キャンバスJSON {
        const metaJSON = this.metadata.toJSON();
        return {
            version: this.version,
            id: metaJSON.id,
            name: metaJSON.name,
            createdAt: metaJSON.createdAt,
            updatedAt: metaJSON.updatedAt,
            描画原点: this.描画原点.toJSON(),
            配置物リスト: this.配置物リスト.map(item => item.toJSON())
        };
    }

    public static fromJSON(json: I描画キャンバスJSON): 描画キャンバスデータ {
        const metadata = キャンバスメタデータ.create(
            new キャンバスID(json.id),
            json.name,
            new Date(json.createdAt),
            new Date(json.updatedAt)
        );

        const 配置物リスト: 配置物データ[] = json.配置物リスト.map((item: any) => {
            switch (item.type) {
                case "付箋":
                    return 付箋データ.fromJSON(item);
                case "折れ線矢印":
                    return 折れ線矢印データ.fromJSON(item);
                default:
                    throw new Error(`Unknown type: ${item.type}`);
            }
        });

        return new 描画キャンバスデータ(
            json.version,
            metadata,
            座標データ.fromJSON(json.描画原点),
            配置物リスト
        );
    }
}

// ============================================
// サーバーAPI用の型定義
// ============================================

/** 描画キャンバスデータのJSON形式 */
export type 描画キャンバスJSON = I描画キャンバスJSON;

/** サーバーレスポンス形式 */
export interface キャンバス保存レスポンス {
    success: boolean;
    message: string;
    data?: 描画キャンバスJSON;
}

/**
 * 描画キャンバスデータからメタデータを抽出する
 */
export function 描画キャンバスデータからメタデータ抽出(data: 描画キャンバスデータ): キャンバスメタデータ {
    return data.metadata;
}

