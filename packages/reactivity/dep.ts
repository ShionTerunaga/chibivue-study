import { ReactiveEffect } from "./effect";

export type Dep = Set<ReactiveEffect>;

export const createDep = (effects?: Array<ReactiveEffect>) => {
  const dep = new Set<ReactiveEffect>();
  return dep;
};
