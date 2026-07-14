import { button, div, input, DivC, LV2HtmlComponentBase, PointerWife, Px2DVector, ビューポート座標値 } from "SengenUI/index";

import { FudabaAPIクライアント } from "./FudabaAPIクライアント";
import { Fudaba札DTO } from "./Fudaba札DTO";
import { Fudaba札検索結果行 } from "./Fudaba札検索結果行";
import { 検索ダイアログコンテナ, 検索ダイアログヘッダー, 検索ダイアログタイトル, 検索ダイアログ閉じるボタン, 検索入力欄, 検索結果リスト, 検索案内文 } from "./style.css";

export interface Fudaba札検索ダイアログオプション {
    position: ビューポート座標値;
    fudabaAPIクライアント: FudabaAPIクライアント;
    on選択: (札ID: string) => void;
    on閉じる: () => void;
}

/**
 * 「Fudaba札を貼り付け」の入り口。一覧を取得し、絞り込み入力+一覧表示の
 * 簡易検索UIから札を選ばせる(素朴なID直接入力は不採用、2026-07-15ユーザー決定)。
 */
export class Fudaba札検索ダイアログ extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private readonly _on選択: (札ID: string) => void;
    private readonly _on閉じる: () => void;
    private _position: ビューポート座標値;
    private _mouseWife!: PointerWife;
    private _結果コンテナ!: DivC;
    private _全件一覧: Fudaba札DTO[] = [];
    private _読込エラー理由: string | null = null;
    private _検索キーワード = "";

    public constructor(options: Fudaba札検索ダイアログオプション) {
        super();
        this._on選択 = options.on選択;
        this._on閉じる = options.on閉じる;
        this._position = options.position;
        this._componentRoot = this._ルートを構築する();
        void this._一覧を読み込む(options.fudabaAPIクライアント);
    }

    private async _一覧を読み込む(クライアント: FudabaAPIクライアント): Promise<void> {
        try {
            this._全件一覧 = await クライアント.一覧を取得する();
        } catch (e) {
            this._読込エラー理由 = e instanceof Error ? e.message : String(e);
        }
        this._結果一覧を再描画する();
    }

    protected _ルートを構築する(): DivC {
        return (
            div({ class: 検索ダイアログコンテナ })
                .setViewportPosition(this._position)
                .childs([
                    div({ class: 検索ダイアログヘッダー }).childs([
                        div({ class: 検索ダイアログタイトル, text: "Fudaba札を貼り付け" }),
                        button({ class: 検索ダイアログ閉じるボタン, text: "×" }).addTypedEventListener("click", () => { this._on閉じる(); })
                    ]).tap((self) => {
                        this._mouseWife = new PointerWife(self).ドラッグ連動登録({
                            onドラッグ開始: () => { self.setStyleCSS({ cursor: "grabbing" }); },
                            onドラッグ中: (e) => {
                                const delta = e.data.直前のマウス位置から現在位置までの差分;
                                this._position = this._position.plus(Px2DVector.fromXYpair(delta));
                                this._componentRoot.setViewportPosition(this._position);
                            },
                            onドラッグ終了: () => { self.setStyleCSS({ cursor: "grab" }); }
                        });
                    }),
                    input({ class: 検索入力欄, placeholder: "タイトルまたはIDで絞り込み..." })
                        .addTypedEventListener("input", (e: Event) => {
                            const target = e.target as HTMLInputElement;
                            this._検索キーワード = target.value;
                            this._結果一覧を再描画する();
                        }),
                    div({ class: 検索結果リスト }).tap((self) => { this._結果コンテナ = self; }).childs([
                        div({ class: 検索案内文, text: "読み込み中..." })
                    ])
                ])
        );
    }

    private _結果一覧を再描画する(): void {
        this._結果コンテナ.clearChildren();
        if (this._読込エラー理由 !== null) {
            this._結果コンテナ.child(div({ class: 検索案内文, text: `一覧の取得に失敗しました: ${this._読込エラー理由}` }));
            return;
        }
        const キーワード = this._検索キーワード.trim().toLowerCase();
        const 絞り込み済み = キーワード === ""
            ? this._全件一覧
            : this._全件一覧.filter((札) =>
                札.タイトル.toLowerCase().includes(キーワード) || String(札.id).includes(キーワード)
            );
        if (絞り込み済み.length === 0) {
            this._結果コンテナ.child(div({ class: 検索案内文, text: "該当する札がありません" }));
            return;
        }
        this._結果コンテナ.childs(
            絞り込み済み.map((札) => new Fudaba札検索結果行(札, (選択された札ID) => {
                this._on選択(選択された札ID);
                this._on閉じる();
            }))
        );
    }
}
