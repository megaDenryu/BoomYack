import { I座標JSON } from "./座標データ";
import { I接続参照JSON } from "./接続参照データ";

export interface I折れ線矢印JSON {
    type: "折れ線矢印";
    id: string;
    start: I座標JSON;
    中点リスト: Array<I座標JSON>;
    end: I座標JSON;
    startRef?: I接続参照JSON | null;
    endRef?: I接続参照JSON | null;
}
