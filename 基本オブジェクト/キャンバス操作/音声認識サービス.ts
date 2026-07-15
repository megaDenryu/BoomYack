import { CanvasGraphModel } from "../描画キャンバス/描画キャンバスView分解/CanvasGraphModel";
import { 配置物選択機能集約 } from "./配置物選択管理";
import { 付箋枠 } from "../配置物/付箋2/付箋枠";

/**
 * マイク音声認識を管理し、選択中の付箋にテキストを直書きするサービス。
 * ブラウザの Web Speech API (webkitSpeechRecognition) を利用。
 */
export class VoiceRecognitionService {
    private selectionManager: 配置物選択機能集約;
    private recognition: any | null = null;
    private isRecording: boolean = false;
    private isUserStopped: boolean = false;
    private _onStateChangeCallbacks: ((isRecording: boolean) => void)[] = [];

    constructor(selectionManager: 配置物選択機能集約) {
        this.selectionManager = selectionManager;
        this.initRecognition();
    }

    private initRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            console.warn("このブラウザはWeb Speech APIをサポートしていません。");
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'ja-JP';

        this.recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                this.writeToSelectedStickyNotes(finalTranscript);
            }
        };

        this.recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
        };

        this.recognition.onend = () => {
            if (this.isRecording && !this.isUserStopped) {
                // 自動で再開（無限ループ処理）
                try {
                    this.recognition.start();
                } catch (e) {
                    console.error("Recognition restart failed", e);
                }
            } else {
                this.isRecording = false;
                this.notifyStateChange();
            }
        };
    }

    public toggleRecording() {
        if (!this.recognition) return;

        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    public startRecording() {
        if (!this.recognition || this.isRecording) return;
        this.isRecording = true;
        this.isUserStopped = false;
        try {
            this.recognition.start();
        } catch (e) {
            console.warn("Speech recognition is already started.");
        }
        this.notifyStateChange();
    }

    public stopRecording() {
        if (!this.recognition || !this.isRecording) return;
        this.isRecording = false;
        this.isUserStopped = true;
        this.recognition.stop();
        this.notifyStateChange();
    }

    public getIsRecording(): boolean {
        return this.isRecording;
    }

    public onStateChange(callback: (isRecording: boolean) => void) {
        this._onStateChangeCallbacks.push(callback);
    }

    private notifyStateChange() {
        for (const callback of this._onStateChangeCallbacks) {
            callback(this.isRecording);
        }
    }

    private writeToSelectedStickyNotes(text: string) {
        const selectedItems = this.selectionManager.選択中配置物;
        for (const item of selectedItems) {
            if (item.type === "自動リサイズ付箋" || item.type === "付箋") {
                const view = item.view as unknown as 付箋枠<any>;
                if (view && typeof view.text === 'string' && typeof view.setText === 'function') {
                    // 現在のテキストの末尾に追記
                    const currentText = view.text;
                    const newText = currentText ? currentText + "\n" + text : text;
                    view.setText(newText);
                }
            }
        }
    }
}
