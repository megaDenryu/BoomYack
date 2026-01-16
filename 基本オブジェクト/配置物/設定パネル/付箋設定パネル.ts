import { NumberSliderInput } from "OneONetUIComponents/index";
import { ButtonC, DivC, InputC, LV2HtmlComponentBase, LabelC, MouseWife, Px2DVector, ビューポート座標値 } from "SengenUI/index";


import { 設定パネルコンテナ, 設定パネルヘッダー, 設定パネルタイトル, 閉じるボタン, 設定項目, 設定項目ラベル, カラー入力, 数値入力 } from "./style.css";
import { 付箋設定状態 } from "./設定状態データクラス";


export interface 付箋設定パネルオプション {
    position: ビューポート座標値;
    初期設定: 付箋設定状態;
    on設定変更: (新設定: 付箋設定状態) => void;
    on閉じる: () => void;
}

export class 付箋設定パネル extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private _現在の設定: 付箋設定状態;
    private _on設定変更: (新設定: 付箋設定状態) => void;
    private _on閉じる: () => void;
    private _position: ビューポート座標値;
    private _mouseWife: MouseWife;

    constructor(options: 付箋設定パネルオプション) {
        super();
        this._現在の設定 = options.初期設定;
        this._on設定変更 = options.on設定変更;
        this._on閉じる = options.on閉じる;
        this._position = options.position;
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): DivC {
        return new DivC({ class: 設定パネルコンテナ })
            .setViewportPosition(this._position)
            .childs([
                new DivC({ class: 設定パネルヘッダー }).childs([
                    new DivC({ class: 設定パネルタイトル, text: "付箋設定" }),
                    new ButtonC({ class: 閉じるボタン, text: "×" }).addTypedEventListener("click", () => { this._on閉じる(); })
                ]).bind(self => {
                    this._mouseWife = new MouseWife(self).ドラッグ連動登録({
                        onドラッグ開始: (e) => { self.setStyleCSS({ cursor: "grabbing" }); },
                        onドラッグ中: (e) => {
                            const delta = e.data.直前のマウス位置から現在位置までの差分;
                            this._position = this._position.plus(Px2DVector.fromXYpair(delta));
                            this._componentRoot.setViewportPosition(this._position);
                        },
                        onドラッグ終了: (e) => { self.setStyleCSS({ cursor: "grab" }); }
                    });
                }).setStyleCSS({ cursor: "grab" }),
                this.create背景色設定(),
                this.create文字サイズ設定(),
                this.create文字色設定()
            ]);
    }

    private create背景色設定(): DivC {
        return new DivC({ class: 設定項目 }).childs([
            new LabelC({ class: 設定項目ラベル, text: "背景色" }),
            new InputC({ class: カラー入力, type: "color", value: this._現在の設定.背景色 })
                .addTypedEventListener("input", (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    this._現在の設定 = this._現在の設定.with背景色(target.value);
                    this._on設定変更(this._現在の設定);
                })
        ]);
    }

    private create文字サイズ設定(): DivC {
        return new DivC({ class: 設定項目 }).childs([
            new LabelC({ class: 設定項目ラベル, text: "文字サイズ (px)" }),
            new NumberSliderInput({
                min: 14, max: 40, step: 0.5,
                initialValue: this._現在の設定.文字サイズ,
                class: 数値入力
            })
                .onValueInput((新サイズ: number) => {
                    this._現在の設定 = this._現在の設定.with文字サイズ(新サイズ);
                    this._on設定変更(this._現在の設定);
                })
        ]);
    }

    private create文字色設定(): DivC {
        return new DivC({ class: 設定項目 }).childs([
            new LabelC({ class: 設定項目ラベル, text: "文字色" }),
            new InputC({ class: カラー入力, type: "color", value: this._現在の設定.文字色 })
                .addTypedEventListener("input", (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    this._現在の設定 = this._現在の設定.with文字色(target.value);
                    this._on設定変更(this._現在の設定);
                })
        ]);
    }
}