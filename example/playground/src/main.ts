import { createApp, h } from "chibivue";

const app = createApp({
  render() {
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
            alert("Button clicked!");
          },
        },
        ["Click Me"],
      ),
    ]);
  },
});

app.mount("#app");
