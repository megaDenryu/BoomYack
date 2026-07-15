import { I座標JSON } from "./座標データ";
import { I付箋JSON } from "./付箋データ";
import { I矢印JSON } from "./矢印データ";
import { I折れ線矢印JSON } from "./折れ線矢印データ";
import { Iなめらか曲線矢印JSON } from "./なめらか曲線矢印データ";

export interface I描画キャンバスJSON {
    version: string;
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    描画原点: I座標JSON;
    配置物リスト: ReadonlyArray<I付箋JSON | I矢印JSON | I折れ線矢印JSON | Iなめらか曲線矢印JSON>;
}

export type 描画キャンバスJSON = I描画キャンバスJSON;
