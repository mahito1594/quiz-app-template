import { A, HashRouter, Route } from "@solidjs/router";
import type { Component, ParentComponent } from "solid-js";

// コンポーネントインポート
import CategoryList from "./components/CategoryList";
import NotFound from "./components/NotFound";
import Quiz from "./components/Quiz";
import QuizResult from "./components/QuizResult";
import Review from "./components/Review";

/**
 * レイアウトコンポーネント
 * ヘッダー、フッター、メインコンテンツエリアを提供
 */
const Layout: ParentComponent = (props) => {
  return (
    <div class="min-h-screen flex flex-col">
      {/* ヘッダーナビゲーション */}
      <header class="bg-base-200 px-8 py-4 border-b border-base-300">
        <nav class="flex items-center justify-between">
          <div>
            <A href="/" class="text-2xl font-bold text-primary no-underline">
              問題集アプリ
            </A>
          </div>
          <div class="flex gap-4">
            <A href="/" class="btn btn-ghost btn-sm" activeClass="btn-active">
              ホーム
            </A>
            <A
              href="/review"
              class="btn btn-ghost btn-sm"
              activeClass="btn-active"
            >
              復習
            </A>
          </div>
        </nav>
      </header>

      {/* メインコンテンツ */}
      <main class="flex-1 p-8">{props.children}</main>

      {/* フッター */}
      <footer class="bg-base-200 px-8 py-4 border-t border-base-300 text-center">
        <p class="text-base-content/70 text-sm">
          Powered by{" "}
          <a
            href="https://github.com/mahito1594/quiz-app-template"
            class="font-bold text-secondary no-underline"
          >
            quiz-app-template
          </a>
        </p>
      </footer>
    </div>
  );
};

/**
 * メインアプリケーションコンポーネント
 * Hash routingでSPA対応
 */
const App: Component = () => {
  return (
    <HashRouter root={Layout}>
      <Route path="/" component={CategoryList} />
      <Route path="/category/:categoryId" component={CategoryList} />
      <Route path="/quiz/:categoryId" component={Quiz} />
      <Route path="/quiz/:categoryId/result" component={QuizResult} />
      <Route path="/review" component={Review} />
      <Route path="/*all" component={NotFound} />
    </HashRouter>
  );
};

export default App;
