export interface IClipboardCopier {
    copy(text: string): Promise<void>;
    read(): Promise<string>;
}
