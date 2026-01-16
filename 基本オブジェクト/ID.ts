import { IDBase自動採番 } from "Extend/DDDBase/IDBase";

export class ノードID extends IDBase自動採番<"ノードID",ノードID> {
    constructor(id?:string) {
        super(id);
    }
}

export class エッジID extends IDBase自動採番<"エッジID",エッジID> {
    constructor(id?:string) {
        super(id);
    }
}

export class ビュー内部ID extends IDBase自動採番<"ビュー内部ID",ビュー内部ID> {
    constructor(id?:string) {
        super(id);
    }
}
export class 中点ID extends IDBase自動採番<"中点ID",中点ID> {
    constructor(id?:string) {
        super(id);
    }
}

/**
 * 付箋のID
 */
export class 付箋ID extends IDBase自動採番<"付箋ID", 付箋ID> {
    constructor(id?: string) {
        super(id);
    }
}

/**
 * まっすぐ矢印のID
 */
export class 矢印ID extends IDBase自動採番<"矢印ID", 矢印ID> {
    constructor(id?: string) {
        super(id);
    }
}

/**
 * 折れ線矢印のID
 */
export class 折れ線矢印ID extends IDBase自動採番<"折れ線矢印ID", 折れ線矢印ID> {
    constructor(id?: string) {
        super(id);
    }
}

export class グループミニキャンバスID extends IDBase自動採番<"グループミニキャンバスID", グループミニキャンバスID> {
    constructor(id?: string) {
        super(id);
    }
}

export type 配置物ID = 中点ID | 付箋ID | 矢印ID | 折れ線矢印ID | グループミニキャンバスID;

/**
 * キャンバスのID
 */
export class キャンバスID extends IDBase自動採番<"キャンバスID", キャンバスID> {
    constructor(id?: string) {
        super(id);
    }
}

function testID() {
    const id1 = new ノードID();
    const id2 = new ノードID();
    const edgeId1 = new エッジID();
    const edgeId2 = new エッジID();

    // console.log(id1.equal(id1)); // true
    // console.log(id1.equal(edgeId2)); // false
    // console.log(edgeId1.equal(id1)); // false
    

}
