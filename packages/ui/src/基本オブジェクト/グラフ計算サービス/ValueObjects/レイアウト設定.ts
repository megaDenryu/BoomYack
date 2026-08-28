import { Px2DVector, Px長さ } from "SengenUI/index";
// ========================================
// Value Object: レイアウト設定
// ========================================




export class レイアウト設定 {
    private constructor(
        public readonly 横間隔: Px長さ,
        public readonly 縦間隔: Px長さ,
        public readonly 開始位置: Px2DVector
    ) {}

    public static create(横間隔: Px長さ, 縦間隔: Px長さ, 開始位置: Px2DVector): レイアウト設定 {
        return new レイアウト設定(横間隔, 縦間隔, 開始位置);
    }

    public static default(): レイアウト設定 {
        return new レイアウト設定(
            new Px長さ(350),
            new Px長さ(250),
            Px2DVector.fromNumbers(100, 100)
        );
    }

    public with横間隔(新しい横間隔: Px長さ): レイアウト設定 {
        return new レイアウト設定(新しい横間隔, this.縦間隔, this.開始位置);
    }

    public with縦間隔(新しい縦間隔: Px長さ): レイアウト設定 {
        return new レイアウト設定(this.横間隔, 新しい縦間隔, this.開始位置);
    }

    public with開始位置(新しい開始位置: Px2DVector): レイアウト設定 {
        return new レイアウト設定(this.横間隔, this.縦間隔, 新しい開始位置);
    }
}