import { div, Degree角度, DivC, Drag中値, Drag終了値, Drag開始値, Iドラッグに連動可能, LV2部品集約Base, PointerWife, 位置管理, 配置物座標点 } from "SengenUI/index";
import { I折れ線矢印View, 配置物zIndex } from "../../I配置物";
import { Iハンドル操作実行時コマンド } from "./Iハンドル操作実行時コマンド";
import { Iハンドル形状 } from "./Iハンドル形状";

interface 点ハンドルView部品 {
    readonly 形状: Iハンドル形状;
    readonly 内側: DivC;
}

/** 位置・ドラッグを担い、SVG形状は部品として注入する点ハンドル。 */
export class 点ハンドルView extends LV2部品集約Base<点ハンドルView部品>
    implements I折れ線矢印View, Iドラッグに連動可能 {
    protected _componentRoot: DivC;
    private _mouseWife: PointerWife;
    private _位置管理: 位置管理;
    private readonly _部品: 点ハンドルView部品;
    private readonly _ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[];

    constructor(ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[], 形状: Iハンドル形状) {
        super();
        this._ハンドル操作実行時コマンドlist = ハンドル操作実行時コマンドlist;
        this._部品 = { 形状, 内側: div().setStyleCSS({ position: "absolute",
            transform: "translate(-50%, -50%)", pointerEvents: "auto", cursor: "move" }) };
        this._componentRoot = this._ルートを構築する(this._部品);
    }

    protected _ルートを構築する(部品: 点ハンドルView部品): DivC {
        return div().setStyleCSS({ position: "absolute", width: "0px", height: "0px",
            pointerEvents: "none", zIndex: 配置物zIndex.矢印内部構造.点ハンドル })
            .tap(self => { this._位置管理 = new 位置管理(self); })
            .child(部品.内側.child(部品.形状.svg)
                .tap(element => { this._mouseWife = new PointerWife(element).ドラッグ連動登録(this); })
                .addDivEventListener("mouseover", () => 部品.形状.ホバー時のスタイル変更(true))
                .addDivEventListener("mouseout", () => 部品.形状.ホバー時のスタイル変更(false)));
    }

    public 位置を設定(pos: 配置物座標点): this {
        this._位置管理.位置を設定(pos.toビューポート座標値());
        return this;
    }

    public 回転角度を設定(angle: Degree角度): this {
        this._部品.内側.setStyleCSS({
            transform: `translate(-50%, -50%) rotate(${angle.toCssValue()})`
        });
        return this;
    }

    public onドラッグ開始(e: Drag開始値): void {
        this._位置管理.管理対象の移動を開始();
        this._部品.形状.ドラッグ時のスタイル変更(true);
        this._ハンドル操作実行時コマンドlist.forEach(cmd => cmd.onハンドルドラッグ開始?.(e))
    }

    public onドラッグ中(e: Drag中値): void {
        this._位置管理.本体のあるべき位置を計算して適用する(e);
       this._ハンドル操作実行時コマンドlist.forEach(cmd => cmd.onハンドルドラッグ中?.(e));
    }

    public onドラッグ終了(e: Drag終了値): void {
        this._部品.形状.ドラッグ時のスタイル変更(false);
        this._ハンドル操作実行時コマンドlist.forEach(cmd => cmd.onハンドルドラッグ終了?.(e));
    }

    public on右クリック(e: MouseEvent): void {
        this._ハンドル操作実行時コマンドlist.forEach(cmd => cmd.on右クリック?.(e));
    }
}
