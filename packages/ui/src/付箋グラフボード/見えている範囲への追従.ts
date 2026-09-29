import { HtmlComponentBase } from "SengenUI/index";
import { ボード基準座標変換 } from "BoomYack/基本オブジェクト/キャンバス操作/座標変換/ボード基準座標変換";

/**
 * ボードルートの見えている範囲に固定して見せる要素(ドラッグを受ける背景・録音中の表示・セーブパネル等)を、
 * ボードルートのスクロール量だけ translate で動かし、見えている範囲に留める。
 * 注意: ボードルートは overflow:hidden だが、付箋の入力中にブラウザがカーソルを見せるためスクロールさせる。
 * ボードルートは transform を持つので、中の fixed の要素もボードルートの中身として一緒にずれる。
 * 前提: 登録する要素は、自分では transform を使わない(ここで上書きするため)。
 */
export class 見えている範囲への追従 {
    private readonly _要素一覧: HtmlComponentBase[] = [];

    public constructor(private readonly _座標変換: ボード基準座標変換) {}

    public 登録する(要素: HtmlComponentBase): this {
        this._要素一覧.push(要素);
        return this;
    }

    public スクロール量へ合わせる(): void {
        const スクロール量 = this._座標変換.ルートのスクロール量();
        const transform = `translate(${スクロール量.x.toStr()}, ${スクロール量.y.toStr()})`;
        for (const 要素 of this._要素一覧) 要素.setStyleCSS({ transform });
    }
}
