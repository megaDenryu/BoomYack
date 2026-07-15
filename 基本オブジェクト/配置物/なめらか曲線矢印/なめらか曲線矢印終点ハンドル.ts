import { Canvas座標Base, I描画空間, 配置物座標点 } from "SengenUI/index";
import { Iなめらか曲線矢印集約, I接触点を教えてくれる人 } from "../../I配置物";
import { I配置物選択機能集約 } from "../../キャンバス操作/配置物選択管理";
import { 終点State } from "../折れ線矢印/折れ線矢印state";
import { 終点ハンドルView } from "../折れ線矢印/終点ハンドルView";
import { 曲線端点ハンドルBase } from "./曲線端点ハンドルBase";

export class 終点ハンドル<T extends Canvas座標Base<T> & 配置物座標点>
    extends 曲線端点ハンドルBase<T, 終点State<T>, 終点ハンドルView> {
    public readonly index = 1;
    public constructor(state: 終点State<T>, parent: Iなめらか曲線矢印集約<T>, space: I描画空間,
        contacts: I接触点を教えてくれる人<T>, selection: I配置物選択機能集約) {
        super(state, parent, space, contacts, selection, commands => new 終点ハンドルView(commands));
    }
}
