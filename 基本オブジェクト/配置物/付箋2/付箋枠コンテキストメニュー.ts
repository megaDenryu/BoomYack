import { 描画座標点 } from "SengenUI/index";
import { 多段格子コンテキストメニュー } from "../../キャンバス操作/多段格子コンテキストメニュー/多段格子コンテキストメニュー";
import { コンテキストメニューコンテナ } from "BoomYack/基本オブジェクト/キャンバス操作/円状コンテキストメニュー/コンテキストメニューコンテナ";
import { Iコンテキストメニュー } from "../../キャンバス操作/円状コンテキストメニュー/円状コンテキストメニュー";
import { 自動リサイズ付箋用コンテキストメニュー依存関係 } from "./付箋枠オプション";
import 付箋Icon from '../../../SVGImg/付箋文字でか斜め色付き.svg?url';
import SaveIcon from '../../../SVGImg/SaveIcon.svg?url';
import ゴミ箱Icon from '../../../SVGImg/ゴミ箱2.svg?url';
import 折れ線矢印Icon from '../../../SVGImg/折れ線矢印.svg?url';
import MicOnIcon from '../../../SVGImg/MicOn.svg?url';
import MicOffIcon from '../../../SVGImg/MicOff.svg?url';

const 画像背景色 = "rgba(255, 255, 255, 0.5)";

/**
 * 付箋の右クリックメニュー(多段格子コンテキストメニュー)を組み立ててコンテナへ登録する。
 * AI操作非対応コンテンツ(札参照等)は分解生成カテゴリを灰色化し、マイク状態変化は
 * アイコンの張り替えで反映する。
 */
export function 付箋コンテキストメニューを構築する(
    コンテナ: コンテキストメニューコンテナ,
    依存関係: 自動リサイズ付箋用コンテキストメニュー依存関係,
    AI操作対応: boolean,
    現在位置を取得: () => 描画座標点,
): Iコンテキストメニュー {
    let コンテキストメニュー!: Iコンテキストメニュー;

    コンテナ.コンテキストメニュー追加(
        new 多段格子コンテキストメニュー({
            mode: "clickable",
            opacity: 0.85,
            showCenterButton: false,
            layer1Items: [
                // アイコン系（1層目十字）
                { id: 'L1-save', iconUrl: SaveIcon, backgroundColor: 画像背景色, Position: 'right', onClick: () => { /* 保存処理があれば */ } },
                { id: 'L1-delete', iconUrl: ゴミ箱Icon, backgroundColor: 画像背景色, Position: 'bottom', onClick: () => { 依存関係.on削除(); } },
                // 未来への拡張用
                { id: 'L1-sticky', iconUrl: 付箋Icon, backgroundColor: 画像背景色, Position: 'top' },
                { id: 'L1-arrow', iconUrl: 折れ線矢印Icon, backgroundColor: 画像背景色, Position: 'left' },

                // カテゴリ系（1層目斜め）
                { id: 'L1-decomp', label: '分解生成', Position: 'lt' },
                { id: 'L1-graph', label: ['グラフ', '操作'], Position: 'rt' },
                { id: 'L1-mic', iconUrl: MicOffIcon, backgroundColor: 画像背景色, Position: 'lb', onClick: (e) => { e.stopPropagation(); 依存関係.onマイク入力トグル?.(); } },
                { id: 'L1-settings', label: '設定', Position: 'rb', onClick: () => { 依存関係.on設定パネル表示?.(現在位置を取得()); } },
            ],
            layer2Items: [
                // 分解生成 (LT)。AI操作対応可否はコンテンツ種別ごとに決まる(I付箋コンテンツView.AI操作に対応しているか)
                { parentId: 'L1-decomp', label: "LLM分解", onClick: () => { if (AI操作対応) { 依存関係.onAI分解_LLM?.(); } } },
                { parentId: 'L1-decomp', label: "区切り分解", onClick: () => { if (AI操作対応) { 依存関係.onAI分解_区切り文字?.(); } } },
                { parentId: 'L1-decomp', label: "続き生成", onClick: () => { if (AI操作対応) { 依存関係.onAI生成?.(); } } },

                // グラフ操作 (RT)
                { parentId: 'L1-graph', label: "グラフ選択", onClick: () => { 依存関係.onグラフ選択?.(); } },
                { parentId: 'L1-graph', label: ["グラフをテキスト", "としてコピー"], onClick: () => { 依存関係.onグラフをテキストとしてコピー?.(); } },
                { parentId: 'L1-graph', label: ["グラフを", "JSON出力"], onClick: () => { 依存関係.onグラフをJSON出力?.(); } },
                { parentId: 'L1-graph', label: "コピー", onClick: () => { 依存関係.on選択配置物をコピー?.(); } },
                { parentId: 'L1-graph', label: "貼り付け", onClick: (e) => { 依存関係.onクリップボードから貼り付け?.(e); } },
            ]
        }).tap((menu) => { コンテキストメニュー = menu; })
    );

    if (!AI操作対応) {
        // 分解生成カテゴリボタン自体を無効相当の見た目(灰色)にして、対応不可であることを一目で示す
        requestAnimationFrame(() => {
            コンテキストメニュー.updateItem?.('L1-decomp', { backgroundColor: 'rgba(120, 120, 120, 0.4)' });
        });
    }

    if (依存関係.onマイク状態監視登録) {
        依存関係.onマイク状態監視登録((isRecording) => {
            if (isRecording) {
                コンテキストメニュー.updateItem?.("L1-mic", { iconUrl: MicOnIcon, backgroundColor: 'rgba(231, 76, 60, 0.85)' });
            } else {
                コンテキストメニュー.updateItem?.("L1-mic", { iconUrl: MicOffIcon });
            }
        });
        // 初期状態反映
        if (依存関係.getマイク入力状態 && 依存関係.getマイク入力状態()) {
            requestAnimationFrame(() => {
                コンテキストメニュー.updateItem?.("L1-mic", { iconUrl: MicOnIcon, backgroundColor: 'rgba(231, 76, 60, 0.85)' });
            });
        }
    }

    return コンテキストメニュー;
}
