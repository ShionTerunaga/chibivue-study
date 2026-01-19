import { Component } from "./component";
import { RootRenderFunction } from "./renderer";

export interface App<HostElement = any> {
  mount: (rootContainer: HostElement | string) => void;
}

export type CreateAppFunction<HostElement = any> = (
  rootComponent: Component
) => App<HostElement>;

export function createAppApi<HostElement>(
  render: RootRenderFunction<HostElement>
): CreateAppFunction<HostElement> {
  return function createApp(rootComponent) {
    const app: App = {
      mount(rootContainer: HostElement) {
        if (!rootComponent.render) {
          throw new Error("Render function is not defined");
        }

        const vnode = rootComponent.render();

        render(vnode, rootContainer);
      },
    };

    return app;
  };
}
