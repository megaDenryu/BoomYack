/** 付箋の設定状態データ（不変） */
export class 付箋設定状態 {
    public readonly 背景色: string;
    public readonly 文字サイズ: number;
    public readonly 文字色: string;

    private constructor(背景色: string, 文字サイズ: number, 文字色: string) {
        this.背景色 = 背景色;
        this.文字サイズ = 文字サイズ;
        this.文字色 = 文字色;
    }

    public static create(背景色: string = '#ffffd0', 文字サイズ: number = 14, 文字色: string = '#000000'): 付箋設定状態 {
        return new 付箋設定状態(背景色, 文字サイズ, 文字色);
    }

    public with背景色(新背景色: string): 付箋設定状態 {
        return new 付箋設定状態(新背景色, this.文字サイズ, this.文字色);
    }

    public with文字サイズ(新文字サイズ: number): 付箋設定状態 {
        return new 付箋設定状態(this.背景色, 新文字サイズ, this.文字色);
    }

    public with文字色(新文字色: string): 付箋設定状態 {
        return new 付箋設定状態(this.背景色, this.文字サイズ, 新文字色);
    }

    public toJson(): { 背景色: string; 文字サイズ: number; 文字色: string } {
        return {
            背景色: this.背景色,
            文字サイズ: this.文字サイズ,
            文字色: this.文字色
        };
    }

    public static fromJson(json: { 背景色?: string; 文字サイズ?: number; 文字色?: string }): 付箋設定状態 {
        return 付箋設定状態.create(
            json.背景色 ?? '#ffffd0',
            json.文字サイズ ?? 14,
            json.文字色 ?? '#000000'
        );
    }
}

/** 矢印の設定状態データ（不変） */
export class 矢印設定状態 {
    public readonly 線の色: string;
    public readonly 線の太さ: number;

    private constructor(線の色: string, 線の太さ: number) {
        this.線の色 = 線の色;
        this.線の太さ = 線の太さ;
    }

    public static create(線の色: string = '#000000', 線の太さ: number = 2): 矢印設定状態 {
        return new 矢印設定状態(線の色, 線の太さ);
    }

    public with線の色(新線の色: string): 矢印設定状態 {
        return new 矢印設定状態(新線の色, this.線の太さ);
    }

    public with線の太さ(新線の太さ: number): 矢印設定状態 {
        return new 矢印設定状態(this.線の色, 新線の太さ);
    }

    public toJson(): { 線の色: string; 線の太さ: number } {
        return {
            線の色: this.線の色,
            線の太さ: this.線の太さ
        };
    }

    public static fromJson(json: { 線の色?: string; 線の太さ?: number }): 矢印設定状態 {
        return 矢印設定状態.create(
            json.線の色 ?? '#000000',
            json.線の太さ ?? 2
        );
    }
}