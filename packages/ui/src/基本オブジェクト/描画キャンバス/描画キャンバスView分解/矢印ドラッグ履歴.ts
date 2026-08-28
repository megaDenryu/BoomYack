import { I矢印集約配線 } from "../../I配置物";
import { Iキャンバスコマンド } from "../../キャンバス操作/コマンドリポジトリ/Iキャンバスコマンド";

interface I矢印データ取得<T> { toシリアライズデータ(): T; }

export function 矢印ドラッグ履歴を作る<T>(arrow: I矢印データ取得<T>,
    コマンドを作る: (開始: T, 終了: T) => Iキャンバスコマンド,
    commandを積む: ((command: Iキャンバスコマンド) => void) | undefined): I矢印集約配線 {
    let 開始データ: T | null = null;
    return {
        onハンドルドラッグ開始: () => { 開始データ = arrow.toシリアライズデータ(); },
        onハンドルドラッグ終了: () => {
            if (開始データ === null) return;
            const 終了データ = arrow.toシリアライズデータ();
            if (JSON.stringify(開始データ) !== JSON.stringify(終了データ)) {
                commandを積む?.(コマンドを作る(開始データ, 終了データ));
            }
            開始データ = null;
        },
    };
}
