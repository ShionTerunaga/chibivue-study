export interface VNode {
  type: string;
  proops: VNodeProps;
  children: Array<VNode | string>;
}

export interface VNodeProps {
  [key: string]: any;
}
