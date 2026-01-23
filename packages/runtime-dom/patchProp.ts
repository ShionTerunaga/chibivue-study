import { RerendererOptions } from "../runtime-core";
import { patchAttr } from "./module/attris";
import { patchEvent } from "./module/events";

type DOMRendererOptions = RerendererOptions<Node, Element>;

const onRE = /^on[^a-z]/;
const isOn = (key: string) => onRE.test(key);

export const patchProp: DOMRendererOptions["patchProp"] = (el, key, value) => {
  if (isOn(key)) {
    patchEvent(el, key, value);
  } else {
    patchAttr(el, key, value);
  }
};
