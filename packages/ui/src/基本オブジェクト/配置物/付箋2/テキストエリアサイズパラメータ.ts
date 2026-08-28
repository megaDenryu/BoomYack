import { Px長さ } from "SengenUI/index";

export class テキストエリアサイズパラメータ {
    public readonly padding: Px長さ;
    public readonly lineHeight: Px長さ;
    public readonly minHeight: Px長さ;
    public readonly textSize: Px長さ;

    constructor(
        padding: Px長さ = new Px長さ(16),
        lineHeight: Px長さ = new Px長さ(20),
        minHeight: Px長さ = new Px長さ(52),
        textSize: Px長さ = new Px長さ(14)
    ) {
        this.padding = padding;
        this.lineHeight = lineHeight;
        this.minHeight = minHeight;
        this.textSize = textSize;
    }

    public multiplyScale(scale: number): テキストエリアサイズパラメータ {
        return new テキストエリアサイズパラメータ(
            this.padding.multiply(scale),
            this.lineHeight.multiply(scale),
            this.minHeight.multiply(scale),
            this.textSize.multiply(scale)
        );
    }

    public setMinHeight(minHeight: Px長さ): テキストエリアサイズパラメータ {
        return new テキストエリアサイズパラメータ(
            this.padding,
            this.lineHeight,
            minHeight,
            this.textSize
        );
    }

    public setLineHeight(lineHeight: Px長さ): テキストエリアサイズパラメータ {
        return new テキストエリアサイズパラメータ(
            this.padding,
            lineHeight,
            this.minHeight,
            this.textSize
        );
    }

    public setTextSize(textSize: Px長さ): テキストエリアサイズパラメータ {
        return new テキストエリアサイズパラメータ(
            this.padding,
            this.lineHeight,
            this.minHeight,
            textSize
        );
    }
}

export class テキストエリアサイズパラメータ管理 {
    public scale: number = 1.0;
    public scale1の時のサイズパラメータ: テキストエリアサイズパラメータ;

    constructor(
        scale1の時のサイズパラメータ: テキストエリアサイズパラメータ = new テキストエリアサイズパラメータ()
    ) {
        this.scale1の時のサイズパラメータ = scale1の時のサイズパラメータ;
    }

    public get 現在のサイズパラメータ(): テキストエリアサイズパラメータ {
        return this.scale1の時のサイズパラメータ.multiplyScale(this.scale);
    }
}
