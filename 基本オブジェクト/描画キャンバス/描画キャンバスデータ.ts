import { 座標データ } from "./座標データ";
import { キャンバスメタデータ } from "./キャンバスメタデータ";
import { キャンバスID } from "../ID";
import { I描画キャンバスJSON } from "./描画キャンバスJSON";
import { 配置物データ, 配置物リストを復元する } from "./描画キャンバス配置物データ";
export type { I描画キャンバスJSON, 描画キャンバスJSON } from "./描画キャンバスJSON";
export type { 配置物データ } from "./描画キャンバス配置物データ";

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

        return new 描画キャンバスデータ(
            json.version,
            metadata,
            座標データ.fromJSON(json.描画原点),
            配置物リストを復元する(json)
        );
    }
}

/**
 * 描画キャンバスデータからメタデータを抽出する
 */
export function 描画キャンバスデータからメタデータ抽出(data: 描画キャンバスデータ): キャンバスメタデータ {
    return data.metadata;
}
