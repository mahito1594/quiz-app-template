import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import QuizResult from "../../src/components/QuizResult.js";
import { RouterWrapper } from "../helpers/router-wrapper.js";

// vi.hoisted() を使用してモック変数を適切な順序で初期化
const { mockQuizData, mockQuizStateManager, mockParams, mockNavigate } =
  vi.hoisted(() => {
    // QuizDataContextのモック
    const mockQuizData = {
      metadata: {
        version: "1.0.0",
        title: "テスト問題集",
        lastUpdated: "2025-01-01",
        totalQuestions: 2,
        description: "テスト用",
      },
      categories: [
        {
          id: "test-category",
          name: "テストカテゴリ",
          description: "テスト用カテゴリ",
          order: 1,
          questions: [
            {
              type: "single" as const,
              question: "テスト問題1",
              options: ["選択肢1", "選択肢2"],
              correct: [0],
              explanation: "説明1",
            },
            {
              type: "single" as const,
              question: "テスト問題2",
              options: ["選択肢A", "選択肢B"],
              correct: [1],
              explanation: "説明2",
            },
          ],
        },
      ],
    };

    // quiz-store のモック
    const mockQuizStateManager = {
      getCategoryProgress: vi.fn(),
      resetCategoryProgress: vi.fn(),
    };

    // ルーターパラメータのモック
    const mockParams = {
      categoryId: "test-category",
    };

    // useNavigate のモック
    const mockNavigate = vi.fn();

    return {
      mockQuizData,
      mockQuizStateManager,
      mockParams,
      mockNavigate,
    };
  });

// モック設定
vi.mock("../../src/context/QuizDataContext.js", () => ({
  useQuizData: () => ({ quizData: mockQuizData }),
}));

vi.mock("../../src/stores/quiz-store.js", () => ({
  quizStateManager: mockQuizStateManager,
}));

vi.mock("@solidjs/router", async () => {
  const actual = await vi.importActual("@solidjs/router");
  return {
    ...actual,
    useParams: () => mockParams,
    useNavigate: () => mockNavigate,
  };
});

describe("QuizResult", () => {
  describe("Navigation links and buttons", () => {
    it("should render home link with correct href", () => {
      // 正常な進捗データをモック
      mockQuizStateManager.getCategoryProgress.mockReturnValue({
        categoryId: "test-category",
        currentQuestionIndex: 2,
        answers: [
          { questionIndex: 0, selectedOptions: [0], isCorrect: true },
          { questionIndex: 1, selectedOptions: [1], isCorrect: true },
        ],
        completedAt: new Date().toISOString(),
        totalQuestions: 2,
      });

      render(() => (
        <RouterWrapper>
          <QuizResult />
        </RouterWrapper>
      ));

      // ホームに戻るリンクが正しいhrefを持っていることを確認
      const homeLink = screen.getByRole("link", { name: "ホームに戻る" });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("should render retry button", () => {
      // 正常な進捗データをモック
      mockQuizStateManager.getCategoryProgress.mockReturnValue({
        categoryId: "test-category",
        currentQuestionIndex: 2,
        answers: [
          { questionIndex: 0, selectedOptions: [0], isCorrect: true },
          { questionIndex: 1, selectedOptions: [1], isCorrect: true },
        ],
        completedAt: new Date().toISOString(),
        totalQuestions: 2,
      });

      render(() => (
        <RouterWrapper>
          <QuizResult />
        </RouterWrapper>
      ));

      // 再挑戦ボタンが存在することを確認
      const retryButton = screen.getByRole("button", { name: "再挑戦" });
      expect(retryButton).toBeInTheDocument();
    });

    it("should render review link when there are incorrect answers", () => {
      // 不正解を含む進捗データをモック
      mockQuizStateManager.getCategoryProgress.mockReturnValue({
        categoryId: "test-category",
        currentQuestionIndex: 2,
        answers: [
          { questionIndex: 0, selectedOptions: [1], isCorrect: false },
          { questionIndex: 1, selectedOptions: [0], isCorrect: false },
        ],
        completedAt: new Date().toISOString(),
        totalQuestions: 2,
      });

      render(() => (
        <RouterWrapper>
          <QuizResult />
        </RouterWrapper>
      ));

      // 復習ボタンが表示されることを確認
      const reviewLinks = screen.getAllByRole("link", { name: "復習する" });
      expect(reviewLinks.length).toBeGreaterThan(0);

      // 復習リンクが正しいhrefを持っていることを確認
      reviewLinks.forEach((link) => {
        expect(link).toHaveAttribute("href", "/review");
      });
    });

    it("should not render review link when all answers are correct", () => {
      // 全問正解の進捗データをモック
      mockQuizStateManager.getCategoryProgress.mockReturnValue({
        categoryId: "test-category",
        currentQuestionIndex: 2,
        answers: [
          { questionIndex: 0, selectedOptions: [0], isCorrect: true },
          { questionIndex: 1, selectedOptions: [1], isCorrect: true },
        ],
        completedAt: new Date().toISOString(),
        totalQuestions: 2,
      });

      render(() => (
        <RouterWrapper>
          <QuizResult />
        </RouterWrapper>
      ));

      // 復習ボタンが表示されないことを確認
      const reviewLinks = screen.queryAllByRole("link", { name: "復習する" });
      expect(reviewLinks).toHaveLength(0);
    });
  });

  describe("Error handling", () => {
    it("should render error message and home button when category is not found", () => {
      // 進捗データはあるが、カテゴリが見つからない場合
      mockQuizStateManager.getCategoryProgress.mockReturnValue({
        categoryId: "test-category",
        currentQuestionIndex: 2,
        answers: [],
        completedAt: new Date().toISOString(),
        totalQuestions: 2,
      });

      // 存在しないカテゴリIDを設定
      mockParams.categoryId = "nonexistent-category";

      render(() => (
        <RouterWrapper>
          <QuizResult />
        </RouterWrapper>
      ));

      // エラーメッセージが表示されることを確認
      expect(
        screen.getByText(
          'エラー: カテゴリ "nonexistent-category" が見つかりません',
        ),
      ).toBeInTheDocument();

      // ホームに戻るボタンが表示されることを確認
      const homeButton = screen.getByRole("button", { name: "ホームに戻る" });
      expect(homeButton).toBeInTheDocument();
    });

    it("should render error message when progress data is missing", () => {
      // 進捗データがない場合
      mockQuizStateManager.getCategoryProgress.mockReturnValue(null);
      mockParams.categoryId = "test-category";

      render(() => (
        <RouterWrapper>
          <QuizResult />
        </RouterWrapper>
      ));

      // エラーメッセージが表示されることを確認
      expect(
        screen.getByText("エラー: クイズの進捗データが見つかりません"),
      ).toBeInTheDocument();

      // ホームに戻るボタンが表示されることを確認
      const homeButton = screen.getByRole("button", { name: "ホームに戻る" });
      expect(homeButton).toBeInTheDocument();
    });
  });

  describe("Retry button functionality", () => {
    it("should call resetCategoryProgress and navigate when retry button is clicked", async () => {
      // 正常な進捗データをモック（テスト前に設定）
      mockQuizStateManager.getCategoryProgress.mockReturnValue({
        categoryId: "test-category",
        currentQuestionIndex: 2,
        answers: [{ questionIndex: 0, selectedOptions: [0], isCorrect: true }],
        completedAt: new Date().toISOString(),
        totalQuestions: 2,
      });

      render(() => (
        <RouterWrapper>
          <QuizResult />
        </RouterWrapper>
      ));

      const retryButton = screen.getByRole("button", { name: "再挑戦" });
      retryButton.click();

      // resetCategoryProgressが呼ばれることを確認
      expect(mockQuizStateManager.resetCategoryProgress).toHaveBeenCalledWith(
        "test-category",
      );
      // navigateが呼ばれることを確認
      expect(mockNavigate).toHaveBeenCalledWith("/quiz/test-category");
    });
  });
});
