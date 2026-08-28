import { 配置物選択機能集約 } from "./配置物選択管理";
import { 確定音声テキスト, 選択中付箋へ追記する } from "./音声認識処理";

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
            const finalTranscript = 確定音声テキスト(event);
            if (finalTranscript) 選択中付箋へ追記する(this.selectionManager, finalTranscript);
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

}
