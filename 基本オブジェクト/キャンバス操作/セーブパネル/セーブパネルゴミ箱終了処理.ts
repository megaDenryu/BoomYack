import { グローバルイベントを購読する } from "../../グローバルイベント購読";
import { SaveMode } from "./セーブパネル型定義";

export const ゴミ箱終了処理を登録する = (empty: () => void): void => {
  グローバルイベントを購読する(window, "beforeunload", empty);
  グローバルイベントを購読する(document, "visibilitychange", () => {
    if (document.visibilityState === "hidden") empty();
  });
};

export const ゴミ箱を同期削除する = (items: Iterable<[string, { mode: SaveMode }]>): void => {
  for (const [id, { mode }] of items) {
    try {
      if (mode === "local") localStorage.removeItem(`canvas_data_${id}`);
      else navigator.sendBeacon("/canvas/delete", JSON.stringify({ canvasId: id }));
    } catch (error) {
      console.error(`削除エラー [${id}]:`, error);
    }
  }
};
