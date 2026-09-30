import { DivC, MouseEventData, Px長さ, 画面座標点 } from "SengenUI/index";
import { Action } from "TypeScriptBenriKakuchou/アーキテクチャBase";

import { ボード基準座標変換 } from "BoomYack/基本オブジェクト/キャンバス操作/座標変換/ボード基準座標変換";
import { 拡縮入力 } from "BoomYack/基本オブジェクト/描画キャンバス/描画キャンバスView分解/CanvasView";
import { グローバルイベント購読 } from "BoomYack/基本オブジェクト/グローバルイベント購読";
import { ボード購読台帳 } from "BoomYack/基本オブジェクト/ボード購読台帳";

export class GlobalMouseManager {
    public scale = 1;
    private 最後のポインタ位置: 画面座標点 | null = null;

    public constructor(
        private readonly onScale: Action<拡縮入力>,
        private readonly 座標変換: ボード基準座標変換,
        購読台帳: ボード購読台帳,
        ボードのルート: DivC
    ) {
        購読台帳.操作対象の間だけ動くものとして登録する(グローバルイベント購読.作成する(document, "pointermove", event => this.onGlobalPointerMove(event)));
        // ホイールはボードのルートで受ける。分割表示で並んだとき、カーソルの下のボードだけを拡縮するため。
        ボードのルート.addTypedEventListener("wheel", event => this.onWheel(event), { passive: false });
    }

    /** ポインタがまだ動いていなければ、ボードルートの見えている範囲の中心を返す。 */
    public get mousePos(): 画面座標点 {
        // 注意: 構築時はボードルートが文書へ付く前で大きさが0のため、中心は読むときに求める。
        return this.最後のポインタ位置 ?? this.座標変換.ルートの見えている範囲の中心();
    }

    private onWheel(event: WheelEvent): void {
        this.onGlobalPointerMove(event);
        if (!event.ctrlKey) return;
        event.preventDefault();
        const newScale = this.scale + (event.deltaY > 0 ? -0.1 : 0.1);
        if (newScale <= 0.1 || newScale >= 5.0) return;
        this.scale = newScale;
        const center = this.座標変換.viewportPointを補正する(event.clientX, event.clientY);
        this.onScale({ 拡縮率: this.scale, 中心X: center.x.値, 中心Y: center.y.値 });
    }

    private onGlobalPointerMove(event: MouseEvent | PointerEvent): void {
        const pos = new MouseEventData(event).position;
        this.最後のポインタ位置 = this.座標変換.画面座標点を補正する(pos.x, pos.y);
    }
}

export class WindowSizeScaleObserver {
    private prevWindowSize = this.windowSize();

    public updateWindowSize(): UpdateWindowSizeInfo {
        const newSize = this.windowSize();
        const 拡縮率 = newSize.devide(this.prevWindowSize);
        this.prevWindowSize = newSize;
        return { newSize, 拡縮率 };
    }

    public windowSize(): WindowSize {
        return new WindowSize(new Px長さ(window.innerWidth), new Px長さ(window.innerHeight));
    }
}

export interface UpdateWindowSizeInfo { newSize: WindowSize; 拡縮率: number; }

export class WindowSize {
    public constructor(
        public readonly width: Px長さ = new Px長さ(window.innerWidth),
        public readonly height: Px長さ = new Px長さ(window.innerHeight)
    ) {}

    public devide(other: WindowSize): number { return this.width.value / other.width.value; }
}
