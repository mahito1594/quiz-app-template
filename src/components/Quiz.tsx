import { useParams } from "@solidjs/router";
import type { Component } from "solid-js";

/**
 * クイズ実行コンポーネント
 * カテゴリ別の問題表示と回答機能
 */
const Quiz: Component = () => {
  const params = useParams();

  return (
    <div class="space-y-6">
      <h1 class="text-4xl font-bold text-base-content">クイズ実行: {params.categoryId}</h1>
      <p class="text-lg text-base-content/70">クイズ実行機能の実装予定</p>
      
      {/* TODO: 以下の機能を実装する */}
      <div class="card bg-base-100 shadow-md border border-dashed border-base-300">
        <div class="card-body">
          <h2 class="card-title text-2xl">実装予定機能</h2>
          <ul class="list-disc list-inside space-y-2 text-base-content/80">
            {/* TODO: YAMLデータから問題を取得して表示 */}
            <li>問題文・選択肢表示</li>
            <li>単一選択・複数選択対応</li>
            <li>即時フィードバック</li>
            <li>解説文表示（Markdown対応）</li>
            <li>次の問題への移行</li>
            {/* TODO: LocalStorageによる状態管理 */}
            <li>進捗保存</li>
          </ul>
        </div>
      </div>
      
      {/* TODO: 実際のクイズインターフェースを実装 */}
      <div class="alert alert-info">
        <p>
          Category ID: <strong class="text-info-content">{params.categoryId}</strong>
        </p>
      </div>
    </div>
  );
};

export default Quiz;
