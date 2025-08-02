import { useParams } from "@solidjs/router";
import type { Component } from "solid-js";

/**
 * 個別問題表示コンポーネント
 * 特定の問題の詳細表示（URLシェア対応）
 */
const QuestionView: Component = () => {
  const params = useParams();

  return (
    <div class="space-y-6">
      <h1 class="text-4xl font-bold text-base-content">問題表示</h1>
      <p class="text-lg text-base-content/70">個別問題表示機能の実装予定</p>

      {/* TODO: 以下の機能を実装する */}
      <div class="card bg-base-100 shadow-md border border-dashed border-base-300">
        <div class="card-body">
          <h2 class="card-title text-2xl">実装予定機能</h2>
          <ul class="list-disc list-inside space-y-2 text-base-content/80">
            <li>指定された問題の単体表示</li>
            <li>問題文・選択肢・解説表示</li>
            <li>正解の表示</li>
            <li>カテゴリ全体のクイズへの案内</li>
          </ul>
        </div>
      </div>

      {/* TODO: 実際の問題データを表示する */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="alert alert-warning">
          <p>
            Category ID:{" "}
            <strong class="text-warning-content">{params.categoryId}</strong>
          </p>
        </div>
        <div class="alert alert-secondary">
          <p>
            Question Index:{" "}
            <strong class="text-secondary-content">
              {params.questionIndex}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestionView;
