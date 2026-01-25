import { ReactiveEffect } from "../reactivity/effect";
import { Component } from "./component";
import { Text, normalizeVNode, VNode } from "./vnode";

export interface RerendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement,
> {
  createElement: (type: string) => HostNode;

  createText: (text: string) => HostNode;

  setElementText(node: HostNode, text: string): void;

  insert(child: HostNode, parent: HostNode, anchor?: HostNode): void;

  patchProp(el: HostElement, key: string, value: any): void;

  setText(node: HostNode, text: string): void;
}

export interface RendererNode {
  [key: string]: any;
}

export interface RendererElement extends RendererNode {}
export type RootRenderFunction<HostElement = RendererElement> = (
  vnode: Component,
  container: HostElement,
) => void;

export function createRenderer(options: RerendererOptions) {
  const {
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    insert: hostInsert,
    setText: hostSetText,
  } = options;

  //function renderVNode(vnode: VNode | string) {
  //  if (typeof vnode === "string") {
  //    return hostCreateText(vnode);
  //  }
  //  const el = hostCreateElement(vnode.type);
  //
  //  for (const child of vnode.children as Array<VNode>) {
  //    const childEl = renderVNode(child);
  //    hostInsert(childEl, el);
  //  }
  //
  //  Object.entries(vnode.props).forEach(([Key, value]) => {
  //    hostPatchProp(el, Key, value);
  //  });
  //
  //  return el;
  //}

  const render: RootRenderFunction = (rootComponent, container) => {
    const componentRender = rootComponent.setup!();

    let n1: VNode | null = null;

    const updateComponent = () => {
      const n2 = componentRender();
      patch(n1, n2, container);
      n1 = n2;
    };

    const effect = new ReactiveEffect(updateComponent);

    effect.run();
  };

  const patch = (n1: VNode | null, n2: VNode, container: RendererElement) => {
    const { type } = n2;

    if (type === Text) {
      processText(n1, n2, container);
    } else {
      processElement(n1, n2, container);
    }
  };

  const processElement = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
  ) => {
    if (n1 == null) {
      mountElement(n2, container);
    } else {
      patchElement(n1, n2);
    }
  };

  const processText = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
  ) => {
    if (n1 == null) {
      hostInsert((n2.el = hostCreateText(n2.children as string)), container);
    } else {
      const el = (n2.el = n1.el!);
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children as string);
      }
    }
  };

  const patchElement = (n1: VNode, n2: VNode) => {
    const el = (n2.el = n1.el!);

    const props = n2.props;

    patchChildren(n1, n2, el);

    for (const key in props) {
      if (props[key] !== n1.props?.[key]) {
        hostPatchProp(el, key, props[key]);
      }
    }
  };

  const patchChildren = (n1: VNode, n2: VNode, container: RendererElement) => {
    const c1 = n1.children as Array<VNode>;
    const c2 = n2.children as Array<VNode>;

    for (let i = 0; i < c2.length; i++) {
      const child = (c2[i] = normalizeVNode(c2[i]));
      patch(c1[i] || null, child, container);
    }
  };

  const mountElement = (vnode: VNode, container: RendererElement) => {
    let el: RendererElement;

    const { type, props } = vnode;
    el = vnode.el = hostCreateElement(type as string);

    //mountchildren
    mountChildren(vnode.children as Array<VNode>, el);

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, props[key]);
      }
    }

    hostInsert(el, container);
  };

  const mountChildren = (
    children: Array<VNode>,
    container: RendererElement,
  ) => {
    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVNode(children[i]));
      patch(null, child, container);
    }
  };

  return {
    render,
  };
}
