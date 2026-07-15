import { 付箋ID } from "../ID";

/**
 * 接続点の位置（上下左右）
 */
export type 接続点位置 = "上" | "下" | "左" | "右";

/** 接続参照データJSON */
export interface I接続参照JSON {
    配置物ID: string;
    接続位置: 接続点位置;
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
