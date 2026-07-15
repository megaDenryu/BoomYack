import { Px2DVector } from "SengenUI/index";

/** サイズデータJSON */
export interface IサイズJSON {
    width: number;
    height: number;
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
