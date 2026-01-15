export interface RerendererOptions<HostNode = RenderNode> {
  setElementText(node: HostNode, text: string): void;
}

export interface RenderNode {
  [key: string]: any;
}

export interface RendererElement extends RenderNode {}

export type RootRenderFunction<HostElement = RendererElement> = (
  message: string,
  container: HostElement
) => void;

export function createRenderer(options: RendererElement) {
  const { setElementText: hostSetElementText } = options;

  const render: RootRenderFunction = (message, container) => {
    hostSetElementText(container, message);
  };

  return {
    render,
  };
}
