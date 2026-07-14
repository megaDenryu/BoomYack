/**
 * document/windowへのイベント購読を集約するユーティリティ。
 *
 * 注意: グローバルイベント(document/window上のイベント)はSengenUIの
 * コンポーネント抽象(要素単位のイベントバインディング)の対象外であり、
 * SengenUI本体を拡張せずBoomYack側でこのユーティリティを持つ。
 * addEventListenerへ渡す引数(種類・ハンドラ・オプション)はそのまま
 * 委譲するのみで、購読側の挙動には一切手を加えない。
 */

export interface グローバルイベント購読ハンドル {
    解除する(): void;
}

export function グローバルイベントを購読する<K extends keyof DocumentEventMap>(
    対象: Document,
    種類: K,
    ハンドラ: (event: DocumentEventMap[K]) => void,
    オプション?: boolean | AddEventListenerOptions
): グローバルイベント購読ハンドル;
export function グローバルイベントを購読する<K extends keyof WindowEventMap>(
    対象: Window,
    種類: K,
    ハンドラ: (event: WindowEventMap[K]) => void,
    オプション?: boolean | AddEventListenerOptions
): グローバルイベント購読ハンドル;
export function グローバルイベントを購読する(
    対象: Document | Window,
    種類: string,
    ハンドラ: EventListener,
    オプション?: boolean | AddEventListenerOptions
): グローバルイベント購読ハンドル {
    対象.addEventListener(種類, ハンドラ, オプション);
    return {
        解除する(): void {
            対象.removeEventListener(種類, ハンドラ, オプション);
        }
    };
}
