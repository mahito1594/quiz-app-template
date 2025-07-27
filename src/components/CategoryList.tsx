import type { Component } from "solid-js";

/**
 * カテゴリ一覧コンポーネント
 * ホーム画面とカテゴリ選択画面で使用
 */
const CategoryList: Component = () => {
  return (
    <div class="space-y-6">
      <h1 class="text-4xl font-bold text-base-content">問題集カテゴリ一覧</h1>
      <p class="text-lg text-base-content/70">カテゴリ一覧の実装予定</p>
      
      {/* TODO: 以下の機能を実装する */}
      <div class="card bg-base-100 shadow-md border border-dashed border-base-300">
        <div class="card-body">
          <h2 class="card-title text-2xl">実装予定機能</h2>
          <ul class="list-disc list-inside space-y-2 text-base-content/80">
            {/* TODO: YAMLデータローダーと連携 */}
            <li>YAMLファイルからカテゴリ読み込み</li>
            <li>カテゴリ別問題数表示</li>
            <li>進捗状況表示</li>
            <li>カテゴリ別クイズ開始リンク</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
