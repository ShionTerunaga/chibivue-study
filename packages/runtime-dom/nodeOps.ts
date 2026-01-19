import { text } from "stream/consumers";
import { RerendererOptions } from "../runtime-core";

export const nodeOps: RerendererOptions = {
  createElement: (tagName) => {
    return document.createElement(tagName);
  },

  createText: (text: string) => {
    return document.createTextNode(text);
  },

  setElementText(node, text) {
    node.textContent = text;
  },

  insert(child, parent, anchor) {
    parent.insertBefore(child, anchor || null);
  },
};
