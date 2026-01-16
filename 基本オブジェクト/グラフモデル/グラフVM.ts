import { 描画座標点 } from "SengenUI/index";
import { エッジID, ノードID } from "../ID";

import { サイズ } from "../数値";

export class ノードVM implements ノードVMと見なせる {
    public readonly id: ノードID
    public 画面位置: 描画座標点
    public 画面サイズ: サイズ
    public constructor(画面位置: 描画座標点, 画面サイズ: サイズ) {
        this.id = new ノードID();
        this.画面位置 = 画面位置;
        this.画面サイズ = 画面サイズ;
    }
    public get ノードVM(): ノードVM {return this;}
}

export interface ノードVMと見なせる {
    get ノードVM(): ノードVM;
}

/**
 * エッジVMは、ノードVM同士をつなぐオブジェクトです。しかし折れ線エッジみたいなのものも実装したいのでこれの実現方法はここには書いていない。
 * エッジには種類があってどれも始点終点が同じで途中経路が違うという形式である。
 * なのでそれぞれのエッジはエッジVMとみなせるだけにする。
 */
export class エッジVM implements エッジVMと見なせる {
    public readonly id: エッジID
    public readonly start: ノードVM
    public readonly end: ノードVM
    public constructor(start: ノードVM, end: ノードVM) {
        this.id = new エッジID();
        this.start = start;
        this.end = end;
    }
    public get エッジVM(): エッジVM {return this;}
}

export interface エッジVMと見なせる {
    get エッジVM(): エッジVM;
}