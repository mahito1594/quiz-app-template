import { useNavigate, useParams } from "@solidjs/router";
import { IconAlertCircle } from "@tabler/icons-solidjs";
import {
  type Component,
  createSignal,
  Match,
  onMount,
  Show,
  Switch,
} from "solid-js";
import { useQuizData } from "../context/QuizDataContext";
import type { Category, Question } from "../schema/quiz.js";
import { quizStateManager } from "../stores/quiz-store.js";
import AnswerOptions from "./quiz/AnswerOptions.jsx";
import ImmediateFeedback from "./quiz/ImmediateFeedback.jsx";
import QuestionCard from "./quiz/QuestionCard.jsx";

/**
 * クイズ実行コンポーネント
 * カテゴリ別の問題表示と回答機能
 */
const Quiz: Component = () => {
  const params = useParams();
  const navigate = useNavigate();

  // Context からクイズデータを取得
  const { quizData } = useQuizData();

  // 状態管理
  const [currentCategory, setCurrentCategory] = createSignal<Category | null>(
    null,
  );
  const [currentQuestion, setCurrentQuestion] = createSignal<Question | null>(
    null,
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = createSignal(0);
  const [selectedOptions, setSelectedOptions] = createSignal<number[]>([]);
  const [isAnswered, setIsAnswered] = createSignal(false);
  const [isCorrect, setIsCorrect] = createSignal(false);
  const [showFeedback, setShowFeedback] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // クイズ初期化
  onMount(() => {
    try {
      setError(null);

      // 指定されたカテゴリを取得
      const category = quizData.categories.find(
        (cat: Category) => cat.id === params.categoryId,
      );
      if (!category) {
        setError(`カテゴリ "${params.categoryId}" が見つかりません`);
        return;
      }

      setCurrentCategory(category);

      // クイズ開始または継続
      const progress = quizStateManager.startQuiz(
        params.categoryId,
        category.questions.length,
      );
      const questionIndex = progress.currentQuestionIndex;

      if (questionIndex >= category.questions.length) {
        // 既に完了している場合は結果画面へ
        navigate(`/quiz/${params.categoryId}/result`);
        return;
      }

      setCurrentQuestionIndex(questionIndex);
      setCurrentQuestion(category.questions[questionIndex]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予期しないエラーが発生しました",
      );
    }
  });

  /**
   * 回答を提出
   */
  const submitAnswer = () => {
    if (!currentQuestion() || !currentCategory() || isAnswered()) return;

    // biome-ignore lint/style/noNonNullAssertion: 関数開始時の条件チェックでcurrentQuestion()の存在が保証済み
    const question = currentQuestion()!;
    const selected = selectedOptions();
    const correct = question.correct;

    // 回答を記録（構造化引数版）
    const answer = quizStateManager.submitAnswer({
      categoryId: params.categoryId,
      questionIndex: currentQuestionIndex(),
      selectedOptions: selected,
      correctOptions: correct,
    });

    setIsAnswered(true);
    setIsCorrect(answer.isCorrect);
    setShowFeedback(true);
  };

  /**
   * 次の問題へ進む
   */
  const nextQuestion = () => {
    if (!currentCategory()) return;

    // biome-ignore lint/style/noNonNullAssertion: 関数開始時の条件チェックでcurrentCategory()の存在が保証済み
    const category = currentCategory()!;
    const nextIndex = currentQuestionIndex() + 1;

    // 状態管理で進捗を更新し、完了判定を行う
    quizStateManager.nextQuestion({
      categoryId: params.categoryId,
      totalQuestions: category.questions.length,
    });

    if (nextIndex >= category.questions.length) {
      // 全問題完了 - 復習リストを更新してから結果画面へ
      quizStateManager.updateReviewListOnCompletion(params.categoryId);
      navigate(`/quiz/${params.categoryId}/result`);
    } else {
      // 次の問題へ
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(category.questions[nextIndex]);
      setSelectedOptions([]);
      setIsAnswered(false);
      setIsCorrect(false);
      setShowFeedback(false);
    }
  };

  /**
   * 結果画面へ移動
   */
  const finishQuiz = () => {
    // クイズ完了時に復習リストを更新
    quizStateManager.updateReviewListOnCompletion(params.categoryId);
    navigate(`/quiz/${params.categoryId}/result`);
  };

  return (
    <div class="space-y-6">
      {/* ヘッダー */}
      <div class="text-center">
        <h1 class="text-3xl font-bold text-base-content mb-2">
          {currentCategory()?.name || "クイズ"}
        </h1>
        <Show when={currentCategory()?.description}>
          <p class="text-base-content/70">{currentCategory()?.description}</p>
        </Show>
      </div>

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

      {/* クイズメイン */}
      <Show when={currentQuestion() && currentCategory() && !error()}>
        <div class="space-y-6">
          {/* 問題カード */}
          <QuestionCard
            // biome-ignore lint/style/noNonNullAssertion: Matchコンポーネントの条件でcurrentQuestion()の存在が保証済み
            question={currentQuestion()!}
            questionNumber={currentQuestionIndex() + 1}
            totalQuestions={currentCategory()?.questions.length || 0}
            selectedOptions={selectedOptions()}
            isAnswered={isAnswered()}
            isCorrect={isCorrect()}
          />

          {/* 選択肢またはフィードバック */}
          <Switch>
            {/* 選択肢表示 */}
            <Match when={!showFeedback()}>
              <div class="card bg-base-100 shadow-md">
                <div class="card-body">
                  <AnswerOptions
                    // biome-ignore lint/style/noNonNullAssertion: Matchコンポーネントの条件でcurrentQuestion()の存在が保証済み
                    question={currentQuestion()!}
                    selectedOptions={selectedOptions()}
                    onSelectionChange={setSelectedOptions}
                    isAnswered={isAnswered()}
                    correctOptions={
                      isAnswered() ? currentQuestion()?.correct : undefined
                    }
                  />

                  {/* 回答ボタン */}
                  <div class="card-actions justify-end mt-6">
                    <button
                      type="button"
                      class="btn btn-primary btn-lg"
                      onClick={submitAnswer}
                      disabled={selectedOptions().length === 0 || isAnswered()}
                    >
                      回答する
                    </button>
                  </div>
                </div>
              </div>
            </Match>

            {/* 即時フィードバック */}
            <Match when={showFeedback()}>
              <ImmediateFeedback
                // biome-ignore lint/style/noNonNullAssertion: Matchコンポーネントの条件でcurrentQuestion()の存在が保証済み
                question={currentQuestion()!}
                isCorrect={isCorrect()}
                selectedOptions={selectedOptions()}
                correctOptions={currentQuestion()?.correct || []}
                showNextButton={true}
                onNext={nextQuestion}
                onFinish={finishQuiz}
                isLastQuestion={
                  currentQuestionIndex() >=
                  (currentCategory()?.questions.length || 1) - 1
                }
              />
            </Match>
          </Switch>
        </div>
      </Show>

      {/* ナビゲーション */}
      <div class="flex justify-between">
        <button
          type="button"
          class="btn btn-outline"
          onClick={() => navigate("/")}
        >
          ホームに戻る
        </button>

        <Show when={currentCategory()}>
          <div class="text-sm text-base-content/60">
            問題 {currentQuestionIndex() + 1} /{" "}
            {currentCategory()?.questions.length}
          </div>
        </Show>
      </div>
    </div>
  );
};

export default Quiz;
