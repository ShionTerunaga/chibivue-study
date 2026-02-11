import { ReactiveEffect } from "./effect";

/**
 * 副作用の集合を表す型
 *
 * - `Dep` はあるプロパティに依存している `ReactiveEffect` の集合を保持する `Set`。
 */
export type Dep = Set<ReactiveEffect>;

/**
 * `Dep` を生成するユーティリティ
 *
 * 将来的に初期 effect リストを受け取る余地を残しつつ、現在は空集合を返す。
 * Set を使うことで、同一 effect の重複登録を自動で防げる。
 *
 * @param effects 予約引数。現状ロジックでは未使用。
 * @returns 新規の `Dep`（`Set<ReactiveEffect>`）。
 */
export const createDep = (effects?: Array<ReactiveEffect>) => {
  const dep = new Set<ReactiveEffect>();
  return dep;
};
