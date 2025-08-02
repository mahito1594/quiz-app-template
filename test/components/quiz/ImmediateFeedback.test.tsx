import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ImmediateFeedback from "../../../src/components/quiz/ImmediateFeedback.jsx";
import type { Question } from "../../../src/schema/quiz.js";

/**
 * テスト用の問題データ
 */
const mockQuestion: Question = {
  question: "これはテスト問題です",
  type: "single",
  options: ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
  correct: [0],
  explanation: "これは**解説**文です。正解は選択肢Aです。",
};

const mockMultipleQuestion: Question = {
  question: "これは複数選択問題です",
  type: "multiple",
  options: ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
  correct: [0, 2],
  explanation: "選択肢AとCが正解です。",
};

describe("ImmediateFeedback", () => {
  describe("正解時の表示", () => {
    it("正解時のメッセージとアイコンが表示される", () => {
      render(() => (
        <ImmediateFeedback
          question={mockQuestion}
          isCorrect={true}
          selectedOptions={[0]}
          correctOptions={[0]}
          showNextButton={true}
          onNext={vi.fn()}
          onFinish={vi.fn()}
          isLastQuestion={false}
        />
      ));

      expect(screen.getByText("正解です！")).toBeInTheDocument();
      expect(screen.getByText("よくできました！")).toBeInTheDocument();
      expect(screen.getByText("🎉")).toBeInTheDocument();
    });

    it("正解時は成功カラーのスタイルが適用される", () => {
      render(() => (
        <ImmediateFeedback
          question={mockQuestion}
          isCorrect={true}
          selectedOptions={[0]}
          correctOptions={[0]}
          showNextButton={true}
          onNext={vi.fn()}
          onFinish={vi.fn()}
          isLastQuestion={false}
        />
      ));

      const cardElement = document.querySelector(".card");
      expect(cardElement).toHaveClass("bg-success");
      expect(cardElement).toHaveClass("border-success");
    });
  });

  describe("不正解時の表示", () => {
    it("不正解時のメッセージとアイコンが表示される", () => {
      render(() => (
        <ImmediateFeedback
          question={mockQuestion}
          isCorrect={false}
          selectedOptions={[1]}
          correctOptions={[0]}
          showNextButton={true}
          onNext={vi.fn()}
          onFinish={vi.fn()}
          isLastQuestion={false}
        />
      ));

      expect(screen.getByText("不正解です")).toBeInTheDocument();
      expect(
        screen.getByText("惜しい！解説を確認しましょう。"),
      ).toBeInTheDocument();
      expect(screen.getByText("😞")).toBeInTheDocument();
    });

    it("不正解時はエラーカラーのスタイルが適用される", () => {
      render(() => (
        <ImmediateFeedback
          question={mockQuestion}
          isCorrect={false}
          selectedOptions={[1]}
          correctOptions={[0]}
          showNextButton={true}
          onNext={vi.fn()}
          onFinish={vi.fn()}
          isLastQuestion={false}
        />
      ));

      const cardElement = document.querySelector(".card");
      expect(cardElement).toHaveClass("bg-error");
      expect(cardElement).toHaveClass("border-error");
    });

    it("不正解時は励ましメッセージが表示される", () => {
      render(() => (
        <ImmediateFeedback
          question={mockQuestion}
          isCorrect={false}
          selectedOptions={[1]}
          correctOptions={[0]}
          showNextButton={true}
          onNext={vi.fn()}
          onFinish={vi.fn()}
          isLastQuestion={false}
        />
      ));

      expect(
        screen.getByText(
          /間違えた問題は復習リストに追加されます。後で復習して理解を深めましょう！/,
        ),
      ).toBeInTheDocument();
    });

    it("正解時は励ましメッセージが表示されない", () => {
      render(() => (
        <ImmediateFeedback
          question={mockQuestion}
          isCorrect={true}
          selectedOptions={[0]}
          correctOptions={[0]}
          showNextButton={true}
          onNext={vi.fn()}
          onFinish={vi.fn()}
          isLastQuestion={false}
        />
      ));

      expect(
        screen.queryByText(
          /間違えた問題は復習リストに追加されます。後で復習して理解を深めましょう！/,
        ),
      ).not.toBeInTheDocument();
    });
  });

  describe("回答結果の表示", () => {
    it("単一選択の回答結果が正しく表示される", () => {
      render(() => (
        <ImmediateFeedback
          question={mockQuestion}
          isCorrect={false}
          selectedOptions={[1]}
          correctOptions={[0]}
          showNextButton={true}
          onNext={vi.fn()}
          onFinish={vi.fn()}
          isLastQuestion={false}
        />
      ));

      expect(screen.getByText("あなたの回答:")).toBeInTheDocument();
      expect(screen.getByText("B. 選択肢B")).toBeInTheDocument();
      expect(screen.getByText("正解:")).toBeInTheDocument();
      expect(screen.getByText("A. 選択肢A")).toBeInTheDocument();
    });

    it("複数選択の回答結果が正しく表示される", () => {
      render(() => (
        <ImmediateFeedback
          question={mockMultipleQuestion}
          isCorrect={false}
          selectedOptions={[0, 1]}
          correctOptions={[0, 2]}
          showNextButton={true}
          onNext={vi.fn()}
          onFinish={vi.fn()}
          isLastQuestion={false}
        />
      ));

      expect(screen.getByText("あなたの回答:")).toBeInTheDocument();
      expect(screen.getByText("A. 選択肢A, B. 選択肢B")).toBeInTheDocument();
      expect(screen.getByText("正解:")).toBeInTheDocument();
      expect(screen.getByText("A. 選択肢A, C. 選択肢C")).toBeInTheDocument();
    });

    it("未回答の場合は未回答と表示される", () => {
      render(() => (
        <ImmediateFeedback
          question={mockQuestion}
          isCorrect={false}
          selectedOptions={[]}
          correctOptions={[0]}
          showNextButton={true}
          onNext={vi.fn()}
          onFinish={vi.fn()}
          isLastQuestion={false}
        />
      ));

      expect(screen.getByText("あなたの回答:")).toBeInTheDocument();
      expect(screen.getByText("未回答")).toBeInTheDocument();
    });
  });

  describe("解説の表示", () => {
    it("解説文がMarkdownとして表示される", () => {
      render(() => (
        <ImmediateFeedback
          question={mockQuestion}
          isCorrect={true}
          selectedOptions={[0]}
          correctOptions={[0]}
          showNextButton={true}
          onNext={vi.fn()}
          onFinish={vi.fn()}
          isLastQuestion={false}
        />
      ));

      expect(screen.getByRole("heading", { name: "解説" })).toBeInTheDocument();
      // Markdownの太字が正しくレンダリングされるかチェック
      const strongElement = document.querySelector("strong");
      expect(strongElement).toBeInTheDocument();
      expect(strongElement?.textContent).toBe("解説");
    });
  });

  describe("ナビゲーションボタン", () => {
    it("最後の問題でない場合は「次の問題」ボタンが表示される", () => {
      render(() => (
        <ImmediateFeedback
          question={mockQuestion}
          isCorrect={true}
          selectedOptions={[0]}
          correctOptions={[0]}
          showNextButton={true}
          onNext={vi.fn()}
          onFinish={vi.fn()}
          isLastQuestion={false}
        />
      ));

      expect(screen.getByText("次の問題")).toBeInTheDocument();
      expect(screen.queryByText("結果を見る")).not.toBeInTheDocument();
    });

    it("最後の問題の場合は「結果を見る」ボタンが表示される", () => {
      render(() => (
        <ImmediateFeedback
          question={mockQuestion}
          isCorrect={true}
          selectedOptions={[0]}
          correctOptions={[0]}
          showNextButton={true}
          onNext={vi.fn()}
          onFinish={vi.fn()}
          isLastQuestion={true}
        />
      ));

      expect(screen.getByText("結果を見る")).toBeInTheDocument();
      expect(screen.queryByText("次の問題")).not.toBeInTheDocument();
    });

    it("showNextButtonがfalseの場合はボタンが表示されない", () => {
      render(() => (
        <ImmediateFeedback
          question={mockQuestion}
          isCorrect={true}
          selectedOptions={[0]}
          correctOptions={[0]}
          showNextButton={false}
          onNext={vi.fn()}
          onFinish={vi.fn()}
          isLastQuestion={false}
        />
      ));

      expect(screen.queryByText("次の問題")).not.toBeInTheDocument();
      expect(screen.queryByText("結果を見る")).not.toBeInTheDocument();
    });

    it("「次の問題」ボタンクリック時にonNextが呼ばれる", async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();

      render(() => (
        <ImmediateFeedback
          question={mockQuestion}
          isCorrect={true}
          selectedOptions={[0]}
          correctOptions={[0]}
          showNextButton={true}
          onNext={onNext}
          onFinish={vi.fn()}
          isLastQuestion={false}
        />
      ));

      const nextButton = screen.getByText("次の問題");
      await user.click(nextButton);

      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it("「結果を見る」ボタンクリック時にonFinishが呼ばれる", async () => {
      const user = userEvent.setup();
      const onFinish = vi.fn();

      render(() => (
        <ImmediateFeedback
          question={mockQuestion}
          isCorrect={true}
          selectedOptions={[0]}
          correctOptions={[0]}
          showNextButton={true}
          onNext={vi.fn()}
          onFinish={onFinish}
          isLastQuestion={true}
        />
      ));

      const finishButton = screen.getByText("結果を見る");
      await user.click(finishButton);

      expect(onFinish).toHaveBeenCalledTimes(1);
    });
  });

  describe("アクセシビリティ", () => {
    it("SVGアイコンにaria-labelとtitleが設定されている", () => {
      render(() => (
        <ImmediateFeedback
          question={mockQuestion}
          isCorrect={true}
          selectedOptions={[0]}
          correctOptions={[0]}
          showNextButton={true}
          onNext={vi.fn()}
          onFinish={vi.fn()}
          isLastQuestion={false}
        />
      ));

      const arrowIcon = screen.getByLabelText("矢印");
      expect(arrowIcon).toBeInTheDocument();

      const titleElement = screen.getByTitle("次への矢印");
      expect(titleElement).toBeInTheDocument();
    });
  });
});
