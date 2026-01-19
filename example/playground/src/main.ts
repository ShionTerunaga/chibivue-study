import { createApp, h } from "chibivue";

const app = createApp({
  render() {
    return h("h1", {}, ["Hello, ChibiVue!"]);
  },
});

app.mount("#app");
