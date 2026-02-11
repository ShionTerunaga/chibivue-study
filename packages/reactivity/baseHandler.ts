import { track, trigger } from "./effect";
import { reactive } from "./reactive";

/**
 * Proxy ハンドラ（ミューテーブル）
 *
 * このハンドラは「読み取り時の依存収集」と「書き込み時の再実行通知」を担う。
 * `reactive()` から生成される Proxy はここを通るため、リアクティブシステムの中核になる。
 *
 * - `get`
 *   1. `track()` で `target/key` と現在の `activeEffect` を関連付ける。
 *   2. `Reflect.get()` で実値を取得する。
 *   3. 値がオブジェクトなら `reactive()` を再帰適用して深い階層まで追跡可能にする。
 * - `set`
 *   1. 旧値を取得する。
 *   2. `Reflect.set()` で代入する。
 *   3. 値が実際に変わったときだけ `trigger()` を呼び、不要な再実行を避ける。
 */
export const mutableHandlers: ProxyHandler<object> = {
  /**
   * プロパティ取得ハンドラ
   *
   * このハンドラは、テンプレート評価や `effect.run()` 中のプロパティ参照を
   * 依存関係として記録するために必ず呼ばれる。戻り値がオブジェクトの場合は
   * その場で再帰的に Proxy 化し、`state.user.profile.name` のような
   * 深い参照でも追跡できるようにする。
   *
   * @param target 監視対象オブジェクト。
   * @param key 参照されたプロパティキー。
   * @param reveiver Proxy のレシーバ。
   * @returns 取得した値。オブジェクトなら reactive Proxy、プリミティブならその値。
   */
  get(target: object, key: string | symbol, reveiver: object) {
    track(target, key);

    const res = Reflect.get(target, key, reveiver);

    if (res !== null && typeof res === "object") {
      return reactive(res);
    }

    return res;
  },

  /**
   * プロパティ設定ハンドラ
   *
   * 値の変更を検出し、該当プロパティへ依存している副作用を再実行する入口。
   * `Object.is` ベースの比較で同値判定するため、`NaN` の扱いを含め
   * JavaScript の厳密同値に近い挙動になる。
   *
   * 実装手順:
   * 1. `target[key]` の旧値を読む。
   * 2. `Reflect.set()` で代入する。
   * 3. 旧値と新値が異なるときのみ `trigger(target, key)` を呼ぶ。
   *
   * Proxy の `set` トラップ契約に合わせ、成功時は `true` を返す。
   *
   * @param target 監視対象オブジェクト。
   * @param key 書き込み対象のプロパティキー。
   * @param value 新しい値。
   * @param receiver Proxy のレシーバ。
   * @returns 常に `true`。
   */
  set(target: object, key: string | symbol, value: unknown, receiver: object) {
    let oldValue = (target as any)[key];

    Reflect.set(target, key, value, receiver);

    if (hasChanged(value, oldValue)) {
      trigger(target, key);
    }

    return true;
  },
};

/**
 * 新旧値が同一かどうかを `Object.is` ベースで判定する。
 *
 * `===` との主な違い:
 * - `NaN` 同士を同一とみなす
 * - `+0` と `-0` を区別する
 *
 * @param value 新しい値。
 * @param oldValue 以前の値。
 * @returns 値が異なる場合は `true`。
 */
const hasChanged = (value: any, oldValue: any): boolean => {
  return !Object.is(value, oldValue);
};
