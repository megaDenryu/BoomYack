import { Px2DVector, Px長さ, 描画座標点 } from "SengenUI/index";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { Iキャンバスコマンド } from "../../キャンバス操作/コマンドリポジトリ/Iキャンバスコマンド";
import { 配置物テキスト変更コマンド, 配置物移動コマンド, 配置物追加コマンド } from "../../キャンバス操作/コマンドリポジトリ/具体的なコマンド群";
import { コンテキストメニューコンテナ } from "../../キャンバス操作/円状コンテキストメニュー/コンテキストメニューコンテナ";
import { 付箋ID } from "../../ID";
import { 付箋集約 } from "../../配置物/付箋2/付箋集約";
import { 自動リサイズ付箋Viewオプション } from "../../配置物/付箋2/自動リサイズ付箋View";
import { FudabaAPIクライアント } from "../../Fudaba連携/FudabaAPIクライアント";
import { 付箋コンテンツデータ } from "../付箋コンテンツデータ";
import { CanvasGraphModel } from "./CanvasGraphModel";
import { 付箋メニュー配線依存関係, 付箋メニュー配線を作る } from "./付箋メニュー配線";

export interface 付箋構築依存関係 {
    model: CanvasGraphModel;
    selection: I配置物選択機能集約;
    contextMenu: コンテキストメニューコンテナ;
    fudaba: FudabaAPIクライアント;
    menu: 付箋メニュー配線依存関係;
    onCommandPush: ((command: Iキャンバスコマンド) => void) | undefined;
}

export function 付箋を構築する(pos: 描画座標点, size: Px2DVector, minHeight: Px長さ,
    content: 付箋コンテンツデータ, id: 付箋ID, dep: 付箋構築依存関係): 付箋集約<描画座標点> {
    let dragStart: 描画座標点 | null = null;
    const options: 自動リサイズ付箋Viewオプション<描画座標点> = {
        position: pos, size, minHeight, 初期コンテンツ: content,
        コンテキストメニューコンテナ: dep.contextMenu,
        fudabaAPIクライアント: dep.fudaba,
        onTextCommit: (oldText, newText) => dep.onCommandPush?.(
            new 配置物テキスト変更コマンド(付箋, oldText, newText)),
        onDragStart: () => { dragStart = 付箋.描画座標点; },
        onDragEnd: () => {
            if (!dragStart) return;
            const end = 付箋.描画座標点;
            if (!dragStart.px2DVector.equals(end.px2DVector))
                dep.onCommandPush?.(new 配置物移動コマンド(付箋, dragStart, end));
        },
    };
    let 付箋!: 付箋集約<描画座標点>;
    付箋 = new 付箋集約(options, {
        i矢印生成先: {
            add折れ線矢印: vm => {
                const arrow = dep.model.add折れ線矢印(vm);
                dep.onCommandPush?.(new 配置物追加コマンド(dep.model, arrow));
                return arrow;
            },
            addなめらか曲線矢印: vm => {
                const arrow = dep.model.addなめらか曲線矢印(vm);
                dep.onCommandPush?.(new 配置物追加コマンド(dep.model, arrow));
                return arrow;
            },
            未接続の点ハンドルを接続点と接続をtryする: point =>
                dep.model.未接続の点ハンドルを接続点と接続をtryする(point),
        },
        i描画空間: dep.model,
        i配置物選択機能集約: dep.selection,
    }, id, 付箋メニュー配線を作る(() => 付箋, dep.menu));
    return 付箋;
}
