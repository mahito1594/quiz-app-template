import { A } from "@solidjs/router";
import type { Component } from "solid-js";

/**
 * 404 Not Foundコンポーネント
 * 無効なルートのエラーハンドリング
 */
const NotFound: Component = () => {
  return (
    <div class="text-center space-y-8 py-16">
      <div class="space-y-4">
        <h1 class="text-6xl font-bold text-error">404</h1>
        <h2 class="text-2xl font-semibold text-base-content">
          ページが見つかりません
        </h2>
        <p class="text-lg text-base-content/70">
          お探しのページは存在しないか、削除された可能性があります。
        </p>
      </div>

      <div class="card bg-base-200 shadow-lg max-w-md mx-auto">
        <div class="card-body">
          <h3 class="card-title justify-center text-xl">利用可能なページ</h3>
          <div class="space-y-3">
            <A href="/" class="btn btn-outline btn-block justify-start">
              🏠 ホーム - カテゴリ一覧
            </A>
            <A href="/review" class="btn btn-outline btn-block justify-start">
              📚 復習モード
            </A>
          </div>
        </div>
      </div>

      <div>
        <A href="/" class="btn btn-primary btn-lg">
          ホームに戻る
        </A>
      </div>
    </div>
  );
};

export default NotFound;
