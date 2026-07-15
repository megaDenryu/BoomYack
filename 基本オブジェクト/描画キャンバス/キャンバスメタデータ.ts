import { キャンバスID } from "../ID";

/** キャンバスメタデータJSON */
export interface IキャンバスメタデータJSON {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * キャンバスメタデータ - 関数型DDD的な不変データクラス
 */
export class キャンバスメタデータ {
    public readonly id: キャンバスID;
    public readonly name: string;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    private constructor(
        id: キャンバスID,
        name: string,
        createdAt: Date,
        updatedAt: Date
    ) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static create(
        id: キャンバスID,
        name: string,
        createdAt?: Date,
        updatedAt?: Date
    ): キャンバスメタデータ {
        const now = new Date();
        return new キャンバスメタデータ(
            id,
            name,
            createdAt ?? now,
            updatedAt ?? now
        );
    }

    public withName(name: string): キャンバスメタデータ {
        return new キャンバスメタデータ(this.id, name, this.createdAt, this.updatedAt);
    }

    public updateTimestamp(): キャンバスメタデータ {
        return new キャンバスメタデータ(this.id, this.name, this.createdAt, new Date());
    }

    public toJSON(): IキャンバスメタデータJSON {
        return {
            id: this.id.id,
            name: this.name,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }

    public static fromJSON(json: IキャンバスメタデータJSON): キャンバスメタデータ {
        return new キャンバスメタデータ(
            new キャンバスID(json.id),
            json.name,
            new Date(json.createdAt),
            new Date(json.updatedAt)
        );
    }
}
