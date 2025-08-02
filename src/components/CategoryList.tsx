import { A } from "@solidjs/router";
import { type Component, createSignal, For, onMount, Show } from "solid-js";
import quizYaml from "../data/quiz.yaml";
import type { Category, QuizData } from "../schema/quiz.js";
import { parseQuizData } from "../schema/quiz.js";
import { quizStateManager } from "../stores/quiz-store.js";

/**
 * カテゴリの進捗情報を取得する関数
 */
const getCategoryProgress = (categoryId: string) => {
  const progress = quizStateManager.getCategoryProgress(categoryId);
  const accuracy = quizStateManager.calculateAccuracy(categoryId);

  return {
    hasProgress: !!progress,
    isCompleted: !!progress?.completedAt,
    currentQuestion: progress?.currentQuestionIndex ?? 0,
    totalAnswered: progress?.answers.length ?? 0,
    accuracy: accuracy,
  };
};

/**
 * カテゴリ情報カードコンポーネント
 */
const CategoryCard: Component<{ category: Category }> = (props) => {
  const progress = () => getCategoryProgress(props.category.id);
  const totalQuestions = () => props.category.questions.length;

  return (
    <div class="card bg-base-100 shadow-md border hover:shadow-lg transition-shadow">
      <div class="card-body">
        <h2 class="card-title text-xl">{props.category.name}</h2>
        <p class="text-base-content/70">{props.category.description}</p>

        {/* 進捗情報 */}
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>問題数</span>
            <span class="font-semibold">{totalQuestions()}問</span>
          </div>

          <Show when={progress().hasProgress}>
            <div class="flex justify-between text-sm">
              <span>進捗</span>
              <span class="font-semibold">
                {progress().totalAnswered} / {totalQuestions()}
              </span>
            </div>

            <Show when={progress().totalAnswered > 0}>
              <div class="flex justify-between text-sm">
                <span>正答率</span>
                <span class="font-semibold">
                  {progress().accuracy.toFixed(1)}%
                </span>
              </div>
            </Show>
          </Show>
        </div>

        {/* ステータスバッジ */}
        <div class="flex flex-wrap gap-2 mt-2">
          <Show when={progress().isCompleted}>
            <div class="badge badge-success">完了</div>
          </Show>
          <Show when={progress().hasProgress && !progress().isCompleted}>
            <div class="badge badge-warning">進行中</div>
          </Show>
          <Show when={!progress().hasProgress}>
            <div class="badge badge-ghost">未開始</div>
          </Show>
        </div>

        {/* アクションボタン */}
        <div class="card-actions justify-end mt-4">
          <Show
            when={progress().hasProgress && !progress().isCompleted}
            fallback={
              <A href={`/quiz/${props.category.id}`} class="btn btn-primary">
                {progress().isCompleted ? "再挑戦" : "開始"}
              </A>
            }
          >
            <A href={`/quiz/${props.category.id}`} class="btn btn-primary">
              続きから
            </A>
          </Show>

          <Show when={progress().hasProgress}>
            <A href={`/category/${props.category.id}`} class="btn btn-outline">
              問題一覧
            </A>
          </Show>
        </div>
      </div>
    </div>
  );
};

/**
 * カテゴリ一覧コンポーネント
 * ホーム画面とカテゴリ選択画面で使用
 */
const CategoryList: Component = () => {
  const [quizData, setQuizData] = createSignal<QuizData | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // データ読み込み（初期化時のみ実行）
  onMount(() => {
    try {
      setLoading(true);
      setError(null);

      // YAMLデータをvalibotでパース（型安全）
      const data = parseQuizData(quizYaml);
      setQuizData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "データの読み込みに失敗しました",
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <div class="space-y-6">
      <h1 class="text-4xl font-bold text-base-content">問題集カテゴリ一覧</h1>

      {/* メタデータ表示 */}
      <Show when={quizData()}>
        <div class="bg-base-200 p-4 rounded-lg">
          <h2 class="text-xl font-semibold mb-2">
            {quizData()?.metadata.title}
          </h2>
          <div class="text-sm text-base-content/70 space-y-1">
            <p>総問題数: {quizData()?.metadata.totalQuestions}問</p>
            <p>最終更新: {quizData()?.metadata.lastUpdated}</p>
            <Show when={quizData()?.metadata.description}>
              <p>{quizData()?.metadata.description}</p>
            </Show>
          </div>
        </div>
      </Show>

      {/* ローディング状態 */}
      <Show when={loading()}>
        <div class="flex justify-center items-center py-12">
          <span class="loading loading-spinner loading-lg"></span>
          <span class="ml-3 text-lg">データを読み込み中...</span>
        </div>
      </Show>

      {/* エラー状態 */}
      <Show when={error()}>
        <div class="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="エラー"
          >
            <title>エラーアイコン</title>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>エラー: {error()}</span>
        </div>
      </Show>

      {/* カテゴリ一覧 */}
      <Show when={quizData() && !loading()}>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <For each={quizData()?.categories}>
            {(category) => <CategoryCard category={category} />}
          </For>
        </div>
      </Show>

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
