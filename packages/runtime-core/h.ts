import { VNode, VNodeProps } from "./vcode";

export function h(
  type: string,
  props: VNodeProps,
  children: Array<VNode | string>
) {
  return {
    type,
    props,
    children,
  };
}
