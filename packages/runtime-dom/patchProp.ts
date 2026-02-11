import { RerendererOptions } from "../runtime-core";
import { patchAttr } from "./module/attris";
import { patchEvent } from "./module/events";

type DOMRendererOptions = RerendererOptions<Node, Element>;

const onRE = /^on[^a-z]/;

/**
 * イベントリスナーキーかどうかを判定するユーティリティ
 *
 * `on` で始まり、3文字目が小文字でない（= `onClick` など）場合をイベントとして扱う。
 * 例: `onClick` は `true`、`onclick` は `false`。
 *
 * @param key 判定対象のプロパティ名（例: `onClick`）。
 * @returns イベントキーなら `true`。
 */
const isOn = (key: string) => onRE.test(key);

/**
 * DOM 要素のプロパティ/属性/イベント差分を適用する関数
 *
 * - イベント（`onXxx` の形式）が指定されていれば `patchEvent` を呼ぶ。
 * - それ以外は `patchAttr` を使って属性の追加・削除・更新を行う。
 *
 * レンダラからは「キーごとに新しい値」が渡されるため、この関数は
 * キー判定だけを責務に持つディスパッチャとして実装している。
 *
 * @param el 反映対象 DOM 要素。
 * @param key 変更対象キー。
 * @param value 新しい値。
 * @returns なし。
 */
export const patchProp: DOMRendererOptions["patchProp"] = (el, key, value) => {
  if (isOn(key)) {
    patchEvent(el, key, value);
  } else {
    patchAttr(el, key, value);
  }
};
