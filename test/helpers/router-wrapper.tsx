import { MemoryRouter, Route } from "@solidjs/router";
import type { JSX } from "solid-js";

/**
 * ルーター依存コンポーネントのテスト用ラッパー
 */
export const RouterWrapper = (props: { children: JSX.Element }) => {
  return (
    <MemoryRouter>
      <Route path="/" component={() => <>{props.children}</>} />
    </MemoryRouter>
  );
};
