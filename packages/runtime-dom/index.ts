import { createRenderer, RendererElement } from "../runtime-core";
import { createAppApi, CreateAppFunction } from "../runtime-core/apiCreateApp";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

const { render } = createRenderer({ ...nodeOps, patchProp });
const _createApp = createAppApi(render);

export const createApp = ((...args) => {
  const app = _createApp(...args);

  const { mount } = app;

  app.mount = (rootContainer: string | RendererElement) => {
    const container =
      typeof rootContainer === "string"
        ? document.querySelector(rootContainer)
        : rootContainer;

    if (!container) {
      throw new Error("Container not found");
    }

    mount(container);
  };

  return app;
}) as CreateAppFunction<Element>;
