import { div, DivC, Drag中値, Drag終了値, Drag開始値, Iドラッグに連動可能, LV2HtmlComponentBase, PointerWife } from "SengenUI/index";
import { 配置物zIndex } from "../../I配置物";
import { 始点中心線分情報 } from "./始点中心線分情報";
import { 線分ハンドルコンテナ, 線分ハンドル基本, 線分ハンドル状態 } from "./線分ハンドル.style.css";
import { Iハンドル操作実行時コマンド } from "./Iハンドル操作実行時コマンド";

export class 線分ハンドルView extends LV2HtmlComponentBase implements Iドラッグに連動可能 {
    protected _componentRoot: DivC;
    private _mouseWife: PointerWife;
    private _ドラッグハンドル: DivC;
    private _ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[];
    private _は選択中: boolean = false;
    private _はホバー中: boolean = false;
    private _はドラッグ中: boolean = false;

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
                                this._はホバー中 = true;
                                this.状態を反映させる();
                            });
                            element.addDivEventListener("mouseout", () => {
                                this._はホバー中 = false;
                                this.状態を反映させる();
                            });
                            this.deselect();
                        })
                )
        );
    }

    public render(info: 始点中心線分情報): this {
        // transform: translate()で位置を設定し、さらにrotateとtranslateYを追加
        this._componentRoot.setViewportPositionByTransform(
            info.始点.toビューポート座標値(),
            { additionalTransform: `translateY(-50%) rotate(${info.angle.toCssValue()})` }
        );
        this._componentRoot.setStyleCSS({
            width: info.length.toStr(),
            transformOrigin: "0 50%" // 左端の中央を回転の基準点にする
        });
        return this;
    }

    public onドラッグ開始(e: Drag開始値): void {
        this._はドラッグ中 = true;
        this.状態を反映させる();
        this._ハンドル操作実行時コマンドlist.forEach(cmd => cmd.onハンドルドラッグ開始?.(e));
    }

    public onドラッグ中(e: Drag中値): void {
       // 線分自体は位置を持たず、コマンド経由で始点と終点を移動させる
       this._ハンドル操作実行時コマンドlist.forEach(cmd => cmd.onハンドルドラッグ中?.(e));
    }

    public onドラッグ終了(e: Drag終了値): void {
        this._はドラッグ中 = false;
        this.状態を反映させる();
        this._ハンドル操作実行時コマンドlist.forEach(cmd => cmd.onハンドルドラッグ終了?.(e));
    }

    public on右クリック(e: MouseEvent): void {
       // コマンドに右クリックイベントを通知
       this._ハンドル操作実行時コマンドlist.forEach(cmd => cmd.on右クリック?.(e));
    }

    public select(): this {
        this._は選択中 = true;
        this.状態を反映させる();
        return this;
    }

    public deselect(): this {
        this._は選択中 = false;
        this.状態を反映させる();
        return this;
    }

    private 状態を反映させる(): void {
        if (this._はドラッグ中) {
            this._ドラッグハンドル.removeClass(線分ハンドル状態.通常);
            this._ドラッグハンドル.removeClass(線分ハンドル状態.未選択ホバー);
            this._ドラッグハンドル.removeClass(線分ハンドル状態.選択中);
            this._ドラッグハンドル.removeClass(線分ハンドル状態.選択中ホバー);
            this._ドラッグハンドル.addClass(線分ハンドル状態.ドラッグ中);
        } else if (this._は選択中) {
            this._ドラッグハンドル.removeClass(線分ハンドル状態.ドラッグ中);
            this._ドラッグハンドル.removeClass(線分ハンドル状態.通常);
            this._ドラッグハンドル.removeClass(線分ハンドル状態.未選択ホバー);
            if (this._はホバー中) {
                this._ドラッグハンドル.removeClass(線分ハンドル状態.選択中);
                this._ドラッグハンドル.addClass(線分ハンドル状態.選択中ホバー);
            } else {
                this._ドラッグハンドル.removeClass(線分ハンドル状態.選択中ホバー);
                this._ドラッグハンドル.addClass(線分ハンドル状態.選択中);
            }
        } else {
            this._ドラッグハンドル.removeClass(線分ハンドル状態.ドラッグ中);
            this._ドラッグハンドル.removeClass(線分ハンドル状態.選択中);
            this._ドラッグハンドル.removeClass(線分ハンドル状態.選択中ホバー);
            if (this._はホバー中) {
                this._ドラッグハンドル.removeClass(線分ハンドル状態.通常);
                this._ドラッグハンドル.addClass(線分ハンドル状態.未選択ホバー);
            } else {
                this._ドラッグハンドル.removeClass(線分ハンドル状態.未選択ホバー);
                this._ドラッグハンドル.addClass(線分ハンドル状態.通常);
            }
        }
    }
}
