// ボードの保存・削除が成功したことを外部 (UIの再読込表示・SSE配信など) へ伝える契約 (issue #8)。
// 輸送方式 (SSE・IPC等) には依存しない。通知を取り逃してもデータはrevision照合 (issue #5) が守る。

export interface ボード変更通知 {
    readonly boardId: string;
    readonly revision: number;
    readonly 種別: '保存' | '削除';
}

export interface ボード変更通知先 {
    変更を受け取る(通知: ボード変更通知): void;
}
