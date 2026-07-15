import { 配置物座標点 } from "SengenUI/index";
import { 付箋コンテンツをtextへ変換 } from "../付箋コンテンツデータ";
import { 配置物連結グラフ } from "./配置物連結グラフ";
import { 付箋情報 } from "./配置物情報";
import { テキスト用グラフ, テキスト用グラフノード, 付箋text, 付箋text型説明 } from "./テキストグラフ型";

export function 付箋情報toテキスト用付箋ノード(note: 付箋情報<配置物座標点>): テキスト用グラフノード<付箋text> {
    return new テキスト用グラフノード(
        { text: 付箋コンテンツをtextへ変換(note.配置物データ.コンテンツ) }, note.配置物データ.id.id,
        note.始点が接続している矢印.map(arrow => arrow.終点接続付箋?.配置物データ.id.id ?? "").filter(id => id !== ""),
        note.終点が接続している矢印.map(arrow => arrow.始点接続付箋?.配置物データ.id.id ?? "").filter(id => id !== ""));
}

export function 配置物連結グラフtoテキスト用グラフノード(graph: 配置物連結グラフ): テキスト用グラフ<付箋text> {
    return new テキスト用グラフ(
        Array.from(graph.付箋map.values()).map(付箋情報toテキスト用付箋ノード), 付箋text型説明);
}
