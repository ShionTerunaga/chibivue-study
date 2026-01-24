import { createApp, h, reactive } from "chibivue";

const app = createApp({
  setup() {
    const state = reactive({ count: 0 });

    return function render() {
      return h("div", {}, [
        h("h1", { id: "title" }, ["Hello, ChibiVue!"]),
        h(
          "button",
          {
            style: {
              color: "white",
              backgroundColor: "blue",
              padding: "10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            },
            onClick: () => {
              state.count++;
            },
          },
          [`Count: ${state.count}`],
        ),
      ]);
    };
  },
});

app.mount("#app");
