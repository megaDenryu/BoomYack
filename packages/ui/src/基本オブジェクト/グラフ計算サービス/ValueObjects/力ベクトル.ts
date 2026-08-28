import { Px2DVector, Px長さ } from "SengenUI/index";
// ========================================
// Value Object: 力学シミュレーション用のベクトル計算
// ========================================




export class 力ベクトル {
    private constructor(public readonly ベクトル: Px2DVector) {}

    public static zero(): 力ベクトル {
        return new 力ベクトル(Px2DVector.fromNumbers(0, 0));
    }

    public static from(ベクトル: Px2DVector): 力ベクトル {
        return new 力ベクトル(ベクトル);
    }

    public add(他の力: 力ベクトル): 力ベクトル {
        return new 力ベクトル(this.ベクトル.plus(他の力.ベクトル));
    }

    public scale(係数: number): 力ベクトル {
        return new 力ベクトル(
            new Px2DVector(
                new Px長さ(this.ベクトル.x.値 * 係数),
                new Px長さ(this.ベクトル.y.値 * 係数)
            )
        );
    }

    public 長さ(): number {
        return Math.sqrt(
            this.ベクトル.x.値 ** 2 + this.ベクトル.y.値 ** 2
        );
    }

    public 正規化(): 力ベクトル {
        const 長さ = this.長さ();
        if (長さ === 0) return 力ベクトル.zero();
        return this.scale(1 / 長さ);
    }
}