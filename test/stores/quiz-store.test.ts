import { beforeEach, describe, expect, it, vi } from "vitest";

// LocalStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// グローバルなlocalStorageを置き換え
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// テスト実行前にstorageをリセット
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe("QuizStateManager", () => {
  // 動的インポートでモック後にモジュールを読み込み
  // biome-ignore lint/suspicious/noExplicitAny: テストでの動的インポート型定義のため許容
  let QuizStateManager: any;

  beforeEach(async () => {
    // モジュールキャッシュをクリア
    vi.resetModules();

    // 動的インポートで状態管理システムを読み込み
    const module = await import("../../src/stores/quiz-store.js");
    QuizStateManager = module.quizStateManager;
  });

  describe("初期化", () => {
    it("新規インスタンス作成時にデフォルト値が設定される", () => {
      expect(QuizStateManager.storeData.progress).toEqual({});
      expect(QuizStateManager.storeData.reviewQuestions).toEqual([]);
    });
  });

  describe("クイズ開始", () => {
    it("新規カテゴリでクイズを開始できる", () => {
      const progress = QuizStateManager.startQuiz("programming", 10);

      expect(progress).toEqual({
        categoryId: "programming",
        currentQuestionIndex: 0,
        answers: [],
        lastUpdated: expect.any(String),
      });
    });

    it("既存の未完了進捗がある場合は継続する", () => {
      // 最初にクイズを開始
      QuizStateManager.startQuiz("programming", 10);

      // 進捗を進める
      QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [1],
        correctOptions: [1],
      });
      QuizStateManager.nextQuestion({
        categoryId: "programming",
        totalQuestions: 10,
      });

      // 再度開始した場合、継続される
      const resumed = QuizStateManager.startQuiz("programming", 10);

      expect(resumed.currentQuestionIndex).toBe(1);
      expect(resumed.answers).toHaveLength(1);
    });

    it("完了済みのクイズを開始すると新規進捗が作成される", () => {
      // クイズを完了させる
      QuizStateManager.startQuiz("programming", 10);
      QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [1],
        correctOptions: [1],
      });
      QuizStateManager.nextQuestion({
        categoryId: "programming",
        totalQuestions: 1,
      }); // 1問だけなので完了

      // 再度開始
      const restarted = QuizStateManager.startQuiz("programming", 1);

      expect(restarted.currentQuestionIndex).toBe(0);
      expect(restarted.answers).toEqual([]);
      expect(restarted.completedAt).toBeUndefined();
    });

    it("回答数が総問題数と等しい場合も新規進捗が作成される", () => {
      // 2問のクイズを開始
      QuizStateManager.startQuiz("programming", 2);

      // 2問回答（completedAtは設定されていない状態）
      QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [1],
        correctOptions: [1],
      });
      QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 1,
        selectedOptions: [1],
        correctOptions: [1],
      });

      // 再度開始すると新規進捗が作成される
      const restarted = QuizStateManager.startQuiz("programming", 2);

      expect(restarted.currentQuestionIndex).toBe(0);
      expect(restarted.answers).toEqual([]);
    });

    it("currentQuestionIndexが総問題数以上の場合も新規進捗が作成される", () => {
      // 2問のクイズを開始
      QuizStateManager.startQuiz("programming", 2);

      // 問題を進めすぎた状態を作る
      QuizStateManager.nextQuestion({
        categoryId: "programming",
        totalQuestions: 2,
      });
      QuizStateManager.nextQuestion({
        categoryId: "programming",
        totalQuestions: 2,
      });

      // 再度開始すると新規進捗が作成される
      const restarted = QuizStateManager.startQuiz("programming", 2);

      expect(restarted.currentQuestionIndex).toBe(0);
      expect(restarted.answers).toEqual([]);
    });
  });

  describe("回答記録", () => {
    beforeEach(() => {
      QuizStateManager.startQuiz("programming", 10);
    });

    it("正解の回答を記録できる", () => {
      const answer = QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [1],
        correctOptions: [1],
      });

      expect(answer).toEqual({
        questionIndex: 0,
        selectedOptions: [1],
        isCorrect: true,
        timestamp: expect.any(String),
      });

      const progress = QuizStateManager.getCategoryProgress("programming");
      expect(progress?.answers).toHaveLength(1);
      expect(progress?.answers[0]).toEqual(answer);
    });

    it("不正解の回答を記録できる", () => {
      const answer = QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [2],
        correctOptions: [1],
      });

      expect(answer.isCorrect).toBe(false);
      expect(answer.selectedOptions).toEqual([2]);

      // 復習対象に追加されるか確認
      const reviewQuestions = QuizStateManager.getReviewQuestions();
      expect(reviewQuestions).toHaveLength(1);
      expect(reviewQuestions[0]).toEqual({
        categoryId: "programming",
        questionIndex: 0,
        errorCount: 1,
        lastErrorAt: expect.any(String),
      });
    });

    it("複数選択問題の正解を判定できる", () => {
      const correctAnswer = QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [1, 3],
        correctOptions: [1, 3],
      });
      expect(correctAnswer.isCorrect).toBe(true);

      const incorrectAnswer = QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 1,
        selectedOptions: [1, 2],
        correctOptions: [1, 3],
      });
      expect(incorrectAnswer.isCorrect).toBe(false);
    });
  });

  describe("問題進行", () => {
    beforeEach(() => {
      QuizStateManager.startQuiz("programming", 10);
    });

    it("次の問題に進むことができる", () => {
      QuizStateManager.nextQuestion({
        categoryId: "programming",
        totalQuestions: 10,
      });

      const progress = QuizStateManager.getCategoryProgress("programming");
      expect(progress?.currentQuestionIndex).toBe(1);
    });

    it("最後の問題を完了すると完了状態になる", () => {
      QuizStateManager.nextQuestion({
        categoryId: "programming",
        totalQuestions: 1,
      });

      const progress = QuizStateManager.getCategoryProgress("programming");
      expect(progress?.completedAt).toBeDefined();
      expect(typeof progress?.completedAt).toBe("string");
    });

    it("回答後にホームに戻り、続きから再開すると次の未回答問題から始まる", () => {
      // 1問目に回答（nextQuestionを呼ばずに）
      QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [1],
        correctOptions: [1],
      });

      // この時点でcurrentQuestionIndexは0のまま、answersは1つ
      const progressBeforeResume =
        QuizStateManager.getCategoryProgress("programming");
      expect(progressBeforeResume?.currentQuestionIndex).toBe(0);
      expect(progressBeforeResume?.answers).toHaveLength(1);

      // ホームに戻った後、続きから再開
      const resumedProgress = QuizStateManager.startQuiz("programming", 10);

      // currentQuestionIndexがanswers.lengthと同期されて1になるべき
      expect(resumedProgress.currentQuestionIndex).toBe(1);
      expect(resumedProgress.answers).toHaveLength(1);
    });
  });

  describe("復習機能", () => {
    beforeEach(() => {
      QuizStateManager.startQuiz("programming", 10);
    });

    it("同じ問題を複数回間違えると回数が増える", () => {
      // 1回目の間違い
      QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [2],
        correctOptions: [1],
      });

      // 2回目の間違い
      QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [3],
        correctOptions: [1],
      });

      const reviewQuestions = QuizStateManager.getReviewQuestions();
      expect(reviewQuestions).toHaveLength(1);
      expect(reviewQuestions[0].errorCount).toBe(2);
    });

    it("復習問題を正解すると復習対象から除外される", () => {
      // まず間違える
      QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [2],
        correctOptions: [1],
      });
      expect(QuizStateManager.getReviewQuestions()).toHaveLength(1);

      // 復習で正解
      QuizStateManager.markReviewComplete({
        categoryId: "programming",
        questionIndex: 0,
      });
      expect(QuizStateManager.getReviewQuestions()).toHaveLength(0);
    });
  });

  describe("正答率計算", () => {
    beforeEach(() => {
      QuizStateManager.startQuiz("programming", 10);
    });

    it("正答率を正確に計算できる", () => {
      // 3問中2問正解
      QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [1],
        correctOptions: [1],
      }); // 正解
      QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 1,
        selectedOptions: [2],
        correctOptions: [1],
      }); // 不正解
      QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 2,
        selectedOptions: [3],
        correctOptions: [3],
      }); // 正解

      const accuracy = QuizStateManager.calculateAccuracy("programming");
      expect(accuracy).toBeCloseTo(66.67, 1);
    });

    it("回答がない場合は0%を返す", () => {
      const accuracy = QuizStateManager.calculateAccuracy("programming");
      expect(accuracy).toBe(0);
    });
  });

  describe("進捗リセット", () => {
    beforeEach(() => {
      QuizStateManager.startQuiz("programming", 10);
      QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [2],
        correctOptions: [1],
      }); // 不正解で復習対象追加
    });

    it("カテゴリの進捗を完全にリセットできる", () => {
      QuizStateManager.resetCategoryProgress("programming");

      expect(
        QuizStateManager.getCategoryProgress("programming"),
      ).toBeUndefined();
      expect(QuizStateManager.getReviewQuestions()).toHaveLength(0);
    });
  });

  describe("復習モードでの進捗カウント問題 (Issue #28)", () => {
    beforeEach(() => {
      // 2問のクイズを開始
      QuizStateManager.startQuiz("programming", 2);

      // 問題1を不正解
      QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [2],
        correctOptions: [1],
      });

      // 問題2を正解
      QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 1,
        selectedOptions: [1],
        correctOptions: [1],
      });

      // クイズ完了
      QuizStateManager.nextQuestion({
        categoryId: "programming",
        totalQuestions: 2,
      });
      QuizStateManager.nextQuestion({
        categoryId: "programming",
        totalQuestions: 2,
      });
    });

    it("復習モードで回答しても進捗カウント（answers.length）は増加しない", () => {
      // 初期状態確認: 2問回答済み
      const initialProgress =
        QuizStateManager.getCategoryProgress("programming");
      expect(initialProgress?.answers).toHaveLength(2);

      // 復習モードで間違えた問題を再度回答（新しい復習専用メソッドを使用）
      QuizStateManager.submitReviewAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [1], // 今度は正解
        correctOptions: [1],
      });

      // BUG: 現在は進捗に追加されてしまう（3/2の状態）
      const afterReviewProgress =
        QuizStateManager.getCategoryProgress("programming");

      // 期待される挙動: 復習で回答しても進捗カウントは増加しない
      expect(afterReviewProgress?.answers).toHaveLength(2); // 現在は3になってしまう（バグ）
    });

    it("復習モードで正解しても元の進捗の正答率計算は変わらない", () => {
      // 初期正答率確認: 2問中1問正解 = 50%
      const initialAccuracy = QuizStateManager.calculateAccuracy("programming");
      expect(initialAccuracy).toBe(50.0);

      // 復習モードで間違えた問題を正解
      QuizStateManager.submitReviewAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [1],
        correctOptions: [1],
      });

      // 期待される挙動: 復習での正解は元の進捗の正答率には影響しない
      const afterReviewAccuracy =
        QuizStateManager.calculateAccuracy("programming");

      // BUG: 現在は3問中2問正解として計算され66.67%になってしまう
      expect(afterReviewAccuracy).toBe(50.0); // 現在は66.67になってしまう（バグ）
    });

    it("復習で正解した場合、復習対象からは除外される（既存の正しい挙動）", () => {
      // 復習対象が1つあることを確認
      expect(QuizStateManager.getReviewQuestions()).toHaveLength(1);

      // 復習で正解（submitReviewAnswerは自動的に復習完了をマークする）
      QuizStateManager.submitReviewAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [1],
        correctOptions: [1],
      });

      // 復習対象から除外されることを確認（これは正しく動作している）
      expect(QuizStateManager.getReviewQuestions()).toHaveLength(0);
    });
  });

  describe("LocalStorage連携", () => {
    it("データがLocalStorageに永続化される", () => {
      QuizStateManager.startQuiz("programming", 10);
      QuizStateManager.submitAnswer({
        categoryId: "programming",
        questionIndex: 0,
        selectedOptions: [1],
        correctOptions: [1],
      });

      // setItemが呼ばれていることを確認（@solid-primitives/storageが内部で使用）
      expect(localStorageMock.setItem).toHaveBeenCalled();

      // 状態が正しく保存されていることを確認
      const progress = QuizStateManager.getCategoryProgress("programming");
      expect(progress).toBeDefined();
      expect(progress?.answers).toHaveLength(1);
    });
  });

  describe("updateReviewListOnCompletion", () => {
    it("全問正解の場合、復習リストがクリアされる", () => {
      // 初期設定: 2問のクイズで1問不正解
      QuizStateManager.startQuiz("math", 2);

      // 問題1を不正解
      QuizStateManager.submitAnswer({
        categoryId: "math",
        questionIndex: 0,
        selectedOptions: [0],
        correctOptions: [1],
      });

      // 問題2を正解
      QuizStateManager.submitAnswer({
        categoryId: "math",
        questionIndex: 1,
        selectedOptions: [2],
        correctOptions: [2],
      });

      // 復習リストに1問あることを確認
      expect(QuizStateManager.getReviewQuestions()).toHaveLength(1);

      // クイズを再開して全問正解
      QuizStateManager.startQuiz("math", 2);

      // 問題1を正解
      QuizStateManager.submitAnswer({
        categoryId: "math",
        questionIndex: 0,
        selectedOptions: [1],
        correctOptions: [1],
      });

      // 問題2を正解
      QuizStateManager.submitAnswer({
        categoryId: "math",
        questionIndex: 1,
        selectedOptions: [2],
        correctOptions: [2],
      });

      // クイズ完了時に復習リストを更新
      QuizStateManager.updateReviewListOnCompletion("math");

      // 復習リストがクリアされていることを確認
      expect(QuizStateManager.getReviewQuestions()).toHaveLength(0);
    });

    it("不正解がある場合、復習リストが新しい不正解問題で更新される", () => {
      // 初期設定: 2問のクイズで問題1を不正解
      QuizStateManager.startQuiz("science", 2);

      // 問題1を不正解
      QuizStateManager.submitAnswer({
        categoryId: "science",
        questionIndex: 0,
        selectedOptions: [0],
        correctOptions: [1],
      });

      // 問題2を正解
      QuizStateManager.submitAnswer({
        categoryId: "science",
        questionIndex: 1,
        selectedOptions: [2],
        correctOptions: [2],
      });

      // 復習リストに問題1があることを確認
      const initialReview = QuizStateManager.getReviewQuestions();
      expect(initialReview).toHaveLength(1);
      expect(initialReview[0].questionIndex).toBe(0);

      // クイズを再開して今度は問題2を不正解
      QuizStateManager.startQuiz("science", 2);

      // 問題1を正解
      QuizStateManager.submitAnswer({
        categoryId: "science",
        questionIndex: 0,
        selectedOptions: [1],
        correctOptions: [1],
      });

      // 問題2を不正解
      QuizStateManager.submitAnswer({
        categoryId: "science",
        questionIndex: 1,
        selectedOptions: [0],
        correctOptions: [2],
      });

      // クイズ完了時に復習リストを更新
      QuizStateManager.updateReviewListOnCompletion("science");

      // 復習リストが問題2のみになっていることを確認
      const updatedReview = QuizStateManager.getReviewQuestions();
      expect(updatedReview).toHaveLength(1);
      expect(updatedReview[0].questionIndex).toBe(1);
    });

    it("他のカテゴリの復習リストには影響しない", () => {
      // カテゴリ1で不正解
      QuizStateManager.startQuiz("category1", 1);
      QuizStateManager.submitAnswer({
        categoryId: "category1",
        questionIndex: 0,
        selectedOptions: [0],
        correctOptions: [1],
      });

      // カテゴリ2で不正解
      QuizStateManager.startQuiz("category2", 1);
      QuizStateManager.submitAnswer({
        categoryId: "category2",
        questionIndex: 0,
        selectedOptions: [0],
        correctOptions: [1],
      });

      // 両カテゴリの復習リストがあることを確認
      expect(QuizStateManager.getReviewQuestions()).toHaveLength(2);

      // カテゴリ1を再実施して全問正解
      QuizStateManager.startQuiz("category1", 1);
      QuizStateManager.submitAnswer({
        categoryId: "category1",
        questionIndex: 0,
        selectedOptions: [1],
        correctOptions: [1],
      });

      // カテゴリ1の復習リストを更新
      QuizStateManager.updateReviewListOnCompletion("category1");

      // カテゴリ2の復習リストは残っていることを確認
      const remainingReview = QuizStateManager.getReviewQuestions();
      expect(remainingReview).toHaveLength(1);
      expect(remainingReview[0].categoryId).toBe("category2");
    });
  });
});
