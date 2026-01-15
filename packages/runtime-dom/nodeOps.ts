import { RerendererOptions } from "../runtime-core";

export const nodeOps: RerendererOptions = {
  setElementText(node, text) {
    node.textContent = text;
  },
};
