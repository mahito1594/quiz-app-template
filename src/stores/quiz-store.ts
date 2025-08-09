import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";

/**
 * 問題への回答データ
 */
export type Answer = {
  /** 問題のインデックス（0-based） */
  questionIndex: number;
  /** 選択した選択肢のインデックス配列 */
  selectedOptions: number[];
  /** 正解かどうか */
  isCorrect: boolean;
  /** 回答した時刻 */
  timestamp: string;
};

/**
 * カテゴリ別のクイズ進捗データ
 */
export type QuizProgress = {
  /** カテゴリID */
  categoryId: string;
  /** 現在の問題インデックス（0-based） */
  currentQuestionIndex: number;
  /** 回答履歴 */
  answers: Answer[];
  /** 完了日時（全問題完了時のみ） */
  completedAt?: string;
  /** 最終更新日時 */
  lastUpdated: string;
};

/**
 * 復習対象の問題データ
 */
export type ReviewQuestion = {
  /** カテゴリID */
  categoryId: string;
  /** 問題インデックス */
  questionIndex: number;
  /** 間違えた回数 */
  errorCount: number;
  /** 最後に間違えた日時 */
  lastErrorAt: string;
};

/**
 * クイズアプリの状態管理ストア
 */
export type QuizStore = {
  /** カテゴリ別進捗データ */
  progress: Record<string, QuizProgress>;
  /** 復習対象問題リスト */
  reviewQuestions: ReviewQuestion[];
};

/**
 * 回答提出時の引数型
 */
type SubmitAnswerParams = {
  categoryId: string;
  questionIndex: number;
  selectedOptions: number[];
  correctOptions: number[];
};

/**
 * 次の問題に進む際の引数型
 */
type NextQuestionParams = {
  categoryId: string;
  totalQuestions: number;
};

/**
 * 復習完了マーク時の引数型
 */
type MarkReviewCompleteParams = {
  categoryId: string;
  questionIndex: number;
};

// LocalStorageを使用したクイズ状態管理システム
const [store, setStore] = makePersisted(
  createStore<QuizStore>({
    progress: {},
    reviewQuestions: [],
  }),
  {
    name: "quiz-app-state",
    storage: localStorage,
  },
);

/**
 * 回答が正解かチェックする内部関数
 *
 * **配列比較ロジック:**
 * - 両配列の長さが等しいかをチェック
 * - 選択された全選択肢が正解に含まれるかをチェック（selected ⊆ correct）
 * - 正解の全選択肢が選択されているかをチェック（correct ⊆ selected）
 * - 順序は考慮しない（順序独立の集合比較）
 *
 * @param selected - 選択された選択肢インデックス配列
 * @param correct - 正解の選択肢インデックス配列
 * @returns 回答が正解の場合true、不正解の場合false
 *
 * @example
 * ```typescript
 * checkAnswer([0, 2], [2, 0]); // true (順序は無関係)
 * checkAnswer([0, 1], [0, 2]); // false (選択肢が異なる)
 * checkAnswer([0], [0, 1]);    // false (選択肢数が異なる)
 * ```
 */
const checkAnswer = (selected: number[], correct: number[]): boolean => {
  // 引数の検証
  if (!Array.isArray(selected) || !Array.isArray(correct)) return false;
  if (selected.length !== correct.length) return false;
  return (
    selected.every((option) => correct.includes(option)) &&
    correct.every((option) => selected.includes(option))
  );
};

/**
 * 復習対象問題に追加する内部関数
 * @param categoryId - カテゴリID
 * @param questionIndex - 問題インデックス（0-based）
 */
const addToReview = (categoryId: string, questionIndex: number): void => {
  const existing = store.reviewQuestions.find(
    (q) => q.categoryId === categoryId && q.questionIndex === questionIndex,
  );

  if (existing) {
    // 既存の復習問題の回数を増やす
    const updatedReviewQuestions = store.reviewQuestions.map((q) =>
      q.categoryId === categoryId && q.questionIndex === questionIndex
        ? {
            ...q,
            errorCount: q.errorCount + 1,
            lastErrorAt: new Date().toISOString(),
          }
        : q,
    );

    setStore({ reviewQuestions: updatedReviewQuestions });
  } else {
    // 新規復習問題として追加
    const newReviewQuestion: ReviewQuestion = {
      categoryId,
      questionIndex,
      errorCount: 1,
      lastErrorAt: new Date().toISOString(),
    };

    setStore({
      reviewQuestions: [...store.reviewQuestions, newReviewQuestion],
    });
  }
};

/**
 * クイズ状態管理システム
 */
export const quizStateManager = {
  /**
   * ストレージの読み取り専用アクセサ
   */
  get storeData() {
    return store;
  },

  /**
   * 特定カテゴリの進捗を取得
   * @param categoryId - 取得するカテゴリのID
   * @returns カテゴリの進捗データ、存在しない場合はundefined
   */
  getCategoryProgress(categoryId: string): QuizProgress | undefined {
    return store.progress?.[categoryId];
  },

  /**
   * クイズを開始（新規または継続）
   * 完了判定を追加するための総問題数を受け取る
   * @param categoryId - 開始するカテゴリのID
   * @param totalQuestions - カテゴリの総問題数
   * @returns クイズの進捗データ
   */
  startQuiz(categoryId: string, totalQuestions: number): QuizProgress {
    const existing = this.getCategoryProgress(categoryId);

    if (existing) {
      // 完了判定: completedAtが設定されているか、回答数が総問題数以上の場合
      const isCompleted =
        !!existing.completedAt ||
        existing.answers.length >= totalQuestions ||
        existing.currentQuestionIndex >= totalQuestions;

      if (!isCompleted) {
        // 未完了の場合：既存の進捗を返す
        // currentQuestionIndexを実際の回答進捗と同期
        const syncedProgress = {
          ...existing,
          currentQuestionIndex: Math.max(
            existing.currentQuestionIndex,
            existing.answers.length,
          ),
        };
        return syncedProgress;
      }
    }

    // 新規開始または完了済みの場合：進捗をリセット
    const newProgress: QuizProgress = {
      categoryId,
      currentQuestionIndex: 0,
      answers: [],
      lastUpdated: new Date().toISOString(),
    };

    setStore({
      progress: { ...store.progress, [categoryId]: newProgress },
    });
    return newProgress;
  },

  /**
   * 問題への回答を記録
   * @param params - 回答提出のパラメータ（カテゴリID、問題インデックス、選択肢、正解）
   * @returns 記録された回答データ
   */
  submitAnswer(params: SubmitAnswerParams): Answer {
    const { categoryId, questionIndex, selectedOptions, correctOptions } =
      params;
    const isCorrect = checkAnswer(selectedOptions, correctOptions);
    const timestamp = new Date().toISOString();

    const answer: Answer = {
      questionIndex,
      selectedOptions,
      isCorrect,
      timestamp,
    };

    // 進捗に回答を追加
    const currentProgress = this.getCategoryProgress(categoryId);
    if (currentProgress) {
      const updatedProgress = {
        ...currentProgress,
        answers: [...currentProgress.answers, answer],
        lastUpdated: timestamp,
      };

      setStore({
        progress: { ...store.progress, [categoryId]: updatedProgress },
      });
    }

    // 不正解の場合は復習対象に追加
    if (!isCorrect) {
      addToReview(categoryId, questionIndex);
    }

    return answer;
  },

  /**
   * 次の問題に進む
   * @param params - 次の問題への進行パラメータ（カテゴリID、総問題数）
   */
  nextQuestion(params: NextQuestionParams): void {
    const { categoryId, totalQuestions } = params;
    const progress = this.getCategoryProgress(categoryId);

    if (!progress) return;

    const nextIndex = progress.currentQuestionIndex + 1;
    const timestamp = new Date().toISOString();

    const updatedProgress = {
      ...progress,
      currentQuestionIndex: nextIndex,
      lastUpdated: timestamp,
      ...(nextIndex >= totalQuestions && { completedAt: timestamp }),
    };

    setStore({
      progress: { ...store.progress, [categoryId]: updatedProgress },
    });
  },

  /**
   * 復習対象問題を取得
   */
  getReviewQuestions(): ReviewQuestion[] {
    return store.reviewQuestions;
  },

  /**
   * 復習問題が正解した場合に復習対象から除外
   * @param params - 復習完了マーク用パラメータ（カテゴリID、問題インデックス）
   */
  markReviewComplete(params: MarkReviewCompleteParams): void {
    const { categoryId, questionIndex } = params;
    const updatedReviewQuestions = store.reviewQuestions.filter(
      (q) =>
        !(q.categoryId === categoryId && q.questionIndex === questionIndex),
    );

    setStore({ reviewQuestions: updatedReviewQuestions });
  },

  /**
   * 特定カテゴリの正答率を計算
   * @param categoryId - 正答率を計算するカテゴリのID
   * @returns 正答率（0-100の数値、回答がない場合は0）
   */
  calculateAccuracy(categoryId: string): number {
    const progress = this.getCategoryProgress(categoryId);
    if (!progress || progress.answers.length === 0) return 0;

    const correctCount = progress.answers.filter((a) => a.isCorrect).length;
    return (correctCount / progress.answers.length) * 100;
  },

  /**
   * 特定カテゴリの進捗をリセット
   * @param categoryId - リセットするカテゴリのID
   */
  resetCategoryProgress(categoryId: string): void {
    // 進捗から削除
    const { [categoryId]: _, ...remainingProgress } = store.progress;

    // 復習対象からも削除
    const updatedReviewQuestions = store.reviewQuestions.filter(
      (q) => q.categoryId !== categoryId,
    );

    setStore({
      progress: remainingProgress,
      reviewQuestions: updatedReviewQuestions,
    });
  },
} as const;
