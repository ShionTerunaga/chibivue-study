import { ReactiveEffect } from "../reactivity/effect";
import { Component } from "./component";
import { Text, normalizeVNode, VNode } from "./vnode";

export interface RerendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement,
> {
  createElement: (type: string) => HostNode;

  createText: (text: string) => HostNode;

  setElementText(node: HostNode, text: string): void;

  insert(child: HostNode, parent: HostNode, anchor?: HostNode): void;

  patchProp(el: HostElement, key: string, value: any): void;

  setText(node: HostNode, text: string): void;
}

export interface RendererNode {
  [key: string]: any;
}

export interface RendererElement extends RendererNode {}
export type RootRenderFunction<HostElement = RendererElement> = (
  vnode: Component,
  container: HostElement,
) => void;

/**
 * ホスト環境依存 API を受け取り、汎用レンダラを生成する。
 *
 * この関数はプラットフォーム非依存の差分アルゴリズムと、DOM などの
 * プラットフォーム依存 API を結合するファクトリ。
 * `options` には「ノード作成」「挿入」「テキスト更新」「prop 反映」を渡し、
 * 返却された `render()` が実際のマウントと更新サイクルを開始する。
 *
 * @param options ホスト操作実装。DOM 版なら `nodeOps + patchProp` が渡される。
 * @returns `render` を公開するレンダラインスタンス。
 */
export function createRenderer(options: RerendererOptions) {
  const {
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    insert: hostInsert,
    setText: hostSetText,
  } = options;

  //function renderVNode(vnode: VNode | string) {
  //  if (typeof vnode === "string") {
  //    return hostCreateText(vnode);
  //  }
  //  const el = hostCreateElement(vnode.type);
  //
  //  for (const child of vnode.children as Array<VNode>) {
  //    const childEl = renderVNode(child);
  //    hostInsert(childEl, el);
  //  }
  //
  //  Object.entries(vnode.props).forEach(([Key, value]) => {
  //    hostPatchProp(el, Key, value);
  //  });
  //
  //  return el;
  //}

  /**
   * ルートコンポーネントをコンテナへマウントし、リアクティブ更新を開始する。
   *
   * 実行フロー:
   * 1. `rootComponent.setup()` からレンダー関数を取得する。
   * 2. 前回 VNode (`n1`) を保持するクロージャを作る。
   * 3. `ReactiveEffect` で更新関数をラップし、初回 `run()` を実行する。
   * 4. 以降は依存値変更時に同じ更新関数が再実行され、`patch()` が差分適用する。
   *
   * @param rootComponent マウント対象のルートコンポーネント。
   * @param container 描画先ホスト要素。
   * @returns なし。
   */
  const render: RootRenderFunction = (rootComponent, container) => {
    const componentRender = rootComponent.setup!();

    let n1: VNode | null = null;

    /**
     * 1 回分のコンポーネント更新を実行する。
     *
     * 毎回新しい VNode ツリーを生成し、直前ツリー (`n1`) と比較して
     * 必要最小限の変更だけをホストへ反映する。
     *
     * @returns なし。
     */
    const updateComponent = () => {
      const n2 = componentRender();
      patch(n1, n2, container);
      n1 = n2;
    };

    const effect = new ReactiveEffect(updateComponent);

    effect.run();
  };

  /**
   * 旧 VNode と新 VNode を比較し、ノード種別に応じた差分処理へ振り分ける。
   *
   * 現在は `Text` と `Element` の2種を扱う。将来的に Fragment や
   * Component VNode を拡張する場合はここが分岐の起点になる。
   *
   * @param n1 旧 VNode。初回マウント時は `null`。
   * @param n2 新 VNode。
   * @param container 現在の描画先コンテナ。
   * @returns なし。
   */
  const patch = (n1: VNode | null, n2: VNode, container: RendererElement) => {
    const { type } = n2;

    if (type === Text) {
      processText(n1, n2, container);
    } else {
      processElement(n1, n2, container);
    }
  };

  /**
   * 要素ノードを新規マウントまたは更新する。
   *
   * `n1` の有無だけで初回マウントか更新かを判定する単純な制御関数。
   * 実際のロジックは `mountElement()` / `patchElement()` に委譲する。
   *
   * @param n1 旧要素 VNode。初回は `null`。
   * @param n2 新要素 VNode。
   * @param container 描画先コンテナ。
   * @returns なし。
   */
  const processElement = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
  ) => {
    if (n1 == null) {
      mountElement(n2, container);
    } else {
      patchElement(n1, n2);
    }
  };

  /**
   * テキストノードを新規作成または文字列差分で更新する。
   *
   * 初回は `hostCreateText()` でノードを作成して挿入し、更新時は
   * 文字列が変わったときのみ `hostSetText()` を呼ぶ。
   * `n2.el` へ実ノード参照を保持することで次回更新時に再利用する。
   *
   * @param n1 旧テキスト VNode。初回は `null`。
   * @param n2 新テキスト VNode。
   * @param container 描画先コンテナ。
   * @returns なし。
   */
  const processText = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
  ) => {
    if (n1 == null) {
      hostInsert((n2.el = hostCreateText(n2.children as string)), container);
    } else {
      const el = (n2.el = n1.el!);
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children as string);
      }
    }
  };

  /**
   * 既存要素の `children` と `props` を差分更新する。
   *
   * 1. 実ノード参照 (`el`) を旧 VNode から新 VNode へ引き継ぐ。
   * 2. `patchChildren()` で子ツリーを更新する。
   * 3. 新 props を走査し、値が変化したキーだけ `hostPatchProp()` を呼ぶ。
   *
   * 注意: 現実装は「旧 props にだけ存在して新 props に無いキー」の削除は行わない。
   * 必要なら将来ここに削除フェーズを追加する。
   *
   * @param n1 旧要素 VNode。
   * @param n2 新要素 VNode。
   * @returns なし。
   */
  const patchElement = (n1: VNode, n2: VNode) => {
    const el = (n2.el = n1.el!);

    const props = n2.props;

    patchChildren(n1, n2, el);

    for (const key in props) {
      if (props[key] !== n1.props?.[key]) {
        hostPatchProp(el, key, props[key]);
      }
    }
  };

  /**
   * 子ノード配列をインデックス順に差分更新する。
   *
   * 現在は最小実装としてキー付き最適化を行わず、`c2` を基準に順次 `patch` する。
   * そのため、並び替えが多いケースでは余計な更新が発生しやすい。
   * 学習用の簡易実装として理解しやすさを優先している。
   *
   * @param n1 旧親 VNode。
   * @param n2 新親 VNode。
   * @param container 子の描画先要素。
   * @returns なし。
   */
  const patchChildren = (n1: VNode, n2: VNode, container: RendererElement) => {
    const c1 = n1.children as Array<VNode>;
    const c2 = n2.children as Array<VNode>;

    for (let i = 0; i < c2.length; i++) {
      const child = (c2[i] = normalizeVNode(c2[i]));
      patch(c1[i] || null, child, container);
    }
  };

  /**
   * 要素 VNode を初期マウントする。
   *
   * `el` を生成し、子ノードを先にマウントしてから props を反映し、最後に親へ挿入する。
   * 子を先に処理しているため、挿入時点でサブツリーが完成した状態になる。
   *
   * @param vnode マウント対象の要素 VNode。
   * @param container 親コンテナ要素。
   * @returns なし。
   */
  const mountElement = (vnode: VNode, container: RendererElement) => {
    let el: RendererElement;

    const { type, props } = vnode;
    el = vnode.el = hostCreateElement(type as string);

    //mountchildren
    mountChildren(vnode.children as Array<VNode>, el);

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, props[key]);
      }
    }

    hostInsert(el, container);
  };

  /**
   * 子ノード配列を正規化しつつ再帰的に初期マウントする。
   *
   * 各要素は `normalizeVNode()` で文字列/配列などの差異を吸収し、
   * `patch(null, child, container)` へ統一的に流す。
   * この設計によりマウント処理と更新処理を同じ `patch` 経路で共有できる。
   *
   * @param children 子ノード配列。
   * @param container 子を挿入するコンテナ要素。
   * @returns なし。
   */
  const mountChildren = (
    children: Array<VNode>,
    container: RendererElement,
  ) => {
    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVNode(children[i]));
      patch(null, child, container);
    }
  };

  return {
    render,
  };
}
