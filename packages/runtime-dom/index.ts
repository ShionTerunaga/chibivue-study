import { createRenderer, RendererElement } from "../runtime-core";
import { createAppApi, CreateAppFunction } from "../runtime-core/apiCreateApp";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

const { render } = createRenderer({ ...nodeOps, patchProp });
const _createApp = createAppApi(render);

/**
 * ブラウザ向け `createApp` のラッパー
 *
 * - 文字列（セレクタ）または DOM 要素を受け取り、`mount` に渡す前に
 *   セレクタ解決や存在チェックを行う。
 * - 実際の描画は runtime-core の `render` が行い、ここではブラウザ固有の
 *   コンテナ解決だけを担当する。
 *
 * @param args ルートコンポーネントなど `_createApp` へ渡す引数。
 * @returns `mount` をブラウザ向けに拡張した `App`。
 */
export const createApp = ((...args) => {
  const app = _createApp(...args);

  const { mount } = app;

  /**
   * セレクタ文字列または要素を受け取り、実体コンテナへ解決してマウントする。
   *
   * 文字列が渡された場合は `document.querySelector` を使って要素を検索する。
   * 対象要素が存在しない場合は、意図しない no-op を避けるため即座に例外を投げる。
   *
   * @param rootContainer CSS セレクタまたは DOM 要素。
   * @returns なし。
   * @throws コンテナが見つからない場合に `Error` を送出する。
   */
  app.mount = (rootContainer: string | RendererElement) => {
    const container =
      typeof rootContainer === "string"
        ? document.querySelector(rootContainer)
        : rootContainer;

    if (!container) {
      throw new Error("Container not found");
    }

    mount(container);
  };

  return app;
}) as CreateAppFunction<Element>;
