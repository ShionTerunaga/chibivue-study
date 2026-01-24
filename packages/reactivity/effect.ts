import { createDep, Dep } from "./dep";

export let activeEffect: ReactiveEffect | undefined;

type KeyToDepMap = Map<any, Dep>;
const targetMap = new WeakMap<any, KeyToDepMap>();

export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}

  run() {
    let parent: ReactiveEffect | undefined = activeEffect;
    activeEffect = this;
    const result = this.fn();
    activeEffect = parent;
    return result;
  }
}

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
