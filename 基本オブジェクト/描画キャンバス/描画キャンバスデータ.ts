import { I座標JSON, 座標データ } from "./座標データ";
import { I付箋JSON, 付箋データ } from "./付箋データ";
import { I矢印JSON, 矢印データ } from "./矢印データ";
import { I折れ線矢印JSON, 折れ線矢印データ } from "./折れ線矢印データ";
import { Iなめらか曲線矢印JSON, なめらか曲線矢印データ } from "./なめらか曲線矢印データ";
import { IキャンバスメタデータJSON, キャンバスメタデータ } from "./キャンバスメタデータ";
import { キャンバスID } from "../ID";

/**
 * すべての配置物データの共用型
 */
export type 配置物データ = 付箋データ | 折れ線矢印データ | なめらか曲線矢印データ;

/** 描画キャンバスデータJSON */
export interface I描画キャンバスJSON {
    version: string;
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    描画原点: I座標JSON;
    配置物リスト: ReadonlyArray<I付箋JSON | I矢印JSON | I折れ線矢印JSON | Iなめらか曲線矢印JSON>;
}

/** 描画キャンバスデータのJSON形式 */
export type 描画キャンバスJSON = I描画キャンバスJSON;

/**
 * 描画キャンバスデータ - 関数型DDD的な不変データクラス
 */
export class 描画キャンバスデータ {
    public readonly version: string;
    public readonly metadata: キャンバスメタデータ;
    public readonly 描画原点: 座標データ;
    public readonly 配置物リスト: ReadonlyArray<配置物データ>;

    private constructor(
        version: string,
        metadata: キャンバスメタデータ,
        描画原点: 座標データ,
        配置物リスト: ReadonlyArray<配置物データ>
    ) {
        this.version = version;
        this.metadata = metadata;
        this.描画原点 = 描画原点;
        this.配置物リスト = 配置物リスト;
    }

    public static create(
        version: string,
        metadata: キャンバスメタデータ,
        描画原点: 座標データ,
        配置物リスト: ReadonlyArray<配置物データ>
    ): 描画キャンバスデータ {
        return new 描画キャンバスデータ(version, metadata, 描画原点, 配置物リスト);
    }

    public withMetadata(metadata: キャンバスメタデータ): 描画キャンバスデータ {
        return new 描画キャンバスデータ(this.version, metadata, this.描画原点, this.配置物リスト);
    }

    public with描画原点(描画原点: 座標データ): 描画キャンバスデータ {
        return new 描画キャンバスデータ(this.version, this.metadata, 描画原点, this.配置物リスト);
    }

    public with配置物リスト(配置物リスト: ReadonlyArray<配置物データ>): 描画キャンバスデータ {
        return new 描画キャンバスデータ(this.version, this.metadata, this.描画原点, 配置物リスト);
    }

    public updateTimestamp(): 描画キャンバスデータ {
        return new 描画キャンバスデータ(
            this.version,
            this.metadata.updateTimestamp(),
            this.描画原点,
            this.配置物リスト
        );
    }

    public toJSON(): I描画キャンバスJSON {
        const metaJSON = this.metadata.toJSON();
        return {
            version: this.version,
            id: metaJSON.id,
            name: metaJSON.name,
            createdAt: metaJSON.createdAt,
            updatedAt: metaJSON.updatedAt,
            描画原点: this.描画原点.toJSON(),
            配置物リスト: this.配置物リスト.map(item => item.toJSON())
        };
    }

    public static fromJSON(json: I描画キャンバスJSON): 描画キャンバスデータ {
        const metadata = キャンバスメタデータ.create(
            new キャンバスID(json.id),
            json.name,
            new Date(json.createdAt),
            new Date(json.updatedAt)
        );

        const 配置物リスト: 配置物データ[] = json.配置物リスト.map((item: any) => {
            switch (item.type) {
                case "付箋":
                    return 付箋データ.fromJSON(item);
                case "折れ線矢印":
                    return 折れ線矢印データ.fromJSON(item);
                case "なめらか曲線矢印":
                    return なめらか曲線矢印データ.fromJSON(item);
                default:
                    throw new Error(`Unknown type: ${item.type}`);
            }
        });

        return new 描画キャンバスデータ(
            json.version,
            metadata,
            座標データ.fromJSON(json.描画原点),
            配置物リスト
        );
    }
}

/**
 * 描画キャンバスデータからメタデータを抽出する
 */
export function 描画キャンバスデータからメタデータ抽出(data: 描画キャンバスデータ): キャンバスメタデータ {
    return data.metadata;
}
