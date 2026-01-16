import { MousePosition, Px2DVector, Px長さ, 配置物座標点 } from "SengenUI/index";
import { 中点ID } from "../../ID";





export interface I点state<座標点T extends 配置物座標点> {
    pos: 座標点T;
    setPosition(newPos: 座標点T): void;
}

export class 中点State<座標点T extends 配置物座標点> implements I点state<座標点T> {
    public readonly 中点ID: 中点ID;
    private _pos: 座標点T;
    public get pos(): 座標点T {
        return this._pos;
    }
    constructor(initialPos: 座標点T) {
        this.中点ID = new 中点ID();
        this._pos = initialPos;
    }

    public setPosition(newPos: 座標点T): void {
        this._pos = newPos;
    }
}

export class 始点State<座標点T extends 配置物座標点> implements I点state<座標点T> {
    private _pos: 座標点T;
    public get pos(): 座標点T {
        return this._pos;
    }
    constructor(initialPos: 座標点T) {
        this._pos = initialPos;
    }

    public setPosition(newPos: 座標点T): void {
        this._pos = newPos;
    }
}

export class 終点State<座標点T extends 配置物座標点> implements I点state<座標点T> {
    private _pos: 座標点T;
    public get pos(): 座標点T {
        return this._pos;
    }
    constructor(initialPos: 座標点T) {
        this._pos = initialPos;
    }

    public setPosition(newPos: 座標点T): void {
        this._pos = newPos;
    }
}

/**
 * MousePositionからPx2DVectorへの変換ヘルパー
 */
export function mousePositionToPx2DVector(pos: MousePosition): Px2DVector {
    return new Px2DVector(new Px長さ(pos.x), new Px長さ(pos.y));
}
