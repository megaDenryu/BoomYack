import { 付箋ID } from "../ID";
import { 付箋設定状態 } from "../配置物/設定パネル";
import {
    I付箋コンテンツJSON,
    付箋コンテンツデータ,
    付箋コンテンツデータfromJSON,
    付箋コンテンツデータtoJSON
} from "./付箋コンテンツデータ";
import { I座標JSON, 座標データ } from "./座標データ";
import { IサイズJSON, サイズデータ } from "./サイズデータ";

/** 付箋データJSON */
export interface I付箋JSON {
    type: "付箋";
    id: string;
    position: I座標JSON;
    size: IサイズJSON;
    /** 後方互換の旧形式(種別キーなし)。新形式ではコンテンツを使うため、新規保存では書き出さない */
    text?: string;
    コンテンツ?: I付箋コンテンツJSON;
    設定状態?: { 背景色?: string; 文字サイズ?: number; 文字色?: string };
}

/**
 * 付箋データ - 関数型DDD的な不変データクラス
 */
export class 付箋データ {
    public readonly type: "付箋" = "付箋";
    public readonly id: 付箋ID;
    public readonly position: 座標データ;
    public readonly size: サイズデータ;
    public readonly コンテンツ: 付箋コンテンツデータ;
    public readonly 設定状態: 付箋設定状態;

    private constructor(
        id: 付箋ID,
        position: 座標データ,
        size: サイズデータ,
        コンテンツ: 付箋コンテンツデータ,
        設定状態: 付箋設定状態
    ) {
        this.id = id;
        this.position = position;
        this.size = size;
        this.コンテンツ = コンテンツ;
        this.設定状態 = 設定状態;
    }

    public static create(
        id: 付箋ID,
        position: 座標データ,
        size: サイズデータ,
        コンテンツ: 付箋コンテンツデータ,
        設定状態?: 付箋設定状態
    ): 付箋データ {
        return new 付箋データ(id, position, size, コンテンツ, 設定状態 ?? 付箋設定状態.create());
    }

    public withId(id: 付箋ID): 付箋データ {
        return new 付箋データ(id, this.position, this.size, this.コンテンツ, this.設定状態);
    }

    public withPosition(position: 座標データ): 付箋データ {
        return new 付箋データ(this.id, position, this.size, this.コンテンツ, this.設定状態);
    }

    public withSize(size: サイズデータ): 付箋データ {
        return new 付箋データ(this.id, this.position, size, this.コンテンツ, this.設定状態);
    }

    public withコンテンツ(コンテンツ: 付箋コンテンツデータ): 付箋データ {
        return new 付箋データ(this.id, this.position, this.size, コンテンツ, this.設定状態);
    }

    public with設定状態(設定状態: 付箋設定状態): 付箋データ {
        return new 付箋データ(this.id, this.position, this.size, this.コンテンツ, 設定状態);
    }

    public toJSON(): I付箋JSON {
        return {
            type: "付箋",
            id: this.id.id,
            position: this.position.toJSON(),
            size: this.size.toJSON(),
            コンテンツ: 付箋コンテンツデータtoJSON(this.コンテンツ),
            設定状態: this.設定状態.toJson()
        };
    }

    public static fromJSON(json: I付箋JSON): 付箋データ {
        return new 付箋データ(
            new 付箋ID(json.id),
            座標データ.fromJSON(json.position),
            サイズデータ.fromJSON(json.size),
            付箋コンテンツデータfromJSON(json.コンテンツ, json.text),
            付箋設定状態.fromJson(json.設定状態 ?? {})
        );
    }
}
