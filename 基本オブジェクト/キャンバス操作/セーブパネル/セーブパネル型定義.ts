import { キャンバスメタデータ, 描画キャンバスデータ } from "../../描画キャンバス/データクラス";

/** 保存モード */
export type SaveMode = "local" | "server";

/** パネルのタブ */
export type SavePanelTab = "save" | "load";

/** セーブパネルイベント */
export interface ISavePanelEvents {
    /** 
     * セーブ時のコールバック
     * @param name ユーザーが入力した保存名
     * @param mode 保存先（ローカル/サーバー）
     */
    onSave: (name: string, mode: SaveMode) => Promise<void>;
    /** 
     * ロード時のコールバック
     * @param id 読み込むキャンバスのID
     * @param mode 読み込み元（ローカル/サーバー）
     */
    onLoad: (id: string, mode: SaveMode) => Promise<void>;
    /** 
     * 削除時のコールバック
     * @param id 削除するキャンバスのID
     * @param mode 削除先（ローカル/サーバー）
     */
    onDelete: (id: string, mode: SaveMode) => Promise<void>;
    /** 
     * 一覧取得時のコールバック
     * @param mode 取得元（ローカル/サーバー）
     * @returns キャンバスのメタデータ一覧
     */
    onRefreshList: (mode: SaveMode) => Promise<キャンバスメタデータ[]>;
    /**
     * 現在のキャンバスデータを取得するコールバック
     * @returns 現在編集中の描画キャンバスデータ
     */
    onGetCurrentCanvasData: () => 描画キャンバスデータ;
    /**
     * 保存済みキャンバスデータをIDで取得するコールバック
     * @param id 取得するキャンバスのID
     * @param mode 取得元（ローカル/サーバー）
     * @returns 保存済みの描画キャンバスデータ（存在しない場合はnull）
     */
    onGetCanvasDataById: (id: string, mode: SaveMode) => Promise<描画キャンバスデータ | null>;
    /**
     * 外部から取得したキャンバスデータを現在のキャンバスにセットするコールバック
     * @param canvasData セットする描画キャンバスデータ
     */
    onSaveCanvasData: (canvasData: 描画キャンバスデータ) => Promise<void>;
}
