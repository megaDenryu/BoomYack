import { Canvas座標Base, I描画空間, 配置物座標点 } from "SengenUI/index";
import { I折れ線矢印集約, I接触点を教えてくれる人, I点ハンドル } from "../../I配置物";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { 中点State, 始点State, 終点State } from "./折れ線矢印state";
import { 折れ線矢印View } from "./折れ線矢印View";
import { 折れ線矢印VM } from "./折れ線矢印VM";
import { 中点ハンドル } from "./中点ハンドル";
import { 始点ハンドル, 終点ハンドル, 線分ハンドル } from "./矢印集約";
import { 線分を生成する } from "./折れ線矢印構造";

interface 生成結果<T extends Canvas座標Base<T> & 配置物座標点> {
    始点: 始点ハンドル<T>; 終点: 終点ハンドル<T>; 点: I点ハンドル<T>[];
    線分: 線分ハンドル<T>[]; view: 折れ線矢印View;
}

export function 折れ線矢印を生成する<T extends Canvas座標Base<T> & 配置物座標点>(
    vm: 折れ線矢印VM<T>, 親: I折れ線矢印集約<T>, 接触点提供者: I接触点を教えてくれる人<T>,
    描画空間: I描画空間, 選択機能: I配置物選択機能集約,
): 生成結果<T> {
    const 始点 = new 始点ハンドル(new 始点State(vm.start), 親, 描画空間, 接触点提供者, 選択機能);
    const 終点 = new 終点ハンドル(new 終点State(vm.end), 親, vm.中点リスト.length + 1, 描画空間, 接触点提供者, 選択機能);
    const 中点 = vm.中点リスト.map((pos, index) => new 中点ハンドル(new 中点State(pos), index + 1, 親, 描画空間));
    const 点: I点ハンドル<T>[] = [始点, ...中点, 終点];
    const 線分 = 点.slice(0, -1).map((点ハンドル, index) => 線分を生成する(親, 描画空間, 点ハンドル, 点[index + 1], index));
    const view = new 折れ線矢印View(始点.view, 終点.view).配線する({
        on選択: e => e.ctrlKey ? 選択機能.追加選択(親) : 選択機能.set選択中配置物(親),
        onHover: () => 選択機能.setホバー中配置物(親),
    });
    中点.forEach(x => view.add中点ハンドル(x.view));
    線分.forEach(x => view.add線分ハンドル(x.view));
    点.forEach(x => x.render());
    線分.forEach(x => x.render());
    return { 始点, 終点, 点, 線分, view };
}
