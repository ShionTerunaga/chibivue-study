import { RerendererOptions } from "../runtime-core";

/**
 * ブラウザ DOM 向けホスト操作をまとめたオブジェクト
 *
 * - `createElement`, `createText`, `insert` などは `createRenderer` に渡され、
 *   プラットフォームに依存した DOM 操作を抽象化する。
 * - runtime-core はこれらの抽象 API のみを利用するため、同じ差分アルゴリズムを
 *   別ホスト（例: Canvas/Native）へ再利用しやすい構成になる。
 */
export const nodeOps: Omit<RerendererOptions, "patchProp"> = {
  /**
   * 要素ノードを作成する
   *
   * - `tagName` を元に `document.createElement` を呼び出す。
   * - この段階では DOM ツリーに未挿入の detached node を返す。
   *
   * @param tagName 生成するタグ名。
   * @returns 生成された要素ノード。
   */
  createElement: (tagName) => {
    return document.createElement(tagName);
  },

  /**
   * テキストノードを作成する
   *
   * @param text ノードへ設定する文字列。
   * @returns 生成されたテキストノード。
   */
  createText: (text: string) => {
    return document.createTextNode(text);
  },

  /**
   * 要素のテキストコンテンツを設定する
   *
   * @param node 対象ノード。
   * @param text 設定する文字列。
   * @returns なし。
   */
  setElementText(node, text) {
    node.textContent = text;
  },

  /**
   * 子ノードを親ノードへ挿入する（アンカーがあればその前に挿入）
   *
   * @param child 挿入する子ノード。
   * @param parent 挿入先の親ノード。
   * @param anchor 挿入位置の基準ノード。未指定時は末尾。
   * @returns なし。
  */
  insert(child, parent, anchor) {
    parent.insertBefore(child, anchor || null);
  },

  /**
   * テキストノードの内容を設定する（`Node.nodeValue`）
   *
   * @param node 対象テキストノード。
   * @param text 設定する文字列。
   * @returns なし。
   */
  setText: (node, text) => {
    node.nodeValue = text;
  },
};
