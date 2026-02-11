import { createVNode, VNode, VNodeProps } from "./vnode";

/**
 * 仮想ノード（VNode）を作成するヘルパ
 *
 * 単に `createVNode` を呼び出して VNode を構築する小さなラッパー関数。
 *
 * @param type 要素タグ名。
 * @param props 属性/プロパティオブジェクト。
 * @param children 子ノード配列。
 * @returns 生成された VNode。
 */
export function h(
  type: string,
  props: VNodeProps,
  children: Array<VNode | string>,
) {
  return createVNode(type, props, children);
}
