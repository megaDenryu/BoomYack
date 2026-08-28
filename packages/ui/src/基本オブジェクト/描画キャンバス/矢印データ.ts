import { 矢印ID } from "../ID";
import { I座標JSON, 座標データ } from "./座標データ";
import { I接続参照JSON, 接続参照データ } from "./接続参照データ";

/** 矢印データJSON */
export interface I矢印JSON {
    type: "まっすぐ矢印";
    id: string;
    start: I座標JSON;
    end: I座標JSON;
    startRef?: I接続参照JSON | null;
    endRef?: I接続参照JSON | null;
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
