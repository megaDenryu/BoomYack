import { 格子メニュー1層オプション, 格子メニュー2層オプション } from "../../キャンバス操作/多段格子コンテキストメニュー/多段格子コンテキストメニュー";
import { CanvasView状態 } from "./CanvasView状態";
import { Canvas配置物操作 } from "./Canvas配置物操作";
import { Canvasキーボード操作 } from "./Canvasキーボード操作";
import 付箋Icon from '../../../SVGImg/付箋文字でか斜め色付き.svg?url';
import SaveIcon from '../../../SVGImg/SaveIcon.svg?url';
import ゴミ箱Icon from '../../../SVGImg/ゴミ箱2.svg?url';
import 折れ線矢印Icon from '../../../SVGImg/折れ線矢印.svg?url';
import MicOffIcon from '../../../SVGImg/MicOff.svg?url';

export function メニュー項目を生成する(状態: CanvasView状態, 操作: Canvas配置物操作, key: Canvasキーボード操作): {
    layer1: 格子メニュー1層オプション[]; layer2: 格子メニュー2層オプション[];
} {
    const bg = "rgba(255, 255, 255, 0.5)";
    const layer1: 格子メニュー1層オプション[] = [
        { id: "L1-sticky", iconUrl: 付箋Icon, backgroundColor: bg, Position: "top" },
        { id: "L1-delete", iconUrl: ゴミ箱Icon, backgroundColor: bg, Position: "bottom", onClick: () => 操作.deleteSelectedItem() },
        { id: "L1-arrow", iconUrl: 折れ線矢印Icon, backgroundColor: bg, Position: "left" },
        { id: "L1-save", iconUrl: SaveIcon, backgroundColor: bg, Position: "right", onClick: () => 状態.options.onSaveClick?.() },
        { id: "L1-ai", label: ["分解", "生成"], Position: "lt" },
        { id: "L1-graph", label: ["グラフ", "操作"], Position: "rt" },
        { id: "L1-mic", iconUrl: MicOffIcon, backgroundColor: bg, Position: "lb", onClick: e => { e.stopPropagation(); 状態.voiceRecognitionService.toggleRecording(); } },
    ];
    const selected = () => 状態.selectionManager.選択中配置物[0];
    const layer2: 格子メニュー2層オプション[] = [
        { parentId: "L1-sticky", label: "自由テキスト", onClick: e => 操作.addStickyNote(e) },
        { parentId: "L1-sticky", label: ["タイトル付き", "付箋"], onClick: e => 操作.addTitledStickyNote(e) },
        { parentId: "L1-sticky", label: ["Fudaba札を", "貼り付け"], onClick: e => 操作.pasteFudabaCard(e) },
        { parentId: "L1-arrow", label: "折れ線矢印", onClick: e => 操作.addArrow(e) },
        { parentId: "L1-arrow", label: ["なめらか", "矢印"], onClick: e => 操作.addSmoothArrow(e) },
        { parentId: "L1-graph", label: "グラフ選択", onClick: () => key.selectGraph() },
        { parentId: "L1-graph", label: ["グラフをテキスト", "としてコピー"], onClick: () => { const x = selected(); if (x) 状態.グラフ操作サービス.グラフをテキストとしてコピー(x); } },
        { parentId: "L1-graph", label: ["グラフを", "JSON出力"], onClick: () => { const x = selected(); if (x) 状態.グラフ操作サービス.グラフを選択してjsonファイル出力(x); } },
        { parentId: "L1-graph", label: "コピー", onClick: () => key.copy() },
        { parentId: "L1-graph", label: "貼り付け", onClick: e => 状態.グラフ操作サービス.クリップボードから貼り付け(e, c => 状態.commandRepository.push(c)) },
    ];
    return { layer1, layer2 };
}
