export interface Options {
  render: () => string;
}

export interface App {
  mount: (selector: string) => void;
}

export function createApp(options: Options): App {
  return {
    mount: (selector) => {
      const root = document.querySelector(selector);

      if (!root) {
        throw new Error("Container not found");
      }

      root.innerHTML = options.render();
    },
  };
}
