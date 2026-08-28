import { 描画座標点 } from "SengenUI/index";

import { Iグラフ配置先 } from "../配置物リポジトリ";
import { テキスト用グラフ, 付箋text } from "../描画キャンバス/配置物グラフ/テキスト化情報";
import { 階層的レイアウトStrategy } from "./レイアウトStrategy/階層的レイアウトStrategy";
import { レイアウト設定 } from "./ValueObjects/レイアウト設定";
import { I前処理位置調整Strategy, I後処理位置調整Strategy } from "./レイアウトStrategy/IStrategy";
import { サイズ考慮ツリーレイアウトStrategy } from "./レイアウトStrategy/サイズ考慮ツリーレイアウトStrategy";
import { I配置物集約 } from "../I配置物";
import { グラフ配置処理 } from "./グラフ配置処理";

export class テキスト用グラフからキャンバスに配置するサービス {
    private readonly 配置先: Iグラフ配置先;
    private readonly グラフ: テキスト用グラフ<付箋text>;
    private readonly 先行位置調整サービス: I前処理位置調整Strategy;
    private readonly 後処理位置調整サービス: I後処理位置調整Strategy;
    private readonly 配置処理: グラフ配置処理;

    public constructor(
        配置先: Iグラフ配置先,
        グラフ: テキスト用グラフ<付箋text>,
        開始位置?: 描画座標点,
        前処理Strategy?: I前処理位置調整Strategy,
        後処理Strategy?: I後処理位置調整Strategy
    ) {
        this.配置先 = 配置先;
        this.グラフ = グラフ;
        const 基本設定 = レイアウト設定.default();
        const 設定 = 開始位置 ? 基本設定.with開始位置(開始位置.px2DVector) : 基本設定;
        this.先行位置調整サービス = 前処理Strategy ??
            new 階層的レイアウトStrategy(グラフ, 配置先, 設定);
        this.後処理位置調整サービス = 後処理Strategy ??
            new サイズ考慮ツリーレイアウトStrategy(設定);
        this.配置処理 = new グラフ配置処理(
            this.配置先,
            this.グラフ,
            this.先行位置調整サービス,
            this.後処理位置調整サービス
        );
    }

    public グラフを配置する(): I配置物集約[] {
        return this.配置処理.実行する();
    }
}


