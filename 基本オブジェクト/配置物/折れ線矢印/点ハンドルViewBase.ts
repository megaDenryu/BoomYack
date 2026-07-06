import { div, Degree角度, DivC, Drag中値, Drag終了値, Drag開始値, Iドラッグに連動可能, LV2HtmlComponentBase, PointerWife, SvgC, 位置管理, 配置物座標点 } from "SengenUI/index";
import { I折れ線矢印View, 配置物zIndex } from "../../I配置物";
import { Iハンドル操作実行時コマンド } from "./Iハンドル操作実行時コマンド";

/**
 * 点ハンドル　つかんでドラッグして移動できる
 *  - 端点: 始点と終点。つかんでドラッグして移動できる。ドラッグすると、一定距離動くごとに「曲線形状計算機」が実行される
 *  - 曲がり点: つかんでドラッグして移動できる
 * - 曲線: 始点ハンドルと終点ハンドルを結ぶ。端点ハンドルがonMoveするたびにrerenderされる。
 */
export class 点ハンドルViewBase extends LV2HtmlComponentBase implements I折れ線矢印View, Iドラッグに連動可能 {
    protected _componentRoot: DivC;
    private _mouseWife: PointerWife;
    private _svgContainer: DivC;
    private _位置管理: 位置管理;
    private _ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[];
    private _回転角度: Degree角度 | null = null;

    constructor(ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[]) {
        super();
        this._ハンドル操作実行時コマンドlist = ハンドル操作実行時コマンドlist;
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): DivC {
        // 外側のコンテナ: 位置管理用（transform適用なし）
        return (
            div()
                .setStyleCSS({
                    position: "absolute",
                    width: "0px",    // サイズを0にして基準点のみ
                    height: "0px",
                    pointerEvents: "none",
                    zIndex:配置物zIndex.矢印内部構造.点ハンドル
                })
                .tap((self) => { this._位置管理 = new 位置管理(self); })
                .child(
                    // 内側のコンテナ: SVGを配置
                    div()
                        .setStyleCSS({
                            position: "absolute",
                            transform: "translate(-50%, -50%)",
                            pointerEvents: "auto",
                            cursor: "move"
                        })
                        .tap((element) => {
                            this._svgContainer = element;
                            this._mouseWife = new PointerWife(element).ドラッグ連動登録(this);
                        })
                        .addDivEventListener("mouseover", (e) => {
                            this.onHoverStyleChange(true);
                        })
                        .addDivEventListener("mouseout", (e) => {
                            this.onHoverStyleChange(false);
                        }))
        );
    }

    protected addSvgContent(shape: SvgC): this {
        this._svgContainer.child(shape);
        return this;
    }

    public 位置を設定(pos: 配置物座標点): this {
        this._位置管理.位置を設定(pos.toビューポート座標値());
        return this;
    }

    /**
     * ハンドルの回転角度を設定（度数法）
     * 内側のコンテナのtransformを更新します
     */
    public 回転角度を設定(angle: Degree角度): this {
        this._回転角度 = angle;
        this._svgContainer.setStyleCSS({
            transform: `translate(-50%, -50%) rotate(${angle.toCssValue()})`
        });
        return this;
    }

    public onドラッグ開始(e: Drag開始値): void {
        this._位置管理.管理対象の移動を開始();
        this.onDragStyleChange(true);
        this._ハンドル操作実行時コマンドlist.forEach(cmd => cmd.onハンドルドラッグ開始?.(e))
    }

    public onドラッグ中(e: Drag中値): void {
       this._位置管理.本体のあるべき位置を計算して適用する(e);
       this._ハンドル操作実行時コマンドlist.forEach(cmd => cmd.onハンドルドラッグ中?.(e));
    }

    public onドラッグ終了(e: Drag終了値): void {
        this.onDragStyleChange(false);
        this._ハンドル操作実行時コマンドlist.forEach(cmd => cmd.onハンドルドラッグ終了?.(e));
    }

    public on右クリック(e: MouseEvent): void {
        this._ハンドル操作実行時コマンドlist.forEach(cmd => cmd.on右クリック?.(e));
    }

    /**
     * ドラッグ時のスタイル変更（サブクラスでオーバーライド可能）
     */
    protected onDragStyleChange(isDragging: boolean): void {
        // デフォルトの実装（サブクラスでオーバーライド）
    }

    /**
     * ホバー時のスタイル変更（サブクラスでオーバーライド可能）
     */
    protected onHoverStyleChange(isHovered: boolean): void {
        // デフォルトの実装（サブクラスでオーバーライド）
    }
}
