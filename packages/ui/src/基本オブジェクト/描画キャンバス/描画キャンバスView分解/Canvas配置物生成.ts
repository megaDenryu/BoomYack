import { Px2DVector, 描画基準座標, 描画座標点 } from "SengenUI/index";

import { I配置物集約 } from "../../I配置物";
import { 折れ線矢印VM, 折れ線矢印集約 } from "../../配置物";
import { なめらか曲線矢印VM } from "../../配置物/なめらか曲線矢印/なめらか曲線矢印VM";
import { なめらか曲線矢印集約 } from "../../配置物/なめらか曲線矢印/なめらか曲線矢印集約";
import { 付箋集約 } from "../../配置物/付箋2/付箋集約";
import { ICanvasItemFactory } from "./CanvasGraphModel契約";

export class Canvas配置物生成 {
    private factory?: ICanvasItemFactory;

    public constructor(
        private readonly 描画基準座標: 描画基準座標,
        private readonly 配置物一覧: () => readonly I配置物集約[],
        private readonly 追加する: (item: I配置物集約) => void
    ) {}

    public setFactory(factory: ICanvasItemFactory): void { this.factory = factory; }

    public add付箋(pos: Px2DVector, text?: string): 付箋集約<描画座標点> {
        return this.描画座標点でadd付箋(描画座標点.fromPx2DVector(pos, this.描画基準座標), text);
    }

    public 描画座標点でadd付箋(pos: 描画座標点, text?: string, 希望ID?: string): 付箋集約<描画座標点> {
        const item = this.factoryを取得().create付箋(pos, text, this.採用ID(希望ID));
        this.追加する(item);
        return item;
    }

    public タイトル付き付箋をadd(pos: 描画座標点, 希望ID?: string): 付箋集約<描画座標点> {
        const item = this.factoryを取得().createタイトル付き付箋(pos, this.採用ID(希望ID));
        this.追加する(item);
        return item;
    }

    public 札参照付箋をadd(pos: 描画座標点, 札ID: string, 希望ID?: string): 付箋集約<描画座標点> {
        const item = this.factoryを取得().create札参照付箋(pos, 札ID, this.採用ID(希望ID));
        this.追加する(item);
        return item;
    }

    public 折れ線矢印をadd(vm: 折れ線矢印VM<描画座標点>): 折れ線矢印集約<描画座標点> {
        const item = this.factoryを取得().create折れ線矢印(vm);
        this.追加する(item);
        return item;
    }

    public なめらか曲線矢印をadd(vm: なめらか曲線矢印VM<描画座標点>): なめらか曲線矢印集約<描画座標点> {
        const item = this.factoryを取得().createなめらか曲線矢印(vm);
        this.追加する(item);
        return item;
    }

    private factoryを取得(): ICanvasItemFactory {
        if (!this.factory) throw new Error("Factory not set");
        return this.factory;
    }

    private 採用ID(希望ID?: string): string | undefined {
        if (希望ID === undefined) return undefined;
        return this.配置物一覧().some(item => item.idString === 希望ID) ? undefined : 希望ID;
    }
}
