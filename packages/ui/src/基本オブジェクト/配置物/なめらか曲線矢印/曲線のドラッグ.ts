import { Px2DVector } from "SengenUI/index";
import { グローバルイベント購読 } from "../../グローバルイベント購読";

export interface 曲線ドラッグの受け手 {
    開始(position: Px2DVector): void;
    移動(delta: Px2DVector): void;
    終了(): void;
}

export interface ローカル座標へ直せる曲線 {
    イベントのローカル座標(e: MouseEvent): Px2DVector;
}

/**
 * 曲線操作パス1本のドラッグ。押してから離すまでの移動量を受け手へ伝える。
 * 注意: 文書全体へのpointermove・pointerupの購読は、ドラッグ中だけ張る。矢印やボードが消えた後に購読が残らないようにするためであり、
 * ボード購読台帳を通さない例外である(グローバル購読の経路.test.tsが許可している)。
 */
export class 曲線のドラッグ {
    private 直前位置: Px2DVector | null = null;
    private readonly 移動の購読 = グローバルイベント購読.作成する(document, "pointermove", e => this.動いた(e));
    private readonly 離す購読 = グローバルイベント購読.作成する(document, "pointerup", e => this.離された(e));

    public constructor(private readonly 曲線: ローカル座標へ直せる曲線, private readonly 受け手: 曲線ドラッグの受け手) {}

    public 押された(e: PointerEvent): void {
        if (e.button !== 0 || this.直前位置 !== null) return;
        e.preventDefault(); e.stopPropagation();
        this.直前位置 = Px2DVector.fromNumbers(e.clientX, e.clientY);
        this.移動の購読.始める(); this.離す購読.始める();
        this.受け手.開始(this.曲線.イベントのローカル座標(e));
    }

    private 動いた(e: PointerEvent): void {
        if (this.直前位置 === null) return;
        e.preventDefault(); e.stopPropagation();
        const 今の位置 = Px2DVector.fromNumbers(e.clientX, e.clientY);
        this.受け手.移動(今の位置.minus(this.直前位置));
        this.直前位置 = 今の位置;
    }

    private 離された(e: PointerEvent): void {
        if (this.直前位置 === null) return;
        e.preventDefault(); e.stopPropagation();
        this.直前位置 = null;
        this.移動の購読.止める(); this.離す購読.止める();
        this.受け手.終了();
    }
}
