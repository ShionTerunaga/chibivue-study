interface Invoker extends EventListener {
  value: EventValue;
}

type EventValue = Function;

/**
 * イベントリスナーを追加するラッパー
 *
 * DOM API の直接呼び出し箇所を 1 箇所に寄せ、将来オプション指定や
 * 抽象化を加えたいときに変更点を局所化しやすくしている。
 *
 * @param el 対象要素。
 * @param event イベント名（例: `click`）。
 * @param handler 登録するリスナー。
 * @returns なし。
 */
export function addEventListener(
  el: Element,
  event: string,
  handler: EventListener,
) {
  el.addEventListener(event, handler);
}

/**
 * イベントリスナーを削除するラッパー
 *
 * `addEventListener` と対になる関数。`patchEvent` から呼ばれ、
 * ハンドラ解除時の責務を分離する。
 *
 * @param el 対象要素。
 * @param event イベント名（例: `click`）。
 * @param handler 削除するリスナー。
 * @returns なし。
 */
export function removeEventListener(
  el: Element,
  event: string,
  handler: EventListener,
) {
  el.removeEventListener(event, handler);
}

/**
 * イベントプロパティの差し替えロジック
 *
 * - `rawName`（例: "onClick"）をキャッシュキーとして `el._val` に Invoker を保持する。
 * - 既存の Invoker があればハンドラの入れ替えを行い、無ければ新規に作成して addEventListener する。
 * - `value` が null の場合は既存ハンドラを削除する。
 *
 * この実装のポイントは「DOM への add/remove を最小化」すること。
 * 一度登録した invoker を使い回し、関数本体 (`invoker.value`) だけ差し替えることで、
 * 更新時のコストとイベント登録の揺れを抑える。
 *
 * @param el イベントキャッシュを保持する DOM 要素。
 * @param rawName 生の prop 名（例: `onClick`）。
 * @param value 新しいハンドラ。`null` の場合は削除。
 * @returns なし。
 */
export function patchEvent(
  el: Element & { _val?: Record<string, Invoker | undefined> },
  rawName: string,
  value: EventValue | null,
) {
  const invokers = el._val || (el._val = {});
  const existingInvoker = invokers[rawName];

  if (value && existingInvoker) {
    existingInvoker.value = value;
  } else {
    const name = parseName(rawName);

    if (value) {
      const invoker = (invokers[rawName] = createInvoker(value));

      addEventListener(el, name, invoker);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker);
      invokers[rawName] = undefined;
    }
  }
}

/**
 * 生のイベントプロパティ名（onXxx）からイベント名を抽出する
 *
 * 先頭の `on` を除去し、小文字化して DOM API 形式へ合わせる。
 *
 * @param rawName 生の prop 名（例: `onClick`）。
 * @returns 正規化済みイベント名（例: `click`）。
 */
function parseName(rawName: string) {
  return rawName.slice(2).toLowerCase();
}

/**
 * Invoker を生成する（内部で現在のハンドラ参照を持つ関数オブジェクト）
 *
 * - Invoker は呼ばれたとき `invoker.value(e)` を呼ぶことで最新のハンドラを実行する。
 * - これにより、`addEventListener` を再実行しなくても更新後ハンドラへ差し替えられる。
 *
 * @param initialValue 初期イベントハンドラ。
 * @returns 差し替え可能な invoker 関数。
 */
function createInvoker(initialValue: EventValue) {
  const invoker: Invoker = (e: Event) => {
    invoker.value(e);
  };

  invoker.value = initialValue;

  return invoker;
}
