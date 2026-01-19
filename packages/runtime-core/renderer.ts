import { VNode } from "./vcode";

export interface RerendererOptions<HostNode = RenderNode> {
  createElement: (type: string) => HostNode;

  createText: (text: string) => HostNode;

  setElementText(node: HostNode, text: string): void;

  insert(child: HostNode, parent: HostNode, anchor?: HostNode): void;
}

export interface RenderNode {
  [key: string]: any;
}

export interface RendererElement extends RenderNode {}

export type RootRenderFunction<HostElement = RendererElement> = (
  message: string,
  container: HostElement
) => void;

export function createRenderer(options: RerendererOptions) {
  const {
    createElement: hostCreateElement,
    createText: hostCreateText,
    insert: hostInsert,
  } = options;

  function renderVNode(vnode: VNode | string) {
    if (typeof vnode === "string") {
      return hostCreateText(vnode);
    }
    const el = hostCreateElement(vnode.type);

    for (const child of vnode.children) {
      const childEl = renderVNode(child);
      hostInsert(childEl, el);
    }

    return el;
  }

  const render: RootRenderFunction = (vnode, container) => {
    const el = renderVNode(vnode);

    hostInsert(el, container);
  };

  return {
    render,
  };
}
