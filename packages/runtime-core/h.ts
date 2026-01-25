import { createVNode, VNode, VNodeProps } from "./vnode";

export function h(
  type: string,
  props: VNodeProps,
  children: Array<VNode | string>,
) {
  return createVNode(type, props, children);
}
