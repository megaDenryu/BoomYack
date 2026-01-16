import { エッジID, ノードID } from "./ID";

export class ノードモデル {
    public readonly id : ノードID;

    public constructor() {
        this.id = new ノードID();
    }
}

export class エッジモデル {
    public readonly id : エッジID;
    public from : ノードモデル;
    public to : ノードモデル;

    public constructor(to: ノードモデル, from: ノードモデル) {
        this.id = new エッジID();
        this.to = to;
        this.from = from;
    }

}
