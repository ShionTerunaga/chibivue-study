import { Component } from "./component";
import { RootRenderFunction } from "./renderer";

/**
 * アプリケーションオブジェクトのインターフェース
 *
 * - `mount`: ルートコンポーネントを指定したコンテナにマウントするためのメソッド。
 */
export interface App<HostElement = any> {
  mount: (rootContainer: HostElement | string) => void;
}

/**
 * `createApp` のシグネチャ型
 *
 * - `rootComponent` を受け取り、`App` オブジェクトを返す関数の型を表す。
 */
export type CreateAppFunction<HostElement = any> = (
  rootComponent: Component,
) => App<HostElement>;

/**
 * アプリ作成 API を生成するファクトリ
 *
 * レンダラ本体 (`render`) をアプリケーション API へ橋渡しする薄いレイヤー。
 * 返却された `createApp` はルートコンポーネントを受け取り、`mount()` 実行時に
 * `render(rootComponent, container)` を呼ぶ `app` オブジェクトを返す。
 *
 * @param render ルート VNode を指定コンテナへ描画する関数。
 * @returns ルートコンポーネントから `App` を作る `createApp` 関数。
 */
export function createAppApi<HostElement>(
  render: RootRenderFunction<HostElement>,
): CreateAppFunction<HostElement> {
  return function createApp(rootComponent) {
    const app: App = {
      /**
       * ルートコンポーネントを指定コンテナへ描画する。
       *
       * `createApp` 呼び出し時に受け取った `rootComponent` をクロージャで保持し、
       * マウント先コンテナだけを引数で受け取って `render` を起動する。
       *
       * @param rootContainer 描画先コンテナ。
       * @returns なし。
       */
      mount(rootContainer: HostElement) {
        render(rootComponent, rootContainer);
      },
    };

    return app;
  };
}
