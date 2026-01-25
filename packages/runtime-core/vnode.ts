import { RendererNode } from "./renderer";

export const Text = Symbol();

export type VNodeTypes = string | typeof Text;

export interface VNode<HostNode = RendererNode> {
  type: VNodeTypes;
  props: VNodeProps;
  children: VNodeNormalizedChildren;
  el: HostNode | undefined;
}

export interface VNodeProps {
  [key: string]: any;
}

export type VNodeNormalizedChildren = string | VNodeArrayChildren;
export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>;

export type VNodeChild = VNodeChildAtom | VNodeArrayChildren;
type VNodeChildAtom = VNode | string;

export function createVNode(
  type: VNodeTypes,
  props: VNodeProps,
  children: VNodeNormalizedChildren,
): VNode {
  const vnode: VNode = { type, props, children, el: undefined };

  return vnode;
}

export function normalizeVNode(child: VNodeChild): VNode {
  if (typeof child === "object") {
    return { ...child } as VNode;
  } else {
    return createVNode(Text, {}, String(child));
  }
}
