import { NumberSliderInput } from "OneONetUIComponents/index";
import { ButtonC, DivC, InputC, LV2HtmlComponentBase, LabelC, MouseWife, Px2DVector, 配置物座標点 } from "SengenUI/index";
﻿





import { 設定パネルコンテナ, 設定パネルヘッダー, 設定パネルタイトル, 閉じるボタン, 設定項目, 設定項目ラベル, カラー入力, 数値入力 } from "./style.css";
import { 矢印設定状態 } from "./設定状態データクラス";



export interface 矢印設定パネルオプション<座標点T extends 配置物座標点> {
    position: 座標点T;
    初期設定: 矢印設定状態;
    on設定変更: (新設定: 矢印設定状態) => void;
    on閉じる: () => void;
}

export class 矢印設定パネル<座標点T extends 配置物座標点> extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private _現在の設定: 矢印設定状態;
    private _on設定変更: (新設定: 矢印設定状態) => void;
    private _on閉じる: () => void;
    private _position: 座標点T;
    private _mouseWife: MouseWife;

    constructor(options: 矢印設定パネルオプション<座標点T>) {
        super();
        this._現在の設定 = options.初期設定;
        this._on設定変更 = options.on設定変更;
        this._on閉じる = options.on閉じる;
        this._position = options.position;
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): DivC {
        return new DivC({ class: 設定パネルコンテナ })
                    .setStyleCSS({
                        left: `${this._position.toビューポート座標値().x.値}px`,
                        top: `${this._position.toビューポート座標値().y.値}px`
                    })
                    .childs([
                        new DivC({ class: 設定パネルヘッダー }).childs([
                            new DivC({ class: 設定パネルタイトル, text: "矢印設定" }),
                            new ButtonC({ class: 閉じるボタン, text: "×" }).addTypedEventListener("click", () => {this._on閉じる();})
                        ]).bind(self => {
                            this._mouseWife = new MouseWife(self).ドラッグ連動登録({
                                onドラッグ開始: (e) => {self.setStyleCSS({ cursor: "grabbing" });},
                                onドラッグ中: (e) => {
                                    const delta = e.data.直前のマウス位置から現在位置までの差分;
                                    const 現在のビューポート座標 = this._position.toビューポート座標値();
                                    const 新しい座標 = 現在のビューポート座標.plus(Px2DVector.fromXYpair(delta));
                                    this._componentRoot.setStyleCSS({
                                        left: `${新しい座標.x.値}px`,
                                        top: `${新しい座標.y.値}px`
                                    });
                                },
                                onドラッグ終了: (e) => {self.setStyleCSS({ cursor: "grab" });}
                            });
                        }).setStyleCSS({ cursor: "grab" }),
                        this.create線の色設定(),
                        this.create線の太さ設定()
                    ]);
    }

    private create線の色設定(): DivC {
        return new DivC({ class: 設定項目 }).childs([
            new LabelC({ class: 設定項目ラベル, text: "線の色" }),
            new InputC({ class: カラー入力, type: "color", value: this._現在の設定.線の色 })
                .addTypedEventListener("input", (e: Event) => {
                    const target = e.target as HTMLInputElement;
                    this._現在の設定 = this._現在の設定.with線の色(target.value);
                    this._on設定変更(this._現在の設定);
                })
        ]);
    }

    private create線の太さ設定(): DivC {
        return new DivC({ class: 設定項目 }).childs([
            new LabelC({ class: 設定項目ラベル, text: "線の太さ (px)" }),
            new NumberSliderInput({
                min: 1, max: 10, step: 1,
                initialValue: this._現在の設定.線の太さ,
                class: 数値入力
            })
                .onValueInput((新太さ: number) => {
                    this._現在の設定 = this._現在の設定.with線の太さ(新太さ);
                    this._on設定変更(this._現在の設定);
                })
        ]);
    }
}