import { A, useNavigate, useParams } from "@solidjs/router";
import { type Component, createSignal, For, onMount, Show } from "solid-js";
import quizYaml from "../data/quiz.yaml";
import type { Category, Question } from "../schema/quiz.js";
import { parseQuizData } from "../schema/quiz.js";
import type { QuizProgress } from "../stores/quiz-store.js";
import { quizStateManager } from "../stores/quiz-store.js";

/**
 * 問題詳細表示コンポーネント
 */
const QuestionDetail: Component<{
  question: Question;
  questionIndex: number;
  userAnswer?: number[];
  isCorrect: boolean;
  categoryId: string;
}> = (props) => {
  return (
    <div
      class={`card border-2 ${
        props.isCorrect
          ? "bg-success/10 border-success/30"
          : "bg-error/10 border-error/30"
      }`}
    >
      <div class="card-body">
        <div class="flex justify-between items-start mb-3">
          <h3 class="card-title text-lg">問題 {props.questionIndex + 1}</h3>
          <div
            class={`badge ${props.isCorrect ? "badge-success" : "badge-error"}`}
          >
            {props.isCorrect ? "正解" : "不正解"}
          </div>
        </div>

        <p class="text-base-content/80 mb-3">{props.question.question}</p>

        <div class="space-y-2 text-sm">
          <p>
            <span class="font-medium">あなたの回答:</span>{" "}
            {props.userAnswer && props.userAnswer.length > 0
              ? props.userAnswer
                  .map(
                    (idx) =>
                      `${String.fromCharCode(65 + idx)}. ${props.question.options[idx]}`,
                  )
                  .join(", ")
              : "未回答"}
          </p>
          <p>
            <span class="font-medium">正解:</span>{" "}
            {props.question.correct
              .map(
                (idx) =>
                  `${String.fromCharCode(65 + idx)}. ${props.question.options[idx]}`,
              )
              .join(", ")}
          </p>
        </div>

        <Show when={!props.isCorrect}>
          <div class="mt-3">
            <A
              href={`/question/${props.categoryId}/${props.questionIndex}`}
              class="btn btn-sm btn-outline"
            >
              問題詳細を見る
            </A>
          </div>
        </Show>
      </div>
    </div>
  );
};

/**
 * クイズ結果コンポーネント
 * 総合結果表示と復習案内
 */
const QuizResult: Component = () => {
  const params = useParams();
  const navigate = useNavigate();

  // 状態管理
  const [currentCategory, setCurrentCategory] = createSignal<Category | null>(
    null,
  );
  const [progress, setProgress] = createSignal<QuizProgress | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // 結果計算
  const totalQuestions = () => currentCategory()?.questions.length || 0;
  const totalAnswered = () => progress()?.answers.length || 0;
  const correctAnswers = () =>
    progress()?.answers.filter((answer) => answer.isCorrect).length || 0;
  const accuracy = () =>
    totalAnswered() > 0 ? (correctAnswers() / totalAnswered()) * 100 : 0;
  const incorrectAnswers = () => totalAnswered() - correctAnswers();

  // パフォーマンス評価
  const getPerformanceLevel = () => {
    const acc = accuracy();
    if (acc >= 90)
      return { level: "excellent", message: "素晴らしい！", emoji: "🎉" };
    if (acc >= 80)
      return { level: "good", message: "良くできました", emoji: "👏" };
    if (acc >= 70)
      return { level: "fair", message: "もう少し頑張りましょう", emoji: "💪" };
    return { level: "poor", message: "復習が必要です", emoji: "📚" };
  };

  // 結果初期化
  onMount(() => {
    try {
      setLoading(true);
      setError(null);

      // 進捗を取得
      const categoryProgress = quizStateManager.getCategoryProgress(
        params.categoryId,
      );
      if (!categoryProgress) {
        setError("クイズの進捗データが見つかりません");
        return;
      }

      setProgress(categoryProgress);

      // YAMLデータをvalibotでパース（型安全）
      const data = parseQuizData(quizYaml);

      // カテゴリを取得
      const category = data.categories.find(
        (cat: Category) => cat.id === params.categoryId,
      );
      if (!category) {
        setError(`カテゴリ "${params.categoryId}" が見つかりません`);
        return;
      }

      setCurrentCategory(category);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予期しないエラーが発生しました",
      );
    } finally {
      setLoading(false);
    }
  });

  /**
   * 再挑戦
   */
  const retryQuiz = () => {
    quizStateManager.resetCategoryProgress(params.categoryId);
    navigate(`/quiz/${params.categoryId}`);
  };

  return (
    <div class="space-y-6">
      {/* ローディング状態 */}
      <Show when={loading()}>
        <div class="flex justify-center items-center py-12">
          <span class="loading loading-spinner loading-lg"></span>
          <span class="ml-3 text-lg">結果を集計中...</span>
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
          <div class="ml-auto">
            <button
              type="button"
              class="btn btn-sm"
              onClick={() => navigate("/")}
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </Show>

      {/* 結果表示 */}
      <Show when={!loading() && !error() && progress() && currentCategory()}>
        <div class="space-y-6">
          {/* ヘッダー */}
          <div class="text-center">
            <h1 class="text-4xl font-bold text-base-content mb-2">
              クイズ結果
            </h1>
            <h2 class="text-2xl text-base-content/70">
              {currentCategory()?.name}
            </h2>
          </div>

          {/* 総合結果カード */}
          <div class="card bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 shadow-lg">
            <div class="card-body text-center">
              <div class="text-6xl mb-4">{getPerformanceLevel().emoji}</div>
              <h2 class="text-3xl font-bold mb-2">{accuracy().toFixed(1)}%</h2>
              <p class="text-xl text-base-content/80 mb-4">
                {getPerformanceLevel().message}
              </p>

              <div class="stats shadow bg-base-100/50">
                <div class="stat">
                  <div class="stat-title">正解数</div>
                  <div class="stat-value text-success">{correctAnswers()}</div>
                </div>
                <div class="stat">
                  <div class="stat-title">不正解数</div>
                  <div class="stat-value text-error">{incorrectAnswers()}</div>
                </div>
                <div class="stat">
                  <div class="stat-title">総問題数</div>
                  <div class="stat-value">{totalQuestions()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 復習推奨 */}
          <Show when={incorrectAnswers() > 0}>
            <div class="alert alert-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                aria-label="警告"
              >
                <title>警告アイコン</title>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span>
                {incorrectAnswers()}
                問を間違えました。復習リストに追加されているので、後で復習しましょう。
              </span>
              <div>
                <A href="/review" class="btn btn-sm btn-warning">
                  復習する
                </A>
              </div>
            </div>
          </Show>

          {/* 問題別結果 */}
          <div class="space-y-4">
            <h3 class="text-2xl font-bold">問題別結果</h3>

            <div class="space-y-3">
              <For each={currentCategory()?.questions}>
                {(question, index) => {
                  const userAnswer = progress()?.answers.find(
                    (answer) => answer.questionIndex === index(),
                  );
                  return (
                    <QuestionDetail
                      question={question}
                      questionIndex={index()}
                      userAnswer={userAnswer?.selectedOptions}
                      isCorrect={userAnswer?.isCorrect || false}
                      categoryId={params.categoryId}
                    />
                  );
                }}
              </For>
            </div>
          </div>

          {/* アクションボタン */}
          <div class="flex flex-wrap gap-4 justify-center">
            <button
              type="button"
              class="btn btn-primary btn-lg"
              onClick={retryQuiz}
            >
              再挑戦
            </button>

            <A href="/" class="btn btn-outline btn-lg">
              ホームに戻る
            </A>

            <Show when={incorrectAnswers() > 0}>
              <A href="/review" class="btn btn-warning btn-lg">
                復習する
              </A>
            </Show>
          </div>

          {/* 完了時刻 */}
          <Show when={progress()?.completedAt}>
            <div class="text-center text-sm text-base-content/60">
              完了時刻:{" "}
              {/* biome-ignore lint/style/noNonNullAssertion: Showコンポーネントの条件でcompletedAtの存在が保証済み */}
              {new Date(progress()?.completedAt!).toLocaleString("ja-JP")}
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default QuizResult;
