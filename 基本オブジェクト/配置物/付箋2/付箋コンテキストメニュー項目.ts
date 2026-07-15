import { 描画座標点 } from "SengenUI/index";
import { 格子メニュー1層オプション, 格子メニュー2層オプション } from "../../キャンバス操作/多段格子コンテキストメニュー/多段格子コンテキストメニュー";
import type { 自動リサイズ付箋用コンテキストメニュー依存関係 } from "./自動リサイズ付箋Viewオプション";
import 付箋Icon from '../../../SVGImg/付箋文字でか斜め色付き.svg?url';
import SaveIcon from '../../../SVGImg/SaveIcon.svg?url';
import ゴミ箱Icon from '../../../SVGImg/ゴミ箱2.svg?url';
import 折れ線矢印Icon from '../../../SVGImg/折れ線矢印.svg?url';
import MicOffIcon from '../../../SVGImg/MicOff.svg?url';

const 画像背景色 = "rgba(255, 255, 255, 0.5)";

export function 付箋メニュー1層(
    dep: 自動リサイズ付箋用コンテキストメニュー依存関係,
    現在位置: () => 描画座標点,
): 格子メニュー1層オプション[] {
    return [
        { id: "L1-save", iconUrl: SaveIcon, backgroundColor: 画像背景色, Position: "right" },
        { id: "L1-delete", iconUrl: ゴミ箱Icon, backgroundColor: 画像背景色, Position: "bottom", onClick: () => dep.on削除() },
        { id: "L1-sticky", iconUrl: 付箋Icon, backgroundColor: 画像背景色, Position: "top" },
        { id: "L1-arrow", iconUrl: 折れ線矢印Icon, backgroundColor: 画像背景色, Position: "left" },
        { id: "L1-decomp", label: "分解生成", Position: "lt" },
        { id: "L1-graph", label: ["グラフ", "操作"], Position: "rt" },
        { id: "L1-mic", iconUrl: MicOffIcon, backgroundColor: 画像背景色, Position: "lb", onClick: e => { e.stopPropagation(); dep.onマイク入力トグル?.(); } },
        { id: "L1-settings", label: "設定", Position: "rb", onClick: () => dep.on設定パネル表示(現在位置()) },
    ];
}

export function 付箋メニュー2層(dep: 自動リサイズ付箋用コンテキストメニュー依存関係, AI対応: boolean): 格子メニュー2層オプション[] {
    const AI操作 = (fn?: () => void) => () => { if (AI対応) fn?.(); };
    return [
        { parentId: "L1-decomp", label: "LLM分解", onClick: AI操作(dep.onAI分解_LLM) },
        { parentId: "L1-decomp", label: "区切り分解", onClick: AI操作(dep.onAI分解_区切り文字) },
        { parentId: "L1-decomp", label: "続き生成", onClick: AI操作(dep.onAI生成) },
        { parentId: "L1-graph", label: "グラフ選択", onClick: () => dep.onグラフ選択?.() },
        { parentId: "L1-graph", label: ["グラフをテキスト", "としてコピー"], onClick: () => dep.onグラフをテキストとしてコピー?.() },
        { parentId: "L1-graph", label: ["グラフを", "JSON出力"], onClick: () => dep.onグラフをJSON出力?.() },
        { parentId: "L1-graph", label: "コピー", onClick: () => dep.on選択配置物をコピー?.() },
        { parentId: "L1-graph", label: "貼り付け", onClick: e => dep.onクリップボードから貼り付け?.(e) },
    ];
}
