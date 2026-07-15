import { IClipboardCopier } from "./ClipboardCopier";

export class BrowserClipboardCopier implements IClipboardCopier {
    public async copy(text: string): Promise<void> {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }
        this.copyWithTemporaryTextArea(text);
    }

    public async read(): Promise<string> {
        if (navigator.clipboard?.readText) return navigator.clipboard.readText();
        throw new Error("Clipboard reading is not supported (requires secure context and user permission).");
    }

    private copyWithTemporaryTextArea(text: string): void {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        Object.assign(textArea.style, { position: "fixed", left: "-9999px", top: "0" });
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            if (!document.execCommand("copy")) throw new Error("execCommand('copy') failed");
        } finally {
            document.body.removeChild(textArea);
        }
    }
}
