import { CircleC, Degree角度, DivC, Drag中値, Drag終了値, Drag開始値, Iドラッグに連動可能, LV2HtmlComponentBase, MouseWife, PolygonC, Px長さ, SvgC, TypedEventListener, 位置管理, 配置物座標点 } from "SengenUI/index";


import { I折れ線矢印View, 配置物zIndex } from "../../I配置物";







import { 線分ハンドルコンテナ, 線分ハンドル基本, 線分ハンドル状態 } from "./線分ハンドル.style.css";

/**
 * 必要な値型を列挙する
 * - 点ハンドル　つかんでドラッグして移動できる
 *  - 端点: 始点と終点。つかんでドラッグして移動できる。ドラッグすると、一定距離動くごとに「曲線形状計算機」が実行される
 *  - 曲がり点: つかんでドラッグして移動できる
 * - 曲線: 始点ハンドルと終点ハンドルを結ぶ。端点ハンドルがonMoveするたびにrerenderされる。
 * - 線分: 点ハンドルを結ぶ
 * - 曲線形状: 始点,曲がり点配列,終点からなる
 * - 曲線形状計算機: ２つの点が与えられたとき、その間を補完する曲線形状を計算する。最初は直線。間に障害物がある場合は折れ線にする。
 * - 切れ込みハンドル: 曲線をダブルクリックするとそこにハンドルを追加できる場合もある
 * 
 * # 付箋との連携
 * 始点作成点: 付箋の周りに配置され、最初は見えない。ホバーするとあらわれ、クリックすると始点ハンドルが作成され、ドラッグすると終点が出る。
 * 終点bind点: 付箋の周りに配置され、最初は見えない。終点を移動して重なって終点のドラッグ状態が終わるとそこにbindされる。
 * 
 * 設計図は
 * まず始点
 */
export class 折れ線矢印View extends LV2HtmlComponentBase implements I折れ線矢印View {
    protected _componentRoot: DivC;
    public readonly 始点ハンドルView: 始点ハンドルView;
    public readonly 終点ハンドルView: 終点ハンドルView;
    public readonly 中点ハンドルviewリスト: 中点ハンドルView[] = [];
    public readonly 線分ハンドルviewリスト: 線分ハンドルView[] = [];

    constructor(
        始点ハンドルView: 始点ハンドルView,
        終点ハンドルView: 終点ハンドルView,
    ) {
        super();
        this.始点ハンドルView = 始点ハンドルView;
        this.終点ハンドルView = 終点ハンドルView;
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): DivC {
        return new DivC()
            .setStyleCSS({
                position: "absolute",
                width: "100%",
                height: "100%",
                pointerEvents: "none",
            }).childs([
                this.始点ハンドルView,
                this.終点ハンドルView,
            ]);
    }


    public add中点ハンドル(view: 中点ハンドルView): this {
        this.中点ハンドルviewリスト.push(view);
        this._componentRoot.child(view);
        return this;
    }

    public add線分ハンドル(view: 線分ハンドルView): this {
        this.線分ハンドルviewリスト.push(view);
        this._componentRoot.child(view);
        return this;
    }

    /**
     * 選択時の処理: 中点表示、最前面化、線分の色変更
     */
    public select(): this {
        this.show中点ハンドル();
        this._componentRoot.setStyleCSS({ zIndex: "10000" });
        this.線分ハンドルviewリスト.forEach(view => {view.select(); });
        return this;
    }

    /**
     * 選択解除時の処理: 中点非表示、zIndex戻す、線分の色を元に戻す
     */
    public deselect(): this {
        this.hide中点ハンドル();
        this._componentRoot.setStyleCSS({ zIndex: "auto" });
        this.線分ハンドルviewリスト.forEach(view => {view.deselect();});
        return this;
    }

    /**
     * ホバー時の処理: 中点表示
     */
    public hover(): this {
        this.show中点ハンドル();
        return this;
    }

    /**
     * ホバー解除時の処理: 中点非表示
     */
    public unhover(): this {
        this.hide中点ハンドル();
        return this;
    }

    /**
     * 中点ハンドルを表示
     */
    private show中点ハンドル(): this {
        this.中点ハンドルviewリスト.forEach(view => {
            view.setStyleCSS({ display: "block" });
        });
        return this;
    }

    /**
     * 中点ハンドルを非表示
     */
    private hide中点ハンドル(): this {
        this.中点ハンドルviewリスト.forEach(view => {
            view.setStyleCSS({ display: "none" });
        });
        return this;
    }

    public onClick(callback: TypedEventListener<'click'>) {
        this._componentRoot.addDivEventListener("click", (e) => { callback(e);});
        return this;
    }

    public onHover(callback: TypedEventListener<'mouseover'>) {
        this._componentRoot.addDivEventListener("mouseover", (e) => {callback(e);});
        return this;
    }

    public 選択状態のzIndexにする(): void {
        this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.選択中 });
    }

    public 通常状態のzIndexにする(): void {
        this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.未選択 });
    }
}

export class 矢印View extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    public readonly 始点ハンドルView: 始点ハンドルView;
    public readonly 終点ハンドルView: 終点ハンドルView;
    public readonly 線分ハンドルView: 線分ハンドルView;

    constructor(
        始点ハンドルView: 始点ハンドルView,
        終点ハンドルView: 終点ハンドルView,
        線分ハンドルView: 線分ハンドルView
    ) {
        super();
        this.始点ハンドルView = 始点ハンドルView;
        this.終点ハンドルView = 終点ハンドルView;
        this.線分ハンドルView = 線分ハンドルView;
        this._componentRoot = this.createComponentRoot();
    }
    protected createComponentRoot(): DivC {
        return new DivC({class:"矢印"}).setStyleCSS({
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                }).childs([
                    this.始点ハンドルView,
                    this.終点ハンドルView,
                    this.線分ハンドルView
                ]);
    }

    public 選択状態のzIndexにする(): void {
        this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.選択中 });
    }

    public 通常状態のzIndexにする(): void {
        this._componentRoot.setStyleCSS({ zIndex: 配置物zIndex.選択状態.未選択 });
    }
}

export interface I点ハンドルView {
    回転角度を設定(angle: Degree角度): I点ハンドルView;
    位置を設定(pos: 配置物座標点): I点ハンドルView;
}

/**
 * 点ハンドル　つかんでドラッグして移動できる
 *  - 端点: 始点と終点。つかんでドラッグして移動できる。ドラッグすると、一定距離動くごとに「曲線形状計算機」が実行される
 *  - 曲がり点: つかんでドラッグして移動できる
 * - 曲線: 始点ハンドルと終点ハンドルを結ぶ。端点ハンドルがonMoveするたびにrerenderされる。
 */
export class 点ハンドルViewBase extends LV2HtmlComponentBase implements I折れ線矢印View, Iドラッグに連動可能 {
    protected _componentRoot: DivC;
    private _mouseWife: MouseWife;
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
        return new DivC()
            .setStyleCSS({
                position: "absolute",
                width: "0px",    // サイズを0にして基準点のみ
                height: "0px",
                pointerEvents: "none",
                zIndex:配置物zIndex.矢印内部構造.点ハンドル
            })
            .bind((self) => { this._位置管理 = new 位置管理(self); })
            .child(
                // 内側のコンテナ: SVGを配置
                new DivC()
                    .setStyleCSS({
                        position: "absolute",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "auto",
                        cursor: "move"
                    })
                    .bind((element) => { 
                        this._svgContainer = element;
                        this._mouseWife = new MouseWife(element).ドラッグ連動登録(this);
                    })
                    .addDivEventListener("mouseover", (e) => {
                        this.onHoverStyleChange(true);
                    })
                    .addDivEventListener("mouseout", (e) => {
                        this.onHoverStyleChange(false);
                    }));
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

export class 点ハンドルView extends 点ハンドルViewBase {
    constructor(ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[]) {
        
        super(ハンドル操作実行時コマンドlist);
        this.addSvgContent(
            new SvgC({ width: 20, height: 20, viewBox: "0 0 20 20" }).child(
                new CircleC({
                    cx: 10,
                    cy: 10,
                    r: 8,
                    fill: "#4CAF50",
                    stroke: "#2E7D32",
                    strokeWidth: 2
                })
            ));
    }
}


export class 始点中心線分情報 {
    public readonly 始点: 配置物座標点;
    public readonly length: Px長さ;
    public readonly angle: Degree角度;

    constructor(始点: 配置物座標点, length: Px長さ, angle: Degree角度) {
        this.始点 = 始点;
        this.length = length;
        this.angle = angle;
    }

    public static 計算(始点pos: 配置物座標点, 終点pos: 配置物座標点): 始点中心線分情報 {
        const delta = 終点pos.px2DVector.minus(始点pos.px2DVector);
        const length = new Px長さ(Math.sqrt(delta.dot(delta)));
        const angle = new Degree角度(Math.atan2(delta.y.値, delta.x.値) * 180 / Math.PI);
        return new 始点中心線分情報(始点pos, length, angle);
    }


}

export class 線分ハンドルView extends LV2HtmlComponentBase implements Iドラッグに連動可能 {
    protected _componentRoot: DivC;
    private _mouseWife: MouseWife;
    private _ドラッグハンドル: DivC;
    private _ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[];
    private _は選択中: boolean = false;
    private _はホバー中: boolean = false;
    private _はドラッグ中: boolean = false;

    constructor(ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[]) {
        super();
        this._ハンドル操作実行時コマンドlist = ハンドル操作実行時コマンドlist;
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): DivC {
        return new DivC({ class: 線分ハンドルコンテナ })
            .setStyleCSS({
                position: "absolute",
                width: "100px",
                pointerEvents: "auto",
                zIndex: 配置物zIndex.矢印内部構造.線分
            })
            .child(
                new DivC({ class: 線分ハンドル基本 })
                    .bind((element) => {
                        this._ドラッグハンドル = element;
                        this._mouseWife = new MouseWife(element).ドラッグ連動登録(this);
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



export class 始点ハンドルView extends LV2HtmlComponentBase implements I点ハンドルView {
    protected _componentRoot: 円ハンドルView;
    private _ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[];

    constructor(ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[]) {
        super();
        this._ハンドル操作実行時コマンドlist = ハンドル操作実行時コマンドlist;
        this._componentRoot = this.createComponentRoot();
    }
    
    protected createComponentRoot(): 円ハンドルView {
        return new 円ハンドルView(this._ハンドル操作実行時コマンドlist);
    }

    public 位置を設定(pos: 配置物座標点): this {
        this._componentRoot.位置を設定(pos);
        return this;
    }

    public 回転角度を設定(angle: Degree角度): this {
        return this;
    }

    public 見た目を接続状態にする(): this {
        // 将来の拡張用
        return this;
    }
}

/**
 * 中点用のハンドルView（将来の拡張用）
 */
export class 中点ハンドルView extends LV2HtmlComponentBase implements I点ハンドルView {
    protected _componentRoot: 点ハンドルView;
    private _ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[];

    constructor(ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[]) {
        super();
        this._ハンドル操作実行時コマンドlist = ハンドル操作実行時コマンドlist;
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): 点ハンドルView {
        return new 円ハンドルView(this._ハンドル操作実行時コマンドlist);
    }

    public 位置を設定(pos: 配置物座標点): 中点ハンドルView {
        this._componentRoot.位置を設定(pos);
        return this;
    }

    public 回転角度を設定(angle: Degree角度): 中点ハンドルView {
        return this;
    }
}

export interface Iハンドル操作実行時コマンド {
    onハンドルドラッグ開始?(e: Drag中値): void;
    onハンドルドラッグ中?(e: Drag中値): void;
    onハンドルドラッグ終了?(e: Drag中値): void;
    on右クリック?(e: MouseEvent): void;
}

/**
 * 始点や中点用の小さな円ハンドル
 */
class 円ハンドルView extends 点ハンドルViewBase {
    private _circle: CircleC;

    public constructor(ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[]) {
        super(ハンドル操作実行時コマンドlist);
        this.addSvgContent(
            new SvgC({ width: 12, height: 12, viewBox: "0 0 12 12" }).child(
                new CircleC({
                    cx: 6,
                    cy: 6,
                    r: 5,
                    fill: "#4CAF50",
                    stroke: "#2E7D32",
                    strokeWidth: 1.5
                }).bind((circle) => { this._circle = circle; }
            )
        ));
    }

    protected onDragStyleChange(isDragging: boolean): void {
        if (isDragging) {
            this._circle.setFill("#66BB6A");
            this._circle.setStroke("#388E3C", 2);
        } else {
            this._circle.setFill("#4CAF50");
            this._circle.setStroke("#2E7D32", 1.5);
        }
    }

    protected onHoverStyleChange(isHovered: boolean): void {
        if (isHovered) {
            this._circle.setFill("#81C784");
        } else {
            this._circle.setFill("#4CAF50");
        }
    }
}

export class 終点ハンドルView extends LV2HtmlComponentBase implements I点ハンドルView {
    protected _componentRoot: 終点矢印ハンドルView;
    private _ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[];

    constructor(ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[]) {
        super();
        this._ハンドル操作実行時コマンドlist = ハンドル操作実行時コマンドlist;
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): 終点矢印ハンドルView {
        return new 終点矢印ハンドルView(this._ハンドル操作実行時コマンドlist);
    }

    public 位置を設定(pos: 配置物座標点): this {
        this._componentRoot.位置を設定(pos);
        return this;
    }

    /**
     * 矢印の向きを設定（度数法）
     */
    public 回転角度を設定(angle: Degree角度): this {
        this._componentRoot.回転角度を設定(angle);
        return this;
    }

    public 見た目を接続状態にする(): this {
        // 将来の拡張用
        return this;
    }
}

/**
 * 終点用の矢印形状ハンドル
 */
class 終点矢印ハンドルView extends 点ハンドルViewBase {
    private _arrow: PolygonC;

    public constructor(ハンドル操作実行時コマンドlist: Iハンドル操作実行時コマンド[]) {
        super(ハンドル操作実行時コマンドlist);
        this.addSvgContent(
            new SvgC({ width: 20, height: 20, viewBox: "0 0 20 20" }).child(
                new PolygonC({
                    points: [[18, 10], [2, 18], [2, 2]],
                    fill: "#FF5722",
                    stroke: "#D84315",
                    strokeWidth: 1.5,
                    strokeLinejoin: "round"
                }).bind((poly) => { this._arrow = poly; }
            )
        ));
    }

    protected onDragStyleChange(isDragging: boolean): void {
        if (isDragging) {
            this._arrow.setFill("#FF7043");
            this._arrow.setStroke("#E64A19", 2);
        } else {
            this._arrow.setFill("#FF5722");
            this._arrow.setStroke("#D84315", 1.5);
        }
    }

    protected onHoverStyleChange(isHovered: boolean): void {
        if (isHovered) {
            this._arrow.setFill("#FF8A65");
        } else {
            this._arrow.setFill("#FF5722");
        }
    }
}


