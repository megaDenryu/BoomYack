import { Canvas座標Base, 配置物座標点 } from "SengenUI/index";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { 付箋データ, 座標データ, サイズデータ } from "../../描画キャンバス/データクラス";
import { 折れ線矢印集約 } from "../折れ線矢印";
import { 付箋設定状態 } from "../設定パネル";
import type { 付箋集約 } from "./付箋集約";
import { I自動リサイズ付箋View配線, 自動リサイズ付箋View, 自動リサイズ付箋Viewオプション } from "./自動リサイズ付箋View";

export function 付箋View配線を作る<T extends Canvas座標Base<T> & 配置物座標点>(
    options: 自動リサイズ付箋Viewオプション<T>,
    selection: I配置物選択機能集約,
    self: () => 付箋集約<T>,
): I自動リサイズ付箋View配線<T> {
    return {
        on選択: e => { if (e.ctrlKey) selection.追加選択(self()); else selection.set選択中配置物(self()); },
        onHover: () => selection.setホバー中配置物(self()),
        onDragStart: () => options.onDragStart?.(),
        onDragEnd: () => {
            options.onDragEnd?.();
            for (const arrow of self().矢印接続可能なもの.接続している矢印リスト()) arrow.始点と終点の付箋の接続点を最短のものに切り替える();
        },
        onDrag: (e, view) => selection.まとめて移動(e, view),
        onResize: () => options.onResize?.(),
        onTextChange: text => options.onTextChange?.(text),
        onTextCommit: (oldText, newText) => options.onTextCommit?.(oldText, newText),
    };
}

export function 別の付箋へ矢印を作る<T extends Canvas座標Base<T> & 配置物座標点>(
    from: 付箋集約<T>, to: 付箋集約<T>,
): 折れ線矢印集約<T> {
    const vector = to.描画座標点.minus(from.描画座標点);
    const start = from.矢印接続可能なもの.対象方向へもっとも成す角が小さい接続点を取得する(vector);
    const end = to.矢印接続可能なもの.対象方向へもっとも成す角が小さい接続点を取得する(vector.times(-1));
    const arrow = start.矢印作成();
    arrow.終点ハンドル.接続(end);
    return arrow;
}

export function 付箋をシリアライズする<T extends Canvas座標Base<T> & 配置物座標点>(
    view: 自動リサイズ付箋View<T>, setting: 付箋設定状態,
): 付箋データ {
    const pos = view.position.px2DVector;
    const size = view.getSize();
    return 付箋データ.create(view.配置物ID, 座標データ.fromPx2DVector(pos),
        サイズデータ.create(size.x.値, size.y.値), view.コンテンツデータ, setting);
}
