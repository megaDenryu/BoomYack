import { 描画座標点 } from "SengenUI/index";
import { 多段格子コンテキストメニュー } from "../../キャンバス操作/多段格子コンテキストメニュー/多段格子コンテキストメニュー";
import { Iコンテキストメニュー } from "../../キャンバス操作/円状コンテキストメニュー/円状コンテキストメニュー";
import { コンテキストメニューコンテナ } from "../../キャンバス操作/円状コンテキストメニュー/コンテキストメニューコンテナ";
import type { 自動リサイズ付箋用コンテキストメニュー依存関係 } from "./自動リサイズ付箋Viewオプション";
import { 付箋メニュー1層, 付箋メニュー2層 } from "./付箋コンテキストメニュー項目";
import MicOnIcon from '../../../SVGImg/MicOn.svg?url';
import MicOffIcon from '../../../SVGImg/MicOff.svg?url';

export function 付箋コンテキストメニューを生成する(
    コンテナ: コンテキストメニューコンテナ,
    dep: 自動リサイズ付箋用コンテキストメニュー依存関係,
    AI対応: boolean,
    現在位置: () => 描画座標点,
): Iコンテキストメニュー {
    const menu = new 多段格子コンテキストメニュー({
        mode: "clickable", opacity: 0.85, showCenterButton: false,
        layer1Items: 付箋メニュー1層(dep, 現在位置),
        layer2Items: 付箋メニュー2層(dep, AI対応),
    });
    コンテナ.コンテキストメニュー追加(menu);
    if (!AI対応) requestAnimationFrame(() => menu.updateItem("L1-decomp", { backgroundColor: "rgba(120, 120, 120, 0.4)" }));
    dep.onマイク状態監視登録?.(recording => マイク表示を変える(menu, recording));
    if (dep.getマイク入力状態?.()) requestAnimationFrame(() => マイク表示を変える(menu, true));
    return menu;
}

function マイク表示を変える(menu: 多段格子コンテキストメニュー, recording: boolean): void {
    menu.updateItem("L1-mic", recording
        ? { iconUrl: MicOnIcon, backgroundColor: "rgba(231, 76, 60, 0.85)" }
        : { iconUrl: MicOffIcon });
}
