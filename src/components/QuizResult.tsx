import { useParams } from "@solidjs/router";
import type { Component } from "solid-js";

/**
 * クイズ結果コンポーネント
 * 総合結果表示と復習案内
 */
const QuizResult: Component = () => {
  const params = useParams();

  return (
    <div class="space-y-6">
      <h1 class="text-4xl font-bold text-base-content">クイズ結果: {params.categoryId}</h1>
      <p class="text-lg text-base-content/70">クイズ結果表示機能の実装予定</p>
      
      {/* TODO: 以下の機能を実装する */}
      <div class="card bg-base-100 shadow-md border border-dashed border-base-300">
        <div class="card-body">
          <h2 class="card-title text-2xl">実装予定機能</h2>
          <ul class="list-disc list-inside space-y-2 text-base-content/80">
            {/* TODO: 状態管理から結果データを取得 */}
            <li>総合正答率表示</li>
            <li>問題ごとの正解・不正解状況</li>
            <li>間違えた問題の復習リンク</li>
            <li>再挑戦機能</li>
            {/* TODO: ルーターによるナビゲーション */}
            <li>カテゴリ一覧に戻るリンク</li>
          </ul>
        </div>
      </div>
      
      {/* TODO: 実際の結果データを表示 */}
      <div class="alert alert-success">
        <p>
          Category ID: <strong class="text-success-content">{params.categoryId}</strong>
        </p>
      </div>
    </div>
  );
};

export default QuizResult;
