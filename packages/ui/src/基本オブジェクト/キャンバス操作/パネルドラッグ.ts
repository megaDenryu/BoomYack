import { DivC, PointerWife, Px2DVector, ビューポート座標値 } from "SengenUI/index";

export function パネルドラッグを配線する(handle: DivC, position: () => ビューポート座標値,
    move: (position: ビューポート座標値) => void): PointerWife {
    handle.setStyleCSS({ cursor: "grab" });
    return new PointerWife(handle).ドラッグ連動登録({
        onドラッグ開始: () => { handle.setStyleCSS({ cursor: "grabbing" }); },
        onドラッグ中: e => {
            const delta = e.data.直前のマウス位置から現在位置までの差分;
            move(position().plus(Px2DVector.fromXYpair(delta)));
        },
        onドラッグ終了: () => { handle.setStyleCSS({ cursor: "grab" }); },
    });
}
