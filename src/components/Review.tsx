import type { Component } from "solid-js";

/**
 * 復習モードコンポーネント
 * 間違えた問題の復習機能
 */
const Review: Component = () => {
  return (
    <div class="space-y-6">
      <h1 class="text-4xl font-bold text-base-content">復習モード</h1>
      <p class="text-lg text-base-content/70">間違えた問題の復習機能の実装予定</p>
      
      {/* TODO: 以下の機能を実装する */}
      <div class="card bg-base-100 shadow-md border border-dashed border-base-300">
        <div class="card-body">
          <h2 class="card-title text-2xl">実装予定機能</h2>
          <ul class="list-disc list-inside space-y-2 text-base-content/80">
            {/* TODO: LocalStorageから履歴データを取得 */}
            <li>過去に間違えた問題の一覧表示</li>
            <li>復習対象問題のフィルタリング</li>
            <li>復習クイズの実行</li>
            <li>復習で正解した問題の除外</li>
            {/* TODO: 復習進捗の永続化 */}
            <li>復習進捗の保存</li>
          </ul>
        </div>
      </div>
      
      {/* TODO: 実際の復習対象問題リストを表示 */}
      <div class="alert alert-info">
        <p>
          現在の復習対象問題: <strong class="text-info-content">実装予定</strong>
        </p>
      </div>
    </div>
  );
};

export default Review;
