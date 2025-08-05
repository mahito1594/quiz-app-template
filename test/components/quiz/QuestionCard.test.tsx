import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import QuestionCard from "../../../src/components/quiz/QuestionCard.jsx";
import type { Question } from "../../../src/schema/quiz.js";

/**
 * テスト用の単一選択問題データ
 */
const mockSingleQuestion: Question = {
  question: "これは**単一選択**問題です",
  type: "single",
  options: ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
  correct: [0],
  explanation: "説明文",
};

/**
 * テスト用の複数選択問題データ
 */
const mockMultipleQuestion: Question = {
  question: "これは*複数選択*問題です",
  type: "multiple",
  options: ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
  correct: [0, 2],
  explanation: "説明文",
};

describe("QuestionCard", () => {
  describe("基本表示", () => {
    it("問題番号と総問題数が表示される", () => {
      render(() => (
        <QuestionCard
          question={mockSingleQuestion}
          questionNumber={3}
          totalQuestions={10}
          selectedOptions={[]}
          isAnswered={false}
        />
      ));

      expect(screen.getByText("問題 3 / 10")).toBeInTheDocument();
    });

    it("問題文がMarkdownとして表示される", () => {
      render(() => (
        <QuestionCard
          question={mockSingleQuestion}
          questionNumber={1}
          totalQuestions={5}
          selectedOptions={[]}
          isAnswered={false}
        />
      ));

      expect(screen.getByText("問題文")).toBeInTheDocument();
      // Markdownの太字が正しくレンダリングされるかチェック
      const proseContainer = document.querySelector(".prose");
      const strongElement = proseContainer?.querySelector("strong");
      expect(strongElement).toBeTruthy();
      expect(strongElement?.textContent).toBe("単一選択");
    });

    it("単一選択問題のタイプバッジが表示される", () => {
      render(() => (
        <QuestionCard
          question={mockSingleQuestion}
          questionNumber={1}
          totalQuestions={5}
          selectedOptions={[]}
          isAnswered={false}
        />
      ));

      const badge = document.querySelector(".badge.badge-primary");
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe("単一選択");
    });

    it("複数選択問題のタイプバッジが表示される", () => {
      render(() => (
        <QuestionCard
          question={mockMultipleQuestion}
          questionNumber={1}
          totalQuestions={5}
          selectedOptions={[]}
          isAnswered={false}
        />
      ));

      const badge = document.querySelector(".badge.badge-secondary");
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe("複数選択");
    });

    it("単一選択問題のインストラクションが表示される", () => {
      render(() => (
        <QuestionCard
          question={mockSingleQuestion}
          questionNumber={1}
          totalQuestions={5}
          selectedOptions={[]}
          isAnswered={false}
        />
      ));

      expect(
        screen.getByText("以下の選択肢から1つを選んでください。"),
      ).toBeInTheDocument();
    });

    it("複数選択問題のインストラクションが表示される", () => {
      render(() => (
        <QuestionCard
          question={mockMultipleQuestion}
          questionNumber={1}
          totalQuestions={5}
          selectedOptions={[]}
          isAnswered={false}
        />
      ));

      expect(
        screen.getByText("以下の選択肢から適切なものをすべて選んでください。"),
      ).toBeInTheDocument();
    });
  });

  describe("進捗バー", () => {
    it("進捗バーが正しい幅で表示される", () => {
      render(() => (
        <QuestionCard
          question={mockSingleQuestion}
          questionNumber={3}
          totalQuestions={10}
          selectedOptions={[]}
          isAnswered={false}
        />
      ));

      // 進捗バー（30%の幅）が存在することを確認
      const progressBar = document.querySelector(".bg-primary");
      expect(progressBar).toBeTruthy();
      expect(progressBar).toHaveStyle("width: 30%");
    });

    it("最初の問題では10%の進捗", () => {
      render(() => (
        <QuestionCard
          question={mockSingleQuestion}
          questionNumber={1}
          totalQuestions={10}
          selectedOptions={[]}
          isAnswered={false}
        />
      ));

      const progressBar = document.querySelector(".bg-primary");
      expect(progressBar).toHaveStyle("width: 10%");
    });

    it("最後の問題では100%の進捗", () => {
      render(() => (
        <QuestionCard
          question={mockSingleQuestion}
          questionNumber={10}
          totalQuestions={10}
          selectedOptions={[]}
          isAnswered={false}
        />
      ));

      const progressBar = document.querySelector(".bg-primary");
      expect(progressBar).toHaveStyle("width: 100%");
    });
  });

  describe("回答状態", () => {
    it("未回答時は回答状態バッジが表示されない", () => {
      render(() => (
        <QuestionCard
          question={mockSingleQuestion}
          questionNumber={1}
          totalQuestions={5}
          selectedOptions={[]}
          isAnswered={false}
        />
      ));

      expect(screen.queryByText("正解")).not.toBeInTheDocument();
      expect(screen.queryByText("不正解")).not.toBeInTheDocument();
    });

    it("正解時は正解バッジが表示される", () => {
      render(() => (
        <QuestionCard
          question={mockSingleQuestion}
          questionNumber={1}
          totalQuestions={5}
          selectedOptions={[0]}
          isAnswered={true}
          isCorrect={true}
        />
      ));

      expect(screen.getByText("正解")).toBeInTheDocument();
      expect(screen.queryByText("不正解")).not.toBeInTheDocument();
    });

    it("不正解時は不正解バッジが表示される", () => {
      render(() => (
        <QuestionCard
          question={mockSingleQuestion}
          questionNumber={1}
          totalQuestions={5}
          selectedOptions={[1]}
          isAnswered={true}
          isCorrect={false}
        />
      ));

      expect(screen.getByText("不正解")).toBeInTheDocument();
      expect(screen.queryByText("正解")).not.toBeInTheDocument();
    });
  });

  describe("選択状態の表示", () => {
    it("選択肢未選択時はデバッグ情報が表示されない", () => {
      render(() => (
        <QuestionCard
          question={mockSingleQuestion}
          questionNumber={1}
          totalQuestions={5}
          selectedOptions={[]}
          isAnswered={false}
        />
      ));

      expect(screen.queryByText(/選択中:/)).not.toBeInTheDocument();
    });
  });

  describe("Markdownレンダリング", () => {
    it("斜体のテキストが正しくレンダリングされる", () => {
      render(() => (
        <QuestionCard
          question={mockMultipleQuestion}
          questionNumber={1}
          totalQuestions={5}
          selectedOptions={[]}
          isAnswered={false}
        />
      ));

      // Markdownの斜体が正しくレンダリングされるかチェック
      // prose コンテナ内のemタグを探す
      const proseContainer = document.querySelector(".prose");
      const emElement = proseContainer?.querySelector("em");
      expect(emElement).toBeTruthy();
      expect(emElement?.textContent).toBe("複数選択");
    });
  });
});
