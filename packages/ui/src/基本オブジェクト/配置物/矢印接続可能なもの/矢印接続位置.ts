import { Canvas座標Base, Px2DVector, 配置物座標点 } from "SengenUI/index";

export interface 絶対矢印上下左右Position<
    座標点T extends Canvas座標Base<座標点T> & 配置物座標点
> {
    上: 座標点T;
    右: 座標点T;
    下: 座標点T;
    左: 座標点T;
}

export interface 相対矢印上下左右Position {
    上: Px2DVector;
    右: Px2DVector;
    下: Px2DVector;
    左: Px2DVector;
}

export interface 矢印上下左右Position<
    座標点T extends Canvas座標Base<座標点T> & 配置物座標点
> {
    絶対: 絶対矢印上下左右Position<座標点T>;
    相対: 相対矢印上下左右Position;
}
