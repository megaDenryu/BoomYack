import { Canvas座標Base, 配置物座標点 } from "SengenUI/index";

import { 折れ線矢印ID, 矢印ID } from "../../ID";
import { 折れ線矢印VM } from "../折れ線矢印";
import { 矢印VM } from "../折れ線矢印/矢印集約";
import { I矢印接続可能なもの中央PositionState } from "./接続点契約";

export class 接続点State<座標点T extends Canvas座標Base<座標点T> & 配置物座標点> {
    public constructor(
        public pos: 座標点T,
        public i矢印接続可能なもの中央PositionState:
            I矢印接続可能なもの中央PositionState<座標点T>
    ) {}

    public get 矢印vm(): 矢印VM<座標点T> {
        return new 矢印VM(
            new 矢印ID(),
            this.pos,
            this.pos.times(2).minus(this.i矢印接続可能なもの中央PositionState.中央pos.px2DVector)
        );
    }

    public get 折れ線矢印vm(): 折れ線矢印VM<座標点T> {
        return new 折れ線矢印VM(
            new 折れ線矢印ID(),
            this.pos,
            [],
            this.pos.times(2).minus(this.i矢印接続可能なもの中央PositionState.中央pos.px2DVector)
        );
    }
}
