export interface IファイルDownloader {
    download(content: string, fileName: string, mimeType: string): void;
}

export class BrowserファイルDownloader implements IファイルDownloader {
    public download(content: string, fileName: string, mimeType: string): void {
        const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = fileName;
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        setTimeout(() => {
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);
        }, 100);
    }
}
