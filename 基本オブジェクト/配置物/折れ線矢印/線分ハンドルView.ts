import { div, DivC, Drag中値, Drag終了値, Drag開始値, Iドラッグに連動可能, LV2HtmlComponentBase, PointerWife } from "SengenUI/index";
import { 配置物zIndex } from "../../I配置物";
import { 始点中心線分情報 } from "./始点中心線分情報";
import { 線分ハンドルコンテナ, 線分ハンドル基本 } from "./線分ハンドル.style.css";
import { Iハンドル操作実行時コマンド } from "./Iハンドル操作実行時コマンド";
import { 線分ハンドル表示状態 } from "./線分ハンドル表示状態";

export class 線分ハンドルView extends LV2HtmlComponentBase implements Iドラッグに連動可能 {
    protected _componentRoot: DivC;
    private _mouseWife: PointerWife;
    private _ドラッグハンドル: DivC;
    private _ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[];
    private readonly _表示状態 = new 線分ハンドル表示状態();

    constructor(ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[]) {
        super();
        this._ハンドル操作実行時コマンドlist = ハンドル操作実行時コマンドlist;
        this._componentRoot = this._ルートを構築する();
    }

    protected _ルートを構築する(): DivC {
        return (
            div({ class: 線分ハンドルコンテナ })
                .setStyleCSS({
                    position: "absolute",
                    width: "100px",
                    pointerEvents: "auto",
                    zIndex: 配置物zIndex.矢印内部構造.線分
                })
                .child(
                    div({ class: 線分ハンドル基本 })
                        .tap((element) => {
                            this._ドラッグハンドル = element;
                            this._mouseWife = new PointerWife(element).ドラッグ連動登録(this);
                            element.addDivEventListener("mouseover", () => {
                                this._表示状態.ホバー状態を設定する(true);
                                this.状態を反映させる();
                            });
                            element.addDivEventListener("mouseout", () => {
                                this._表示状態.ホバー状態を設定する(false);
                                this.状態を反映させる();
                            });
                            this.deselect();
                        })
                )
        );
    }

    public render(info: 始点中心線分情報): this {
        this._componentRoot.setViewportPositionByTransform(
            info.始点.toビューポート座標値(),
            { additionalTransform: `translateY(-50%) rotate(${info.angle.toCssValue()})` }
        );
        this._componentRoot.setStyleCSS({
            width: info.length.toStr(),
            transformOrigin: "0 50%"
        });
        return this;
    }

    public onドラッグ開始(e: Drag開始値): void {
        this._表示状態.ドラッグ状態を設定する(true);
        this.状態を反映させる();
        this._ハンドル操作実行時コマンドlist.forEach(cmd => cmd.onハンドルドラッグ開始?.(e));
    }

    public onドラッグ中(e: Drag中値): void {
       this._ハンドル操作実行時コマンドlist.forEach(cmd => cmd.onハンドルドラッグ中?.(e));
    }

    public onドラッグ終了(e: Drag終了値): void {
        this._表示状態.ドラッグ状態を設定する(false);
        this.状態を反映させる();
        this._ハンドル操作実行時コマンドlist.forEach(cmd => cmd.onハンドルドラッグ終了?.(e));
    }

    public on右クリック(e: MouseEvent): void {
       this._ハンドル操作実行時コマンドlist.forEach(cmd => cmd.on右クリック?.(e));
    }

    public select(): this {
        this._表示状態.選択状態を設定する(true);
        this.状態を反映させる();
        return this;
    }

    public deselect(): this {
        this._表示状態.選択状態を設定する(false);
        this.状態を反映させる();
        return this;
    }

    private 状態を反映させる(): void {
        this._表示状態.要素へ反映する(this._ドラッグハンドル);
    }
}
