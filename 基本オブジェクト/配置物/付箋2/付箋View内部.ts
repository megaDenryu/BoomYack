import { Canvas座標Base, div, DivC, MouseEventData, Px2DVector, Px長さ, 配置物座標点, 描画座標点 } from "SengenUI/index";
import { 矢印接続可能なもの依存関係 } from "../矢印接続可能なもの/矢印接続可能なもの";
import { Iコンテキストメニュー } from "../../キャンバス操作/円状コンテキストメニュー/円状コンテキストメニュー";
import { 付箋座標シェル } from "./自動リサイズ付箋style.css";
import type { 自動リサイズ付箋View } from "./自動リサイズ付箋View";
import type { 自動リサイズ付箋Viewオプション, 自動リサイズ付箋用コンテキストメニュー依存関係 } from "./自動リサイズ付箋Viewオプション";
import { 付箋コンテキストメニューを生成する } from "./付箋コンテキストメニュー";
import { 付箋ドラッグ操作余白Px } from "./付箋操作仕様";
import { 付箋レイアウト } from "./付箋レイアウト";
import { 付箋View部品, 付箋View部品を構築する } from "./付箋View部品";

export interface 付箋View内部<T extends Canvas座標Base<T> & 配置物座標点> {
    readonly root: DivC;
    readonly layout: 付箋レイアウト<T>;
    readonly 部品: 付箋View部品<T>;
    readonly menu: Iコンテキストメニュー;
    readonly onTextChange: (text: string) => void;
}

export function 付箋View内部を構築する<T extends Canvas座標Base<T> & 配置物座標点>(
    option: 自動リサイズ付箋Viewオプション<T>,
    arrowDep: 矢印接続可能なもの依存関係<T>,
    menuDep: 自動リサイズ付箋用コンテキストメニュー依存関係,
    view: 自動リサイズ付箋View<T>,
    on選択: (e: PointerEvent | MouseEvent) => void,
): 付箋View内部<T> {
    const layout = new 付箋レイアウト(option.position, option.size, option.minHeight, new Px長さ(付箋ドラッグ操作余白Px));
    let 部品: 付箋View部品<T> | undefined;
    const 接続点を更新する = (): void => {
        if (部品 === undefined) return;
        const points = layout.ジオメトリ.接続点(new Px長さ(15));
        部品.接続点.update接続点座標(layout.ジオメトリ.相対接続点(points));
    };
    const リサイズ後 = (): void => { 接続点を更新する(); option.onResize?.(); };
    let menu!: Iコンテキストメニュー;
    const menuを表示する = (e: MouseEvent): void => {
        e.preventDefault();
        const pos = new MouseEventData(e).position;
        const fixed = menuDep.座標変換.viewportPointを補正する(pos.x, pos.y);
        menu.表示({ x: fixed.x.値, y: fixed.y.値 });
    };
    部品 = 付箋View部品を構築する(option, arrowDep, view, {
        on選択, onContextMenu: menuを表示する,
        onDragStart: () => option.onDragStart?.(), onDragEnd: () => option.onDragEnd?.(),
        onDrag: e => { layout.移動する(e); 接続点を更新する(); option.onDrag?.(e, view); },
        onTextChange: text => option.onTextChange?.(text),
        onTextCommit: (oldText, newText) => option.onTextCommit?.(oldText, newText),
        onHeightChange: height => { layout.設定する({ size: new Px2DVector(layout.size.x, new Px長さ(height)) }); リサイズ後(); },
        onFocus: () => on選択(new MouseEvent("mousedown")),
        onLeftResize: e => { layout.左をリサイズする(e); リサイズ後(); },
        onRightResize: e => { layout.右をリサイズする(e); リサイズ後(); },
    }, layout.ジオメトリ, new Px長さ(15));
    接続点を更新する();
    const root = div({ class: 付箋座標シェル })
        .addDivEventListener("contextmenu", menuを表示する)
        .addDivEventListener("click", () => menu.非表示())
        .childs([部品.ドラッグ操作領域, 部品.本体, 部品.左ハンドル, 部品.右ハンドル, 部品.接続点]);
    layout.DOMを登録する(root, 部品.本体);
    menu = 付箋コンテキストメニューを生成する(option.コンテキストメニューコンテナ, menuDep, 部品.コンテンツ.AI操作に対応しているか(), () => layout.position as unknown as 描画座標点);
    return { root, layout, 部品, menu, onTextChange: text => option.onTextChange?.(text) };
}
