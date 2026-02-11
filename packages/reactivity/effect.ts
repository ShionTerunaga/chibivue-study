import { createDep, Dep } from "./dep";

/**
 * 現在実行中（トラッキング対象）の ReactiveEffect を保持するグローバル参照
 *
 * - `ReactiveEffect.run()` の呼び出し中に `activeEffect` がセットされ、
 *   `track` 側で依存登録に使用される。
 * - ネストした effect 実行時は `run()` 内で親を退避・復元するため、
 *   常に「いま登録対象の effect」を指す。
 */
export let activeEffect: ReactiveEffect | undefined;

type KeyToDepMap = Map<any, Dep>;
const targetMap = new WeakMap<any, KeyToDepMap>();

/**
 * 副作用を表すクラス
 *
 * `ReactiveEffect` は「依存収集できる関数実行コンテキスト」を表す。
 * レンダラ更新関数やユーザー定義副作用をこのクラスで包むことで、
 * 実行中のプロパティ参照が `track()` へ記録される。
 *
 * - `fn`: 実際に実行される副作用本体。
 * - `run()`: `activeEffect` をセットして `fn` を実行し、終了後に元へ戻す。
 */
export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}

  /**
   * effect を実行する
   *
   * 実行中だけ自分を `activeEffect` にすることで、`track()` 呼び出し先は
   * 「どの effect がこの key に依存したか」を正しく登録できる。
   * ネスト構造を壊さないよう、実行前の `activeEffect` を退避してから復元する。
   *
   * @returns `fn()` の返り値。
   */
  run() {
    let parent: ReactiveEffect | undefined = activeEffect;
    activeEffect = this;
    const result = this.fn();
    activeEffect = parent;
    return result;
  }
}

/**
 * プロパティ読み取り時の依存関係を登録する。
 *
 * 依存関係は次の3段階で保存される。
 * 1. `targetMap`（WeakMap）でオブジェクト単位に管理
 * 2. `depsMap`（Map）でプロパティキー単位に管理
 * 3. `dep`（Set）に `ReactiveEffect` を保持
 *
 * `activeEffect` が存在しない通常コードの読み取りでは登録しないため、
 * effect 実行中のアクセスだけが追跡対象になる。
 *
 * @param target トラッキング対象オブジェクト。
 * @param key 参照されたプロパティキー。
 * @returns なし。
 */
export function track(target: object, key: unknown) {
  let depsMap = targetMap.get(target);

  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);

  if (!dep) {
    depsMap.set(key, (dep = createDep()));
  }

  if (activeEffect) {
    dep.add(activeEffect);
  }
}

/**
 * プロパティ更新時に、依存している effect を再実行する。
 *
 * `dep` を配列化してからループしているのは、実行中に依存集合が変化しても
 * イテレーションが不安定になりにくくするため。
 * 対象キーに依存が無い場合は何もせず終了する。
 *
 * @param target 変更が起きたオブジェクト。
 * @param key 変更されたプロパティキー。
 * @returns なし。
 */
export function trigger(target: object, key: unknown) {
  const depsMap = targetMap.get(target);

  if (!depsMap) {
    return;
  }

  const dep = depsMap.get(key);
  if (dep) {
    const effects = [...dep];

    for (const effect of effects) {
      effect.run();
    }
  }
}
