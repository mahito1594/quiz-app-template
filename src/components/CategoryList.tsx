import { A } from "@solidjs/router";
import { type Component, For, Show } from "solid-js";
import { useQuizData } from "../context/QuizDataContext";
import { quizStateManager } from "../stores/quiz-store.js";
import CategoryCard from "./CategoryCard.js";

/**
 * カテゴリの進捗情報を取得する関数
 */
const getCategoryProgress = (categoryId: string, totalQuestions: number) => {
  const progress = quizStateManager.getCategoryProgress(categoryId);
  const accuracy = quizStateManager.calculateAccuracy(categoryId);
  const totalAnswered = progress?.answers.length ?? 0;

  // 完了判定: completedAtが設定されているか、回答数が総問題数と等しい場合
  const isCompleted =
    !!progress?.completedAt ||
    (totalAnswered > 0 && totalAnswered >= totalQuestions);

  return {
    hasProgress: !!progress,
    isCompleted: isCompleted,
    currentQuestion: progress?.currentQuestionIndex ?? 0,
    totalAnswered: totalAnswered,
    accuracy: accuracy,
  };
};

/**
 * カテゴリ一覧コンポーネント
 * ホーム画面とカテゴリ選択画面で使用
 */
const CategoryList: Component = () => {
  // Context からクイズデータを取得
  const { quizData } = useQuizData();

  return (
    <div class="space-y-6">
      <h1 class="text-4xl font-bold text-base-content">問題集カテゴリ一覧</h1>

      {/* メタデータ表示 */}
      <div class="bg-base-200 p-4 rounded-lg">
        <h2 class="text-xl font-semibold mb-2">{quizData.metadata.title}</h2>
        <div class="text-sm text-base-content/70 space-y-1">
          <p>総問題数: {quizData.metadata.totalQuestions}問</p>
          <p>最終更新: {quizData.metadata.lastUpdated}</p>
          <Show when={quizData.metadata.description}>
            <p>{quizData.metadata.description}</p>
          </Show>
        </div>
      </div>

      {/* カテゴリ一覧 */}
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <For each={quizData.categories}>
          {(category) => (
            <CategoryCard
              category={category}
              progress={getCategoryProgress(
                category.id,
                category.questions.length,
              )}
            />
          )}
        </For>
      </div>

      {/* 復習リンク */}
      <Show when={quizStateManager.getReviewQuestions().length > 0}>
        <div class="card bg-warning text-warning-content shadow-md">
          <div class="card-body">
            <h2 class="card-title">復習推奨問題があります</h2>
            <p>
              間違えた問題が {quizStateManager.getReviewQuestions().length}{" "}
              問あります。
            </p>
            <div class="card-actions justify-end">
              <A href="/review" class="btn btn-warning-content">
                復習する
              </A>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default CategoryList;
