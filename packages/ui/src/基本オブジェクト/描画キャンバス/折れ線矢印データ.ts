import { 折れ線矢印ID } from "../ID";
import { 座標データ } from "./座標データ";
import { 接続参照データ } from "./接続参照データ";
import { I折れ線矢印JSON } from "./折れ線矢印JSON";
export type { I折れ線矢印JSON } from "./折れ線矢印JSON";

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
