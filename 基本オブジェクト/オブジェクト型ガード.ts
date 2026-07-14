/**
 * unknown値をRecord<string, unknown>として扱えるかを判定する型ガード。
 * JSON由来の未検証データからフィールドを読み出す前段の絞り込みに使う。
 */
export function レコードとして扱えるか(値: unknown): 値 is Record<string, unknown> {
    return typeof 値 === 'object' && 値 !== null;
}
