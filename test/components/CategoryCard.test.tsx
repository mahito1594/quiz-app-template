import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import type { CategoryCardProps } from "../../src/components/CategoryCard.js";
import CategoryCard from "../../src/components/CategoryCard.js";
import type { Category } from "../../src/schema/quiz.js";
import { RouterWrapper } from "../helpers/router-wrapper.js";

/**
 * テスト用のカテゴリデータ
 */
const mockCategory: Category = {
  id: "test-category",
  name: "テストカテゴリ",
  description: "これはテスト用のカテゴリです",
  order: 1,
  questions: [
    {
      question: "問題1",
      type: "single",
      options: ["選択肢1", "選択肢2"],
      correct: [0],
      explanation: "説明1",
    },
    {
      question: "問題2",
      type: "multiple",
      options: ["選択肢A", "選択肢B", "選択肢C"],
      correct: [0, 2],
      explanation: "説明2",
    },
  ],
};

/**
 * テスト用の進捗データ（未開始）
 */
const notStartedProgress: CategoryCardProps["progress"] = {
  hasProgress: false,
  isCompleted: false,
  currentQuestion: 0,
  totalAnswered: 0,
  accuracy: 0,
};

/**
 * テスト用の進捗データ（進行中）
 */
const inProgressData: CategoryCardProps["progress"] = {
  hasProgress: true,
  isCompleted: false,
  currentQuestion: 1,
  totalAnswered: 1,
  accuracy: 100.0,
};

/**
 * テスト用の進捗データ（完了）
 */
const completedProgress: CategoryCardProps["progress"] = {
  hasProgress: true,
  isCompleted: true,
  currentQuestion: 2,
  totalAnswered: 2,
  accuracy: 50.0,
};

describe("CategoryCard", () => {
  describe("基本表示", () => {
    it("カテゴリ名が表示される", () => {
      render(
        () => (
          <CategoryCard category={mockCategory} progress={notStartedProgress} />
        ),
        { wrapper: RouterWrapper },
      );

      expect(screen.getByText("テストカテゴリ")).toBeInTheDocument();
    });

    it("カテゴリの説明が表示される", () => {
      render(
        () => (
          <CategoryCard category={mockCategory} progress={notStartedProgress} />
        ),
        { wrapper: RouterWrapper },
      );

      expect(
        screen.getByText("これはテスト用のカテゴリです"),
      ).toBeInTheDocument();
    });

    it("問題数が表示される", () => {
      render(
        () => (
          <CategoryCard category={mockCategory} progress={notStartedProgress} />
        ),
        { wrapper: RouterWrapper },
      );

      expect(screen.getByText("問題数")).toBeInTheDocument();
      expect(screen.getByText("2問")).toBeInTheDocument();
    });
  });

  describe("未開始状態", () => {
    it("未開始バッジが表示される", () => {
      render(
        () => (
          <CategoryCard category={mockCategory} progress={notStartedProgress} />
        ),
        { wrapper: RouterWrapper },
      );

      expect(screen.getByText("未開始")).toBeInTheDocument();
    });

    it("開始ボタンが表示される", () => {
      render(
        () => (
          <CategoryCard category={mockCategory} progress={notStartedProgress} />
        ),
        { wrapper: RouterWrapper },
      );

      const startLink = screen.getByText("開始");
      expect(startLink).toBeInTheDocument();
      expect(startLink.closest("a")).toHaveAttribute(
        "href",
        "/quiz/test-category",
      );
    });

    it("進捗情報が表示されない", () => {
      render(
        () => (
          <CategoryCard category={mockCategory} progress={notStartedProgress} />
        ),
        { wrapper: RouterWrapper },
      );

      expect(screen.queryByText("進捗")).not.toBeInTheDocument();
      expect(screen.queryByText("正答率")).not.toBeInTheDocument();
    });
  });

  describe("進行中状態", () => {
    it("進行中バッジが表示される", () => {
      render(
        () => (
          <CategoryCard category={mockCategory} progress={inProgressData} />
        ),
        { wrapper: RouterWrapper },
      );

      expect(screen.getByText("進行中")).toBeInTheDocument();
    });

    it("続きからボタンが表示される", () => {
      render(
        () => (
          <CategoryCard category={mockCategory} progress={inProgressData} />
        ),
        { wrapper: RouterWrapper },
      );

      const resumeLink = screen.getByText("続きから");
      expect(resumeLink).toBeInTheDocument();
      expect(resumeLink.closest("a")).toHaveAttribute(
        "href",
        "/quiz/test-category",
      );
    });

    it("進捗情報が表示される", () => {
      render(
        () => (
          <CategoryCard category={mockCategory} progress={inProgressData} />
        ),
        { wrapper: RouterWrapper },
      );

      expect(screen.getByText("進捗")).toBeInTheDocument();
      expect(screen.getByText("1 / 2")).toBeInTheDocument();
    });

    it("正答率が表示される", () => {
      render(
        () => (
          <CategoryCard category={mockCategory} progress={inProgressData} />
        ),
        { wrapper: RouterWrapper },
      );

      expect(screen.getByText("正答率")).toBeInTheDocument();
      expect(screen.getByText("100.0%")).toBeInTheDocument();
    });
  });

  describe("完了状態", () => {
    it("完了バッジが表示される", () => {
      render(
        () => (
          <CategoryCard category={mockCategory} progress={completedProgress} />
        ),
        { wrapper: RouterWrapper },
      );

      expect(screen.getByText("完了")).toBeInTheDocument();
    });

    it("もう一度ボタンが表示される", () => {
      render(
        () => (
          <CategoryCard category={mockCategory} progress={completedProgress} />
        ),
        { wrapper: RouterWrapper },
      );

      const retryLink = screen.getByText("もう一度");
      expect(retryLink).toBeInTheDocument();
      expect(retryLink.closest("a")).toHaveAttribute(
        "href",
        "/quiz/test-category",
      );
    });

    it("進捗情報が完了として表示される", () => {
      render(
        () => (
          <CategoryCard category={mockCategory} progress={completedProgress} />
        ),
        { wrapper: RouterWrapper },
      );

      expect(screen.getByText("進捗")).toBeInTheDocument();
      expect(screen.getByText("2 / 2")).toBeInTheDocument();
    });

    it("最終的な正答率が表示される", () => {
      render(
        () => (
          <CategoryCard category={mockCategory} progress={completedProgress} />
        ),
        { wrapper: RouterWrapper },
      );

      expect(screen.getByText("正答率")).toBeInTheDocument();
      expect(screen.getByText("50.0%")).toBeInTheDocument();
    });
  });

  describe("エッジケース", () => {
    it("進捗はあるが回答数が0の場合、正答率が表示されない", () => {
      const edgeProgress: CategoryCardProps["progress"] = {
        hasProgress: true,
        isCompleted: false,
        currentQuestion: 0,
        totalAnswered: 0,
        accuracy: 0,
      };

      render(
        () => <CategoryCard category={mockCategory} progress={edgeProgress} />,
        { wrapper: RouterWrapper },
      );

      expect(screen.queryByText("正答率")).not.toBeInTheDocument();
    });
  });
});
