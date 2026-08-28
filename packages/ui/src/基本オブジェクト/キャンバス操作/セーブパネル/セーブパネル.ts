import { DivC, LV2HtmlComponentBase } from "SengenUI/index";
import { 描画キャンバスデータ } from "../../描画キャンバス/データクラス";
import { セーブパネル実装 } from "./セーブパネル実装";
import { ISavePanelEvents } from "./セーブパネル型定義";

export type { SaveMode, ISavePanelEvents } from "./セーブパネル型定義";

export class セーブパネル extends LV2HtmlComponentBase {
  protected _componentRoot: DivC;
  private readonly implementation: セーブパネル実装;

  constructor(events: ISavePanelEvents) {
    super();
    this.implementation = new セーブパネル実装(events);
    this._componentRoot = this.implementation.root;
  }
  protected _ルートを構築する(): DivC { return this.implementation.root; }
  public async 開く(): Promise<this> { await this.implementation.open(); return this; }
  public async 閉じる(): Promise<this> { await this.implementation.close(); return this; }
  public async 表示切替(): Promise<this> { await this.implementation.toggle(); return this; }
  public get isVisible(): boolean { return this.implementation.isVisible; }
  public async importLocalRepository(data: 描画キャンバスデータ): Promise<void> {
    await this.implementation.importLocal(data);
  }
}
