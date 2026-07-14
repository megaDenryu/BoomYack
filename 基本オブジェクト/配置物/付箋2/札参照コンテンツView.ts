import { div, DivC, LV2HtmlComponentBase } from "SengenUI/index";

import { I付箋コンテンツView, 付箋コンテンツView共通依存関係 } from "./I付箋コンテンツView";
import { 札参照コンテンツを作る, 付箋コンテンツデータ } from "../../描画キャンバス/付箋コンテンツデータ";
import { 付箋設定状態 } from "../設定パネル";
import { FudabaAPIクライアント } from "../../Fudaba連携/FudabaAPIクライアント";
import { Fudaba札DTO } from "../../Fudaba連携/Fudaba札DTO";
import { Fudaba札バッジ } from "../../Fudaba連携/Fudaba札バッジ";
import { 種別に対応する配色を取得する, 状態に対応する配色を取得する } from "../../Fudaba連携/Fudaba札配色";
import { 札参照カード, 札参照タイトル, 札参照バッジ行, 札参照担当者, 札参照案内文 } from "../../Fudaba連携/style.css";

/** 札参照コンテンツViewを構築するために枠から渡す依存関係 */
export interface 札参照コンテンツView依存関係 extends 付箋コンテンツView共通依存関係 {
    初期札ID: string;
    fudabaAPIクライアント: FudabaAPIクライアント;
}

/**
 * 表示状態を判別共用体で表す。「参照解決不可」は削除済み札・API未応答等を1つの
 * 専用表示状態に集約したNull Object相当の状態であり、例外でボード全体を壊さず
 * 吸収する(CLAUDE.md「不在・未設定・使用不可」原則、設計2026-07-14_付箋コンテンツ設計.md 7.3節)。
 */
type 札参照表示状態 =
    | { 種別: "読込中" }
    | { 種別: "解決済み"; 札: Fudaba札DTO }
    | { 種別: "参照解決不可"; 理由: string };

/**
 * Fudaba(札場)の札をボード上に投影する読み取り専用コンテンツ。I付箋コンテンツViewの
 * 3つ目の実装。付箋View初期化時に1回だけ札一覧を取得して該当IDを検索する
 * (設計2026-07-14_付箋コンテンツ設計.md 7.3節)。状態変更はボードから行えない。
 */
export class 札参照コンテンツView extends LV2HtmlComponentBase implements I付箋コンテンツView {
    protected _componentRoot: DivC;
    private readonly _札ID: string;
    private readonly _onHeightChange: (newHeight: number) => void;
    private _表示状態: 札参照表示状態 = { 種別: "読込中" };

    public constructor(依存関係: 札参照コンテンツView依存関係) {
        super();
        this._札ID = 依存関係.初期札ID;
        this._onHeightChange = 依存関係.onHeightChange;
        this._componentRoot = div({ class: 札参照カード });
        this._表示を更新する();
        void this._札を読み込む(依存関係.fudabaAPIクライアント);
    }

    private async _札を読み込む(クライアント: FudabaAPIクライアント): Promise<void> {
        const 結果 = await クライアント.IDで札を取得する(this._札ID);
        switch (結果.種別) {
            case "成功":
                this._表示状態 = { 種別: "解決済み", 札: 結果.札 };
                break;
            case "未検出":
                this._表示状態 = { 種別: "参照解決不可", 理由: "この札は見つかりません(削除された可能性があります)" };
                break;
            case "通信失敗":
                this._表示状態 = { 種別: "参照解決不可", 理由: "Fudabaサーバーに接続できません" };
                break;
        }
        this._表示を更新する();
    }

    /**
     * 表示状態に応じて自身のルート要素の中身を作り直す(第3条が endorse する
     * clearChildren→childs の自己更新パターン)。レイアウト確定後に高さを計測し
     * 枠へ通知する(自動リサイズテキストエリアの初期高さ通知と同じ遅延実行)。
     */
    private _表示を更新する(): void {
        this._componentRoot.clearChildren();
        if (this._表示状態.種別 === "読込中") {
            this._componentRoot.child(div({ class: 札参照案内文, text: "Fudaba札を読み込み中..." }));
        } else if (this._表示状態.種別 === "参照解決不可") {
            this._componentRoot.childs([
                div({ class: 札参照タイトル, text: `Fudaba札#${this._札ID}` }),
                div({ class: 札参照案内文, text: this._表示状態.理由 })
            ]);
        } else {
            const 札 = this._表示状態.札;
            this._componentRoot.childs([
                div({ class: 札参照タイトル, text: 札.タイトル }),
                div({ class: 札参照バッジ行 }).childs([
                    new Fudaba札バッジ(札.種別, 種別に対応する配色を取得する(札.種別)),
                    new Fudaba札バッジ(札.状態, 状態に対応する配色を取得する(札.状態))
                ]),
                div({ class: 札参照担当者, text: 札.担当者 !== null ? `担当: ${札.担当者}` : "担当者未割当" })
            ]);
        }

        setTimeout(() => {
            this._onHeightChange(this._componentRoot.dom.element.scrollHeight);
        }, 0);
    }

    public get text(): string {
        return `[Fudaba札#${this._札ID}]`;
    }

    public setText(_text: string): void {
        // 読み取り専用の投影のため、音声入力等の外部からの書き込みは意図的に無視する
    }

    public get コンテンツデータ(): 付箋コンテンツデータ {
        return 札参照コンテンツを作る(this._札ID);
    }

    public 設定を適用(_設定: 付箋設定状態): void {
        // 背景色・文字色は種別/状態バッジの配色を優先し、付箋の共通設定では上書きしない
    }

    public AI操作に対応しているか(): boolean {
        return false;
    }
}
