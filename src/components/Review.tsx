import { A, useNavigate } from "@solidjs/router";
import { type Component, createSignal, For, onMount, Show } from "solid-js";
import quizYaml from "../data/quiz.yaml";
import type { Category, Question, QuizData } from "../schema/quiz.js";
import { parseQuizData } from "../schema/quiz.js";
import type { ReviewQuestion } from "../stores/quiz-store.js";
import { quizStateManager } from "../stores/quiz-store.js";
import AnswerOptions from "./quiz/AnswerOptions.jsx";
import ImmediateFeedback from "./quiz/ImmediateFeedback.jsx";
import QuestionCard from "./quiz/QuestionCard.jsx";

type ReviewQuestionWithData = ReviewQuestion & {
  question: Question;
  categoryName: string;
  category: Category;
};

/**
 * 復習問題カードコンポーネント
 */
const ReviewQuestionCard: Component<{
  reviewQuestion: ReviewQuestionWithData;
}> = (props) => {
  return (
    <div class="card bg-base-100 shadow-md border hover:shadow-lg transition-shadow">
      <div class="card-body">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="card-title text-lg">
              {props.reviewQuestion.categoryName}
            </h3>
            <p class="text-sm text-base-content/60">
              問題 {props.reviewQuestion.questionIndex + 1}
            </p>
          </div>
          <div class="text-right">
            <div class="badge badge-error mb-1">
              {props.reviewQuestion.errorCount}回間違い
            </div>
            <p class="text-xs text-base-content/60">
              {new Date(props.reviewQuestion.lastErrorAt).toLocaleDateString(
                "ja-JP",
              )}
            </p>
          </div>
        </div>

        <p class="text-base-content/80 mb-4 line-clamp-3">
          {props.reviewQuestion.question.question.replace(/[#*]/g, "").trim()}
        </p>

        <div class="card-actions justify-end">
          <A
            href={`/question/${props.reviewQuestion.categoryId}/${props.reviewQuestion.questionIndex}`}
            class="btn btn-sm btn-outline"
          >
            問題詳細
          </A>
        </div>
      </div>
    </div>
  );
};

/**
 * 復習モードコンポーネント
 * 間違えた問題の復習機能
 */
const Review: Component = () => {
  const navigate = useNavigate();

  // 状態管理
  const [quizData, setQuizData] = createSignal<QuizData | null>(null);
  const [reviewQuestions, setReviewQuestions] = createSignal<
    ReviewQuestionWithData[]
  >([]);
  const [currentReviewIndex, setCurrentReviewIndex] = createSignal(0);
  const [currentQuestion, setCurrentQuestion] =
    createSignal<ReviewQuestionWithData | null>(null);
  const [selectedOptions, setSelectedOptions] = createSignal<number[]>([]);
  const [isAnswered, setIsAnswered] = createSignal(false);
  const [isCorrect, setIsCorrect] = createSignal(false);
  const [showFeedback, setShowFeedback] = createSignal(false);
  const [reviewMode, setReviewMode] = createSignal<"list" | "quiz">("list");
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // 復習データの初期化
  onMount(() => {
    try {
      setLoading(true);
      setError(null);

      const data = parseQuizData(quizYaml);
      setQuizData(data);

      // 復習対象問題を取得
      const reviewQuestionsList = quizStateManager.getReviewQuestions();

      if (reviewQuestionsList.length === 0) {
        setError("復習対象の問題がありません");
        return;
      }

      // 復習問題データを構築
      const reviewQuestionsWithData: ReviewQuestionWithData[] =
        reviewQuestionsList
          .map((reviewQ) => {
            const category = data.categories.find(
              (cat: Category) => cat.id === reviewQ.categoryId,
            );
            if (!category) return null;

            const question = category.questions[reviewQ.questionIndex];
            if (!question) return null;

            return {
              ...reviewQ,
              question,
              categoryName: category.name,
              category,
            };
          })
          .filter((item): item is ReviewQuestionWithData => item !== null);

      setReviewQuestions(reviewQuestionsWithData);

      if (reviewQuestionsWithData.length > 0) {
        setCurrentQuestion(reviewQuestionsWithData[0]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予期しないエラーが発生しました",
      );
    } finally {
      setLoading(false);
    }
  });

  /**
   * 復習クイズを開始
   */
  const startReviewQuiz = () => {
    const questions = reviewQuestions();
    if (questions.length === 0) return;

    setCurrentReviewIndex(0);
    setCurrentQuestion(questions[0]);
    setSelectedOptions([]);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowFeedback(false);
    setReviewMode("quiz");
  };

  /**
   * 回答を提出
   */
  const submitAnswer = () => {
    if (!currentQuestion() || isAnswered()) return;

    // biome-ignore lint/style/noNonNullAssertion: 関数開始時の条件チェックでcurrentQuestion()の存在が保証済み
    const question = currentQuestion()!;
    const selected = selectedOptions();
    const correct = question.question.correct;

    // 回答の正否を判定
    const isAnswerCorrect =
      selected.length === correct.length &&
      selected.every((option) => correct.includes(option)) &&
      correct.every((option) => selected.includes(option));

    setIsAnswered(true);
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);

    // 正解の場合は復習対象から除外
    if (isAnswerCorrect) {
      quizStateManager.markReviewComplete({
        categoryId: question.categoryId,
        questionIndex: question.questionIndex,
      });
    }
  };

  /**
   * 次の復習問題へ進む
   */
  const nextReviewQuestion = () => {
    const questions = reviewQuestions();
    const nextIndex = currentReviewIndex() + 1;

    if (nextIndex >= questions.length) {
      // 復習完了
      setReviewMode("list");
      // 復習対象問題リストを更新
      const updatedReviewQuestions = quizStateManager.getReviewQuestions();
      if (quizData()) {
        // biome-ignore lint/style/noNonNullAssertion: if文の条件でquizData()の存在が保証済み
        const data = quizData()!;
        const updatedQuestionsWithData: ReviewQuestionWithData[] =
          updatedReviewQuestions
            .map((reviewQ) => {
              const category = data.categories.find(
                (cat) => cat.id === reviewQ.categoryId,
              );
              if (!category) return null;
              const question = category.questions[reviewQ.questionIndex];
              if (!question) return null;
              return {
                ...reviewQ,
                question,
                categoryName: category.name,
                category,
              };
            })
            .filter((item): item is ReviewQuestionWithData => item !== null);
        setReviewQuestions(updatedQuestionsWithData);
      }
    } else {
      // 次の問題へ
      setCurrentReviewIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      setSelectedOptions([]);
      setIsAnswered(false);
      setIsCorrect(false);
      setShowFeedback(false);
    }
  };

  /**
   * 復習完了
   */
  const finishReview = () => {
    setReviewMode("list");
    // 復習対象問題リストを更新
    const updatedReviewQuestions = quizStateManager.getReviewQuestions();
    if (quizData()) {
      // biome-ignore lint/style/noNonNullAssertion: if文の条件でquizData()の存在が保証済み
      const data = quizData()!;
      const updatedQuestionsWithData: ReviewQuestionWithData[] =
        updatedReviewQuestions
          .map((reviewQ) => {
            const category = data.categories.find(
              (cat) => cat.id === reviewQ.categoryId,
            );
            if (!category) return null;
            const question = category.questions[reviewQ.questionIndex];
            if (!question) return null;
            return {
              ...reviewQ,
              question,
              categoryName: category.name,
              category,
            };
          })
          .filter((item): item is ReviewQuestionWithData => item !== null);
      setReviewQuestions(updatedQuestionsWithData);
    }
  };

  return (
    <div class="space-y-6">
      {/* ローディング状態 */}
      <Show when={loading()}>
        <div class="flex justify-center items-center py-12">
          <span class="loading loading-spinner loading-lg"></span>
          <span class="ml-3 text-lg">復習データを読み込み中...</span>
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

      {/* 復習問題一覧モード */}
      <Show when={reviewMode() === "list" && !loading() && !error()}>
        <div class="space-y-6">
          {/* ヘッダー */}
          <div class="text-center">
            <h1 class="text-4xl font-bold text-base-content mb-2">
              復習モード
            </h1>
            <p class="text-lg text-base-content/70">
              間違えた問題を復習して理解を深めましょう
            </p>
          </div>

          {/* 復習統計 */}
          <div class="stats shadow bg-base-100">
            <div class="stat">
              <div class="stat-title">復習対象問題</div>
              <div class="stat-value text-warning">
                {reviewQuestions().length}
              </div>
              <div class="stat-desc">問</div>
            </div>
            <div class="stat">
              <div class="stat-title">カテゴリ数</div>
              <div class="stat-value text-primary">
                {new Set(reviewQuestions().map((q) => q.categoryId)).size}
              </div>
              <div class="stat-desc">カテゴリ</div>
            </div>
          </div>

          {/* 復習対象問題がない場合 */}
          <Show when={reviewQuestions().length === 0}>
            <div class="alert alert-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                aria-label="成功"
              >
                <title>成功アイコン</title>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>素晴らしい！復習対象の問題はありません。</span>
              <div>
                <A href="/" class="btn btn-sm">
                  ホームに戻る
                </A>
              </div>
            </div>
          </Show>

          {/* 復習開始ボタン */}
          <Show when={reviewQuestions().length > 0}>
            <div class="text-center">
              <button
                type="button"
                class="btn btn-warning btn-lg"
                onClick={startReviewQuiz}
              >
                復習を開始する
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-label="矢印"
                >
                  <title>開始矢印</title>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>

            {/* 復習問題一覧 */}
            <div class="space-y-4">
              <h3 class="text-2xl font-bold">復習対象問題一覧</h3>

              <div class="grid gap-4 md:grid-cols-2">
                <For each={reviewQuestions()}>
                  {(reviewQuestion) => (
                    <ReviewQuestionCard reviewQuestion={reviewQuestion} />
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>
      </Show>

      {/* 復習クイズモード */}
      <Show
        when={
          reviewMode() === "quiz" && currentQuestion() && !loading() && !error()
        }
      >
        <div class="space-y-6">
          {/* ヘッダー */}
          <div class="text-center">
            <h1 class="text-3xl font-bold text-base-content mb-2">
              復習クイズ
            </h1>
            <p class="text-base-content/70">
              {currentQuestion()?.categoryName}
            </p>
            <div class="text-sm text-base-content/60 mt-2">
              復習問題 {currentReviewIndex() + 1} / {reviewQuestions().length}
            </div>
          </div>

          {/* 問題カード */}
          <QuestionCard
            // biome-ignore lint/style/noNonNullAssertion: Showコンポーネントの条件でcurrentQuestion()の存在が保証済み
            question={currentQuestion()!.question}
            questionNumber={currentReviewIndex() + 1}
            totalQuestions={reviewQuestions().length}
            selectedOptions={selectedOptions()}
            isAnswered={isAnswered()}
            isCorrect={isCorrect()}
          />

          {/* 選択肢 */}
          <Show when={!showFeedback()}>
            <div class="card bg-base-100 shadow-md">
              <div class="card-body">
                <AnswerOptions
                  // biome-ignore lint/style/noNonNullAssertion: Showコンポーネントの条件でcurrentQuestion()の存在が保証済み
                  question={currentQuestion()!.question}
                  selectedOptions={selectedOptions()}
                  onSelectionChange={setSelectedOptions}
                  isAnswered={isAnswered()}
                  correctOptions={
                    isAnswered()
                      ? // biome-ignore lint/style/noNonNullAssertion: Showコンポーネントの条件でcurrentQuestion()の存在が保証済み
                        currentQuestion()!.question.correct
                      : undefined
                  }
                />

                {/* 回答ボタン */}
                <div class="card-actions justify-end mt-6">
                  <button
                    type="button"
                    class="btn btn-warning btn-lg"
                    onClick={submitAnswer}
                    disabled={selectedOptions().length === 0 || isAnswered()}
                  >
                    回答する
                  </button>
                </div>
              </div>
            </div>
          </Show>

          {/* 即時フィードバック */}
          <Show when={showFeedback()}>
            <ImmediateFeedback
              // biome-ignore lint/style/noNonNullAssertion: Showコンポーネントの条件でcurrentQuestion()の存在が保証済み
              question={currentQuestion()!.question}
              isCorrect={isCorrect()}
              selectedOptions={selectedOptions()}
              // biome-ignore lint/style/noNonNullAssertion: Showコンポーネントの条件でcurrentQuestion()の存在が保証済み
              correctOptions={currentQuestion()!.question.correct}
              showNextButton={true}
              onNext={nextReviewQuestion}
              onFinish={finishReview}
              isLastQuestion={
                currentReviewIndex() >= reviewQuestions().length - 1
              }
            />
          </Show>

          {/* ナビゲーション */}
          <div class="flex justify-between">
            <button
              type="button"
              class="btn btn-outline"
              onClick={() => setReviewMode("list")}
            >
              一覧に戻る
            </button>

            <div class="text-sm text-base-content/60">
              {currentReviewIndex() + 1} / {reviewQuestions().length}
            </div>
          </div>
        </div>
      </Show>

      {/* ホームに戻るボタン */}
      <Show when={!loading() && !error()}>
        <div class="text-center">
          <A href="/" class="btn btn-outline">
            ホームに戻る
          </A>
        </div>
      </Show>
    </div>
  );
};

export default Review;
