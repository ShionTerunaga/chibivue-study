import { ReactiveEffect } from "../reactivity/effect";
import { Component } from "./component";
import { RootRenderFunction } from "./renderer";

export interface App<HostElement = any> {
  mount: (rootContainer: HostElement | string) => void;
}

export type CreateAppFunction<HostElement = any> = (
  rootComponent: Component,
) => App<HostElement>;

export function createAppApi<HostElement>(
  render: RootRenderFunction<HostElement>,
): CreateAppFunction<HostElement> {
  return function createApp(rootComponent) {
    const app: App = {
      mount(rootContainer: HostElement) {
        if (!rootComponent.setup) {
          throw new Error("Render function is not defined");
        }

        const componentRender = rootComponent.setup();

        const updateComponent = () => {
          const vnode = componentRender();
          render(vnode, rootContainer);
        };

        const effect = new ReactiveEffect(updateComponent);

        effect.run();
      },
    };

    return app;
  };
}
