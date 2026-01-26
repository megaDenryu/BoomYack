import { ButtonC, DivC, HtmlComponentBase, LV2HtmlComponentBase, MousePosition, Px長さ } from "SengenUI/index";




import { 円状メニューコンテナ, 円状メニューアイテム, 円状メニュー中央エリア, fadeInKeyframes, fadeOutKeyframes, 円状メニューアニメーション時間 } from "../style.css";


import { Action, AsyncAction } from "TypeScriptBenriKakuchou/アーキテクチャBase";

export interface 円状メニューアイテムオプション {
    label?: string;
    iconUrl?: string;
    backgroundColor?: string;
    borderColor?: string;
    onClick: (e: MouseEvent) => void;
}

export interface Iコンテキストメニュー {
    表示(pos:MousePosition): Promise<this>;
    非表示(閉じ時間?: number): Promise<this>;
    表示トグル(pos:MousePosition): Promise<this>;
    isVisible: boolean;
    delete(): void;
}

export class 円状コンテキストメニュー extends LV2HtmlComponentBase implements Iコンテキストメニュー {
    protected _componentRoot: DivC;
    private _items: 円状メニューアイテムボタン[] = [];
    private _isVisible: boolean = false;
    private _radius: Px長さ = new Px長さ(80);
    public 他のコンテキストメニューを全て非表示にする?: AsyncAction;
    public onDestroy?: Action;

    constructor(items: 円状メニューアイテムオプション[]) {
        super();
        this._componentRoot = this.createComponentRoot(items);
    }

    protected createComponentRoot(items: 円状メニューアイテムオプション[]): DivC {
        return new DivC({ class: 円状メニューコンテナ })
                    .setStyleCSS({ display: 'none' })
                    .childs([
                        new DivC({ class: 円状メニュー中央エリア }),
                        ...this.createCircularItems(items)
                    ]);
    }

    private *createCircularItems(items: 円状メニューアイテムオプション[]): Iterable<円状メニューアイテムボタン> {
        const itemCount = items.length;
        for (let i = 0; i < itemCount; i++) {
            const angle = (i / itemCount) * Math.PI * 2 - Math.PI / 2; // 上から開始
            const offsetX: Px長さ = new Px長さ(Math.cos(angle) * this._radius.値);
            const offsetY: Px長さ = new Px長さ(Math.sin(angle) * this._radius.値);
            
            const item = new 円状メニューアイテムボタン(items[i])
                            .setStyleCSS({
                                left: `calc(50% + ${offsetX.toCssValue()})`,
                                top: `calc(50% + ${offsetY.toCssValue()})`
                            });
            this._items.push(item);
            yield item;
        }
    }

    public async 表示(pos:MousePosition): Promise<this> {
        if (this.他のコンテキストメニューを全て非表示にする == undefined) {
            await this.非表示(10);
        } else {
            await this.他のコンテキストメニューを全て非表示にする();
        }
        this._isVisible = true;
        this._componentRoot
            .setStyleCSS({
                display: 'block',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                opacity: '1',
                animation: `${fadeInKeyframes} ${円状メニューアニメーション時間}ms ease-out forwards`
            });
        return this;
    }

    public async 非表示(閉じ時間: number = 円状メニューアニメーション時間): Promise<this> {
        if (!this._isVisible) {return this;}
        this._isVisible = false;
        this._componentRoot
            .setStyleCSS({
                animation: `${fadeOutKeyframes} ${閉じ時間}ms ease-in forwards`
            });
        // アニメーション終了まで待機してからdisplay:noneにする
        await new Promise<void>(resolve => {
            setTimeout(() => {
                if (!this._isVisible) {
                    this._componentRoot.setStyleCSS({ display: 'none' });
                }
                resolve();
            }, 閉じ時間);
        });
        return this;
    }

    public async 表示トグル(pos: MousePosition): Promise<this> {
        if (this._isVisible) {
            return await this.非表示();
        } else {
            return await this.表示(pos);
        }
    }

    public get isVisible(): boolean {
        return this._isVisible;
    }

    public delete(): void {
        super.delete();
        this.onDestroy?.();
    }
}

export class 円状メニューアイテムボタン extends LV2HtmlComponentBase {
    protected _componentRoot: ButtonC;
    private _option: 円状メニューアイテムオプション;

    constructor(option: 円状メニューアイテムオプション) {
        super();
        this._option = option;
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): ButtonC {
        const btn = new ButtonC({ text: this._option.label ?? "", class: 円状メニューアイテム })
                    .addTypedEventListener("click", (e: MouseEvent) => { 
                        e.preventDefault();
                        e.stopPropagation();
                        this._option.onClick(e);
                     });
        
        // SVGアイコンが指定されている場合は背景画像として設定
        if (this._option.iconUrl) {
            btn.setStyleCSS({
                backgroundImage: `url("${this._option.iconUrl}")`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                fontSize: '0' // テキストを非表示
            });
        }
        
        // 背景色と縁色が指定されている場合は適用
        if (this._option.backgroundColor || this._option.borderColor) {
            const styleObj: Record<string, string> = {};
            if (this._option.backgroundColor) {
                styleObj.backgroundColor = this._option.backgroundColor;
            }
            if (this._option.borderColor) {
                styleObj.borderColor = this._option.borderColor;
            }
            btn.setStyleCSS(styleObj);
        }
        
        return btn;
    }
}
