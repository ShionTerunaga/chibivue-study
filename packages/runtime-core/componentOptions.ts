/**
 * コンポーネントオプションのインターフェース
 *
 * - `render`: コンポーネントのレンダリング関数（オプション）
 * - `setup`: コンポーネント初期化関数。ここでリアクティブな状態やレンダラ関数を返す想定
 */
export interface ComponentOptions {
  render?: Function;
  setup?: Function;
}
