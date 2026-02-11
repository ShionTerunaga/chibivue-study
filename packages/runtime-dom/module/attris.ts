/**
 * 要素の属性を差し替えるユーティリティ
 *
 * - `rawName` を小文字化して属性名として扱う（HTML 属性は小文字に正規化）。
 * - `value` が `null`/`undefined` の場合は属性を削除し、それ以外は `parseObject` で
 *   文字列化して `setAttribute` する。
 * - 現実装は DOM property ではなく属性 (`setAttribute`) として扱う。
 *   そのため `value` は最終的に文字列へ正規化される。
 *
 * @param el 反映対象要素。
 * @param rawName 属性名（大文字小文字混在可）。
 * @param value 設定する値。`null`/`undefined` なら削除。
 * @returns なし。
 */
export function patchAttr(el: Element, rawName: string, value: unknown) {
  const name = rawName.toLowerCase();

  if (value == null) {
    el.removeAttribute(name);
  } else {
    const parsedValue = parseObject(value);
    el.setAttribute(name, parsedValue);
  }
}

/**
 * 属性値を文字列にパースするユーティリティ
 *
 * - 文字列ならそのまま返す。
 * - プリミティブ値は `String()` で文字列化する。
 * - オブジェクトの場合は `key:val; ` の形式で連結して返す（スタイル文字列のような用途を想定）。
 *
 * 例:
 * - `{ backgroundColor: "red", fontSize: "12px" }`
 *   -> `"background-color:red; font-size:12px; "`
 *
 * @param value 属性に設定したい値。
 * @returns 属性へ渡せる文字列。
 */
function parseObject(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  let response: string = "";

  if (value === undefined) {
    return response;
  }

  if (typeof value !== "object") {
    return String(value);
  }

  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    console.log("key,val", key, val);

    const newKey = camelToKebab(key);

    response += `${newKey}:${val}; `;
  }

  return response;
}

/**
 * キャメルケースをケバブケースに変換するユーティリティ
 *
 * - CSS プロパティ名や data 属性の変換に利用可能
 *
 * @param str 変換対象文字列。
 * @returns ケバブケース文字列。
 */
export function camelToKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}
