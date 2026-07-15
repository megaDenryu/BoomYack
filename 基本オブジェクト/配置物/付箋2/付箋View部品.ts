import { Canvas座標Base, div, DivC, Px長さ, 配置物座標点 } from "SengenUI/index";
import { 配置物zIndex } from "../../I配置物";
import { I接続点親情報 } from "../矢印接続可能なもの/接続点";
import { 矢印接続可能なもの, 矢印接続可能なもの依存関係 } from "../矢印接続可能なもの/矢印接続可能なもの";
import { 付箋本体 } from "./自動リサイズ付箋style.css";
import type { 自動リサイズ付箋View構築データ } from "./自動リサイズ付箋Viewオプション";
import { I付箋コンテンツView } from "./I付箋コンテンツView";
import { 付箋コンテンツViewを生成する } from "./付箋コンテンツViewファクトリ";
import { 付箋ドラッグ操作領域 } from "./付箋ドラッグ操作領域";
import { 付箋ジオメトリ } from "./付箋ジオメトリ";
import { リサイズハンドル } from "./リサイズハンドル";

export interface 付箋View部品<T extends Canvas座標Base<T> & 配置物座標点> {
    readonly 本体: DivC;
    readonly コンテンツ: I付箋コンテンツView;
    readonly ドラッグ操作領域: 付箋ドラッグ操作領域;
    readonly 左ハンドル: リサイズハンドル;
    readonly 右ハンドル: リサイズハンドル;
    readonly 接続点: 矢印接続可能なもの<T>;
}

export function 付箋View部品を構築する<T extends Canvas座標Base<T> & 配置物座標点>(
    option: 自動リサイズ付箋View構築データ<T>,
    arrowDep: 矢印接続可能なもの依存関係<T>,
    parent: I接続点親情報<T>,
    geometry: 付箋ジオメトリ<T>,
    接続点余白: Px長さ,
): 付箋View部品<T> {
    const コンテンツ = 付箋コンテンツViewを生成する(
        option.初期コンテンツ, option.minHeight,
        { fudabaAPIクライアント: option.fudabaAPIクライアント },
    );
    return {
        本体: div({ class: 付箋本体 }).setStyleCSS({
            display: "flex", flexDirection: "column", zIndex: 配置物zIndex.付箋内部構造.コンテナ,
        }),
        コンテンツ,
        ドラッグ操作領域: new 付箋ドラッグ操作領域("付箋をドラッグ"),
        左ハンドル: ハンドル("左"),
        右ハンドル: ハンドル("右"),
        接続点: new 矢印接続可能なもの(geometry.接続点(接続点余白), arrowDep, parent),
    };
}

function ハンドル(方向: "左" | "右"): リサイズハンドル {
    return new リサイズハンドル(方向 === "左" ? "left" : "right")
        .setStyleCSS({ zIndex: 配置物zIndex.付箋内部構造.リサイズハンドル });
}
