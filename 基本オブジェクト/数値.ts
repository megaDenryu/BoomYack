import { Px長さ, 単位付き実数 } from "SengenUI/index";



export class 拡縮率 extends 単位付き実数<拡縮率> {
    public get 単位(): string { return "倍"; }

    public constructor(値: number) {
        if (!Number.isFinite(値)) throw new Error("拡縮率の値は有限でなければなりません。");
        if (Number.isNaN(値)) throw new Error("拡縮率の値がNaNです。");
        super(値);
    }

}

export class サイズ拡縮率 {
    public readonly 幅: 拡縮率
    public readonly 高さ: 拡縮率
    public constructor(幅: 拡縮率, 高さ: 拡縮率) {
        this.幅 = 幅;
        this.高さ = 高さ;
    }
}

export class サイズ {
    public readonly 幅: Px長さ
    public readonly 高さ: Px長さ
    拡縮(率:サイズ拡縮率): サイズ {
        return new サイズ(this.幅.multiply(率.幅.value), this.高さ.multiply(率.高さ.value));
    }
    public constructor(幅: Px長さ, 高さ: Px長さ) {
        this.幅 = 幅;
        this.高さ = 高さ;
    }
}
