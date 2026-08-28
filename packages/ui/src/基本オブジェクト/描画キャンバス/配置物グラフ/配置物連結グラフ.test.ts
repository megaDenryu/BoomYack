/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest";
import { LV2HtmlComponentBase, Px2DVector, 描画基準座標, 描画座標点, 配置物座標点 } from "SengenUI/index";
import { なめらか曲線矢印ID, 付箋ID, 折れ線矢印ID } from "BoomYack/基本オブジェクト/ID";
import {
    I接触点登録先,
    Iドラッグ移動可能,
    I付箋シリアライズ可能,
    I配置物集約,
    I折れ線矢印シリアライズ可能,
    I折れ線矢印集約,
    Iなめらか曲線矢印シリアライズ可能,
    Iなめらか曲線矢印集約,
    Iなめらか曲線矢印View,
    I点ハンドル,
    I線分ハンドル,
    I矢印集約配線,
} from "BoomYack/基本オブジェクト/I配置物";
import { 付箋データ, 折れ線矢印データ, なめらか曲線矢印データ } from "BoomYack/基本オブジェクト/描画キャンバス/データクラス";
import { 配置物連結グラフをすべて抽出 } from "./配置物連結グラフ";

// 実際の配置物集約はDOM描画・ドラッグ操作等の重い依存を持つため、テストでは
// グラフ走査が実際に呼び出すメンバー(type/toシリアライズデータ/接続付箋ID)だけを
// 本物として実装し、それ以外は「呼ばれたら不正」として例外で明示するテストダブルにする。
abstract class 配置物フェイク基底 implements I配置物集約 {
    public abstract readonly type: I配置物集約["type"];
    public constructor(public readonly idString: string) {}

    public get view(): LV2HtmlComponentBase {
        throw new Error("テストダブルのviewは使用しない");
    }
    public 再描画(): void {}
    public 選択状態のzIndexにする(): void {}
    public 通常状態のzIndexにする(): void {}
    public 接触判定対象を登録する(_登録先: I接触点登録先): void {}
    public ドラッグ移動対象を収集する(_除外view?: LV2HtmlComponentBase): Iドラッグ移動可能[] { return []; }
    public 選択された時の処理(): void {}
    public 選択解除された時の処理(): void {}
    public ホバーされたときの処理(): void {}
    public ホバー解除されたときの処理(): void {}
    public get衝突判定用矩形(): { 位置: 描画座標点; サイズ: Px2DVector } {
        throw new Error("テストダブルの衝突判定は使用しない");
    }
    public abstract toシリアライズデータ(): 付箋データ | 折れ線矢印データ | なめらか曲線矢印データ;
}

abstract class 矢印フェイク基底 extends 配置物フェイク基底 {
    public constructor(
        idString: string,
        private readonly _始点接続付箋ID: 付箋ID | null,
        private readonly _終点接続付箋ID: 付箋ID | null,
    ) { super(idString); }

    public 配線する(_配線: I矢印集約配線): this { return this; }
    public 始点と終点の付箋の接続点を最短のものに切り替える(): void {}
    public get始点接続付箋ID(): 付箋ID | null { return this._始点接続付箋ID; }
    public get終点接続付箋ID(): 付箋ID | null { return this._終点接続付箋ID; }
    public ハンドルドラッグ開始を通知する(): void {}
    public ハンドルドラッグ終了を通知する(): void {}
}

class フェイク付箋 extends 配置物フェイク基底 implements I付箋シリアライズ可能 {
    public readonly type = "付箋";
    private readonly _データ: 付箋データ;

    public constructor(id: string) {
        super(id);
        this._データ = 付箋データ.fromJSON({
            type: "付箋", id, position: { x: 0, y: 0 }, size: { width: 0, height: 0 },
        });
    }

    public toシリアライズデータ(): 付箋データ { return this._データ; }
}

class フェイク折れ線矢印 extends 矢印フェイク基底
    implements I折れ線矢印集約<配置物座標点>, I折れ線矢印シリアライズ可能 {
    public readonly type = "折れ線矢印";
    private readonly _データ: 折れ線矢印データ;

    public constructor(id: string, 始点接続付箋ID: 付箋ID | null, 終点接続付箋ID: 付箋ID | null) {
        super(id, 始点接続付箋ID, 終点接続付箋ID);
        this._データ = 折れ線矢印データ.fromJSON({
            type: "折れ線矢印", id, start: { x: 0, y: 0 }, 中点リスト: [], end: { x: 0, y: 0 },
        });
    }

    public updateStateFromData(_data: 折れ線矢印データ, _モデルの描画基準座標: 描画基準座標): void {}
    public get点ハンドルByIndex(_index: number): I点ハンドル<配置物座標点> | null { return null; }
    public get線分ハンドルByIndex(_index: number): I線分ハンドル<配置物座標点> | null { return null; }
    public insert中点(_insertIndex: number, _pos: 配置物座標点): this { return this; }
    public delete中点(_index: number): this { return this; }
    public toシリアライズデータ(): 折れ線矢印データ { return this._データ; }
}

class フェイクなめらか曲線矢印 extends 矢印フェイク基底
    implements Iなめらか曲線矢印集約<配置物座標点>, Iなめらか曲線矢印シリアライズ可能 {
    public readonly type = "なめらか曲線矢印";
    private readonly _データ: なめらか曲線矢印データ;

    public constructor(id: string, 始点接続付箋ID: 付箋ID | null, 終点接続付箋ID: 付箋ID | null) {
        super(id, 始点接続付箋ID, 終点接続付箋ID);
        this._データ = なめらか曲線矢印データ.fromJSON({
            type: "なめらか曲線矢印", id, start: { x: 0, y: 0 }, end: { x: 0, y: 0 },
        });
    }

    public override get view(): Iなめらか曲線矢印View {
        throw new Error("テストダブルのviewは使用しない");
    }
    public get 始点ハンドル(): I点ハンドル<配置物座標点> {
        throw new Error("テストダブルの始点ハンドルは使用しない");
    }
    public get 終点ハンドル(): I点ハンドル<配置物座標点> {
        throw new Error("テストダブルの終点ハンドルは使用しない");
    }
    public updateStateFromData(_data: なめらか曲線矢印データ, _モデルの描画基準座標: 描画基準座標): void {}
    public toシリアライズデータ(): なめらか曲線矢印データ { return this._データ; }
}

describe("配置物連結グラフをすべて抽出", () => {
    it("なめらか曲線矢印と折れ線矢印が混在する連結成分を1つのグラフとして抽出する", () => {
        const 付箋A = new フェイク付箋("note-A");
        const 付箋B = new フェイク付箋("note-B");
        const 付箋C = new フェイク付箋("note-C");
        const 付箋D = new フェイク付箋("note-D"); // どの矢印とも繋がらない孤立付箋
        const なめらか矢印 = new フェイクなめらか曲線矢印("smooth-X", new 付箋ID("note-A"), new 付箋ID("note-B"));
        const 折れ線矢印 = new フェイク折れ線矢印("polyline-Y", new 付箋ID("note-B"), new 付箋ID("note-C"));

        const グラフ群 = 配置物連結グラフをすべて抽出([付箋A, 付箋B, 付箋C, 付箋D, なめらか矢印, 折れ線矢印]);

        const ABCを含むグラフ = グラフ群.配置物が含まれるグラフを取得(付箋A);
        expect(ABCを含むグラフ).not.toBeNull();
        const 選択されたID = ABCを含むグラフ!.配置物集約リスト.map(item => item.idString).sort();
        expect(選択されたID).toEqual(["note-A", "note-B", "note-C", "polyline-Y", "smooth-X"]);

        // なめらか曲線矢印自身を起点にしても同じ連結成分が見つかる
        // (配置物連結グラフ群.配置物が含まれるグラフを取得がなめらか曲線矢印mapも見る必要がある)
        expect(グラフ群.配置物が含まれるグラフを取得(なめらか矢印)).toBe(ABCを含むグラフ);

        // 孤立した付箋Dは別グラフになり、連結成分に混入しない
        const Dを含むグラフ = グラフ群.配置物が含まれるグラフを取得(付箋D);
        expect(Dを含むグラフ).not.toBe(ABCを含むグラフ);
        expect(Dを含むグラフ!.配置物集約リスト.map(item => item.idString)).toEqual(["note-D"]);
    });
});
