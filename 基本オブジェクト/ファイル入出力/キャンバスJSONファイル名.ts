export const キャンバスJSONファイル名を作る = (canvasName: string, date: Date): string => {
    const safeName = canvasName
        .replace(/[<>:"/\\|?*]/g, "_")
        .replace(/\s+/g, "_")
        .slice(0, 50);
    return `canvas_${safeName}_${タイムスタンプ(date)}.json`;
};

const タイムスタンプ = (date: Date): string => {
    const parts = [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
    ].map((part, index) => index === 0 ? String(part) : String(part).padStart(2, "0"));
    return `${parts[0]}${parts[1]}${parts[2]}_${parts[3]}${parts[4]}${parts[5]}`;
};
