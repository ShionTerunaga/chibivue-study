import { mutableHandlers } from "./baseHandler";

/**
 * 渡されたオブジェクトを `Proxy` でラップし、リアクティブ化する。
 *
 * 生成された Proxy は `mutableHandlers` を通じて:
 * - 読み取り時に `track()` で依存を収集
 * - 書き込み時に `trigger()` で依存 effect を再実行
 * を行う。
 *
 * 現在は同一オブジェクトに対する Proxy キャッシュを持たないため、
 * 同じ `target` に複数回 `reactive()` を呼ぶと別 Proxy が生成される。
 *
 * @param target リアクティブ化対象のオブジェクト。
 * @returns `target` をラップした Proxy。
 */
export function reactive<T extends object>(target: T): T {
  const proxy = new Proxy(target, mutableHandlers);

  return proxy as T;
}
