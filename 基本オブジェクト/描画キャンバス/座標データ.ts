import { Px2DVector } from "SengenUI/index";

/** 座標データJSON */
export interface I座標JSON {
    x: number;
    y: number;
}

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
