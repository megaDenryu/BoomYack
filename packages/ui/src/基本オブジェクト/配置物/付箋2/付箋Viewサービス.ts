import { Canvas座標Base, Drag中値, MouseEventData, Px2DVector, Px長さ, 配置物座標点, 描画座標点 } from "SengenUI/index";
import { Iコンテキストメニュー } from "../../キャンバス操作/円状コンテキストメニュー/円状コンテキストメニュー";
import type { I自動リサイズ付箋View配線, 自動リサイズ付箋View } from "./自動リサイズ付箋View";
import { 自動リサイズ付箋View構築データ, 自動リサイズ付箋用コンテキストメニュー依存関係 } from "./自動リサイズ付箋Viewオプション";
import { 付箋コンテキストメニューを生成する } from "./付箋コンテキストメニュー";
import { I付箋ドラッグ操作領域配線 } from "./付箋ドラッグ操作領域";
import { I付箋コンテンツView配線 } from "./I付箋コンテンツView";
import { Iリサイズハンドル配線 } from "./リサイズハンドル";
import { 付箋レイアウト } from "./付箋レイアウト";
import { 付箋View部品 } from "./付箋View部品";

export class 付箋Viewサービス<T extends Canvas座標Base<T> & 配置物座標点> {
    public readonly menu: Iコンテキストメニュー;
    public readonly ドラッグ配線: I付箋ドラッグ操作領域配線;
    public readonly コンテンツ配線: I付箋コンテンツView配線;
    public readonly 左ハンドル配線: Iリサイズハンドル配線;
    public readonly 右ハンドル配線: Iリサイズハンドル配線;

    public constructor(
        option: 自動リサイズ付箋View構築データ<T>,
        private readonly _layout: 付箋レイアウト<T>,
        private readonly _部品: 付箋View部品<T>,
        private readonly _menuDep: 自動リサイズ付箋用コンテキストメニュー依存関係,
        private readonly _view: 自動リサイズ付箋View<T>,
        private readonly _配線: I自動リサイズ付箋View配線<T>,
    ) {
        this.menu = 付箋コンテキストメニューを生成する(option.コンテキストメニューコンテナ,
            _menuDep, _部品.コンテンツ.AI操作に対応しているか(),
            () => _layout.position as unknown as 描画座標点);
        this.ドラッグ配線 = {
            onPointerDown: e => _配線.on選択(e),
            onContextMenu: e => this.メニューを表示する(e),
            onドラッグ開始: () => _配線.onDragStart(),
            onドラッグ中: e => this._ドラッグする(e),
            onドラッグ終了: () => _配線.onDragEnd(),
        };
        this.コンテンツ配線 = {
            onTextChange: text => _配線.onTextChange(text),
            onBlurTextCommit: (oldText, newText) => _配線.onTextCommit(oldText, newText),
            onHeightChange: height => this._高さを変える(height),
            onFocus: () => _配線.on選択(new MouseEvent("mousedown")),
        };
        this.左ハンドル配線 = { onドラッグ中: e => { _layout.左をリサイズする(e); this._リサイズ後(); } };
        this.右ハンドル配線 = { onドラッグ中: e => { _layout.右をリサイズする(e); this._リサイズ後(); } };
    }

    public 接続点を更新する(): void {
        const points = this._layout.ジオメトリ.接続点(new Px長さ(15));
        this._部品.接続点.update接続点座標(this._layout.ジオメトリ.相対接続点(points));
    }
    public メニューを表示する(e: MouseEvent): void {
        e.preventDefault();
        const pos = new MouseEventData(e).position;
        const fixed = this._menuDep.座標変換.viewportPointを補正する(pos.x, pos.y);
        this.menu.表示({ x: fixed.x.値, y: fixed.y.値 });
    }
    private _ドラッグする(e: Drag中値): void { this._layout.移動する(e); this.接続点を更新する(); this._配線.onDrag(e, this._view); }
    private _高さを変える(height: number): void {
        this._layout.設定する({ size: new Px2DVector(this._layout.size.x, new Px長さ(height)) });
        this._リサイズ後();
    }
    private _リサイズ後(): void { this.接続点を更新する(); this._配線.onResize(); }
}
