export interface VNode {
  type: string;
  props: VNodeProps;
  children: Array<VNode | string>;
}

export interface VNodeProps {
  [key: string]: any;
}
