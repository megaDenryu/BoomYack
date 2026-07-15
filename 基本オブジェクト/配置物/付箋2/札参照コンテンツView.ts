import { div, DivC, LV2HtmlComponentBase } from "SengenUI/index";

import { I付箋コンテンツView } from "./I付箋コンテンツView";
import { 札参照コンテンツを作る, 付箋コンテンツデータ } from "../../描画キャンバス/付箋コンテンツデータ";
import { 付箋設定状態 } from "../設定パネル";
import { FudabaAPIクライアント } from "../../Fudaba連携/FudabaAPIクライアント";
import { 札参照カード } from "../../Fudaba連携/style.css";
import { 札参照コンテンツView依存関係, 札参照表示状態 } from "./札参照コンテンツ仕様";
import { 札参照表示を更新する } from "./札参照表示";
export type { 札参照コンテンツView依存関係 } from "./札参照コンテンツ仕様";

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

    private _表示を更新する(): void {
        札参照表示を更新する(this._componentRoot, this._表示状態, this._札ID, this._onHeightChange);
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

    public AI操作に対応しているか(): boolean { return false; }
}
