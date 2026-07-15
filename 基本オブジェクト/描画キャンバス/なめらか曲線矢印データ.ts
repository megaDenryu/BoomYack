import { なめらか曲線矢印ID } from "../ID";
import { I座標JSON, 座標データ } from "./座標データ";
import { I接続参照JSON, 接続参照データ } from "./接続参照データ";

/** なめらか曲線矢印データJSON */
export interface Iなめらか曲線矢印JSON {
    type: "なめらか曲線矢印";
    id: string;
    start: I座標JSON;
    end: I座標JSON;
    middlePoints?: I座標JSON[];
    startRef?: I接続参照JSON | null;
    endRef?: I接続参照JSON | null;
}

/**
 * なめらか曲線矢印データ - 関数型DDD的な不変データクラス
 * 中間点は曲線が順番に通過する点として保持する。旧JSONでは省略される。
 */
export class なめらか曲線矢印データ {
    public readonly type: "なめらか曲線矢印" = "なめらか曲線矢印";
    public readonly id: なめらか曲線矢印ID;
    public readonly start: 座標データ;
    public readonly end: 座標データ;
    public readonly middlePoints: readonly 座標データ[];
    public readonly startRef?: 接続参照データ | null;
    public readonly endRef?: 接続参照データ | null;

    private constructor(
        id: なめらか曲線矢印ID,
        start: 座標データ,
        end: 座標データ,
        startRef?: 接続参照データ | null,
        endRef?: 接続参照データ | null,
        middlePoints: readonly 座標データ[] = [],
    ) {
        this.id = id;
        this.start = start;
        this.end = end;
        this.startRef = startRef;
        this.endRef = endRef;
        this.middlePoints = middlePoints;
    }

    public static create(
        id: なめらか曲線矢印ID,
        start: 座標データ,
        end: 座標データ,
        startRef?: 接続参照データ | null,
        endRef?: 接続参照データ | null,
        middlePoints: readonly 座標データ[] = [],
    ): なめらか曲線矢印データ {
        return new なめらか曲線矢印データ(id, start, end, startRef, endRef, middlePoints);
    }

    public withId(id: なめらか曲線矢印ID): なめらか曲線矢印データ {
        return new なめらか曲線矢印データ(id, this.start, this.end, this.startRef, this.endRef, this.middlePoints);
    }

    public withStart(start: 座標データ): なめらか曲線矢印データ {
        return new なめらか曲線矢印データ(this.id, start, this.end, this.startRef, this.endRef, this.middlePoints);
    }

    public withEnd(end: 座標データ): なめらか曲線矢印データ {
        return new なめらか曲線矢印データ(this.id, this.start, end, this.startRef, this.endRef, this.middlePoints);
    }

    public withStartRef(startRef: 接続参照データ | null): なめらか曲線矢印データ {
        return new なめらか曲線矢印データ(this.id, this.start, this.end, startRef, this.endRef, this.middlePoints);
    }

    public withEndRef(endRef: 接続参照データ | null): なめらか曲線矢印データ {
        return new なめらか曲線矢印データ(this.id, this.start, this.end, this.startRef, endRef, this.middlePoints);
    }

    public toJSON(): Iなめらか曲線矢印JSON {
        return {
            type: "なめらか曲線矢印",
            id: this.id.id,
            start: this.start.toJSON(),
            end: this.end.toJSON(),
            middlePoints: this.middlePoints.map(point => point.toJSON()),
            startRef: this.startRef?.toJSON() ?? null,
            endRef: this.endRef?.toJSON() ?? null
        };
    }

    public static fromJSON(json: Iなめらか曲線矢印JSON): なめらか曲線矢印データ {
        return new なめらか曲線矢印データ(
            new なめらか曲線矢印ID(json.id),
            座標データ.fromJSON(json.start),
            座標データ.fromJSON(json.end),
            json.startRef ? 接続参照データ.fromJSON(json.startRef) : null,
            json.endRef ? 接続参照データ.fromJSON(json.endRef) : null,
            (json.middlePoints ?? []).map(座標データ.fromJSON)
        );
    }
}
