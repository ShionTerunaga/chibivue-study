import { RendererNode } from "./renderer";

/**
 * テキストノード識別用のシンボル
 */
export const Text = Symbol();

export type VNodeTypes = string | typeof Text;

/**
 * 仮想ノード（VNode）の型定義
 *
 * - `type`: 要素タイプ（タグ名または `Text`）
 * - `props`: 属性/プロパティオブジェクト
 * - `children`: 正規化された子ノード（文字列または配列）
 * - `el`: マウント後のホスト要素参照
 */
export interface VNode<HostNode = RendererNode> {
  type: VNodeTypes;
  props: VNodeProps;
  children: VNodeNormalizedChildren;
  el: HostNode | undefined;
}

export interface VNodeProps {
  [key: string]: any;
}

export type VNodeNormalizedChildren = string | VNodeArrayChildren;
export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>;

export type VNodeChild = VNodeChildAtom | VNodeArrayChildren;
type VNodeChildAtom = VNode | string;

/**
 * VNode を作成するファクトリ
 *
 * 単純なオブジェクトを構築し、`el` は未設定で返す（マウント時に設定される）。
 *
 * @param type ノード種別（タグ名または `Text`）。
 * @param props 属性/プロパティ。
 * @param children 正規化済み子ノード。
 * @returns 新しい VNode。
 */
export function createVNode(
  type: VNodeTypes,
  props: VNodeProps,
  children: VNodeNormalizedChildren,
): VNode {
  const vnode: VNode = { type, props, children, el: undefined };

  return vnode;
}

/**
 * 子ノードを正規化して VNode を返す
 *
 * - 引数がオブジェクト（既に VNode である想定）ならそのコピーを返す。
 * - 文字列の場合は `Text` ノードに包んで VNode を生成する。
 *
 * @param child VNode または文字列の子ノード。
 * @returns 正規化された VNode。
 */
export function normalizeVNode(child: VNodeChild): VNode {
  if (typeof child === "object") {
    return { ...child } as VNode;
  } else {
    return createVNode(Text, {}, String(child));
  }
}
