import { 配置物選択機能集約 } from "./配置物選択管理";
import { 自動リサイズ付箋View } from "../配置物/付箋2/自動リサイズ付箋View";

export const 確定音声テキスト = (event: any): string => {
    let transcript = "";
    for (let index = event.resultIndex; index < event.results.length; index++) {
        if (event.results[index].isFinal) transcript += event.results[index][0].transcript;
    }
    return transcript;
};

export const 選択中付箋へ追記する = (
    selectionManager: 配置物選択機能集約,
    text: string
): void => {
    for (const item of selectionManager.選択中配置物) {
        if (item.type !== "自動リサイズ付箋" && item.type !== "付箋") continue;
        const view = item.view as unknown as 自動リサイズ付箋View<any>;
        if (!view || typeof view.text !== "string" || typeof view.setText !== "function") continue;
        view.setText(view.text ? `${view.text}\n${text}` : text);
    }
};
