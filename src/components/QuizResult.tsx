import { A, useNavigate, useParams } from "@solidjs/router";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconBooks,
  IconConfetti,
  IconTarget,
  IconThumbUp,
} from "@tabler/icons-solidjs";
import { type Component, createSignal, For, onMount, Show } from "solid-js";
import { useQuizData } from "../context/QuizDataContext";
import type { Category, Question } from "../schema/quiz.js";
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
                  .map((idx) => props.question.options[idx])
                  .join(", ")
              : "未回答"}
          </p>
          <p>
            <span class="font-medium">正解:</span>{" "}
            {props.question.correct
              .map((idx) => props.question.options[idx])
              .join(", ")}
          </p>
        </div>
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

  // Context からクイズデータを取得
  const { quizData } = useQuizData();

  // 状態管理
  const [currentCategory, setCurrentCategory] = createSignal<Category | null>(
    null,
  );
  const [progress, setProgress] = createSignal<QuizProgress | null>(null);
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
      return {
        level: "excellent",
        message: "素晴らしい！",
        icon: (
          <IconConfetti
            size={48}
            class="text-warning"
            aria-label="素晴らしい"
          />
        ),
      };
    if (acc >= 80)
      return {
        level: "good",
        message: "良くできました",
        icon: (
          <IconThumbUp
            size={48}
            class="text-success"
            aria-label="良くできました"
          />
        ),
      };
    if (acc >= 70)
      return {
        level: "fair",
        message: "もう少し頑張りましょう",
        icon: (
          <IconTarget
            size={48}
            class="text-info"
            aria-label="もう少し頑張りましょう"
          />
        ),
      };
    return {
      level: "poor",
      message: "復習が必要です",
      icon: (
        <IconBooks size={48} class="text-primary" aria-label="復習が必要です" />
      ),
    };
  };

  // 結果初期化
  onMount(() => {
    try {
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

      // カテゴリを取得
      const category = quizData.categories.find(
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
      {/* エラー状態 */}
      <Show when={error()}>
        <div class="alert alert-error">
          <IconAlertCircle
            size={24}
            class="stroke-current shrink-0"
            aria-label="エラー"
          />
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
      <Show when={!error() && progress() && currentCategory()}>
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
          <div class="card bg-linear-to-br from-primary/10 to-secondary/10 border border-primary/20 shadow-lg">
            <div class="card-body text-center">
              <div class="mb-4">{getPerformanceLevel().icon}</div>
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
              <IconAlertTriangle
                size={24}
                class="stroke-current shrink-0"
                aria-label="警告"
              />
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
