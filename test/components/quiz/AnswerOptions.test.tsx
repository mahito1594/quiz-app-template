import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AnswerOptions from "../../../src/components/quiz/AnswerOptions.jsx";
import type { Question } from "../../../src/schema/quiz.js";

/**
 * テスト用の単一選択問題データ
 */
const mockSingleQuestion: Question = {
  question: "これは単一選択問題です",
  type: "single",
  options: ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
  correct: [0],
  explanation: "説明文",
};

/**
 * テスト用の複数選択問題データ
 */
const mockMultipleQuestion: Question = {
  question: "これは複数選択問題です",
  type: "multiple",
  options: ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
  correct: [0, 2],
  explanation: "説明文",
};

describe("AnswerOptions", () => {
  describe("単一選択問題", () => {
    it("4つの選択肢が表示される", () => {
      render(() => (
        <AnswerOptions
          question={mockSingleQuestion}
          selectedOptions={[]}
          onSelectionChange={vi.fn()}
          isAnswered={false}
        />
      ));

      expect(screen.getByText("選択肢A")).toBeInTheDocument();
      expect(screen.getByText("選択肢B")).toBeInTheDocument();
      expect(screen.getByText("選択肢C")).toBeInTheDocument();
      expect(screen.getByText("選択肢D")).toBeInTheDocument();
    });

    it("選択肢をクリックすると選択される", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();

      render(() => (
        <AnswerOptions
          question={mockSingleQuestion}
          selectedOptions={[]}
          onSelectionChange={onSelectionChange}
          isAnswered={false}
        />
      ));

      const optionA = screen.getByText("選択肢A").closest("button");
      expect(optionA).not.toBeNull();

      if (optionA) {
        await user.click(optionA);
      }

      expect(onSelectionChange).toHaveBeenCalledWith([0]);
    });

    it("別の選択肢をクリックすると前の選択が解除される", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();

      render(() => (
        <AnswerOptions
          question={mockSingleQuestion}
          selectedOptions={[0]}
          onSelectionChange={onSelectionChange}
          isAnswered={false}
        />
      ));

      const optionB = screen.getByText("選択肢B").closest("button");
      expect(optionB).not.toBeNull();

      // biome-ignore lint/style/noNonNullAssertion: テストでnullチェック済み、クリック動作の確実性のためassertion使用
      await user.click(optionB!);

      expect(onSelectionChange).toHaveBeenCalledWith([1]);
    });

    it("回答済みの場合、選択を変更できない", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();

      render(() => (
        <AnswerOptions
          question={mockSingleQuestion}
          selectedOptions={[0]}
          onSelectionChange={onSelectionChange}
          isAnswered={true}
          correctOptions={[0]}
        />
      ));

      const optionB = screen.getByText("選択肢B").closest("button");
      expect(optionB).not.toBeNull();

      // biome-ignore lint/style/noNonNullAssertion: テストでnullチェック済み、クリック動作の確実性のためassertion使用
      await user.click(optionB!);

      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it("正解の選択肢には✓アイコンが表示される", () => {
      render(() => (
        <AnswerOptions
          question={mockSingleQuestion}
          selectedOptions={[0]}
          onSelectionChange={vi.fn()}
          isAnswered={true}
          correctOptions={[0]}
        />
      ));

      const checkIcon = screen.getByLabelText("正解");
      expect(checkIcon).toBeInTheDocument();
      // SVGアイコンの場合はクラス名で確認
      expect(checkIcon).toHaveClass("tabler-icon-check");
    });

    it("不正解の選択肢には✗アイコンが表示される", () => {
      render(() => (
        <AnswerOptions
          question={mockSingleQuestion}
          selectedOptions={[1]}
          onSelectionChange={vi.fn()}
          isAnswered={true}
          correctOptions={[0]}
        />
      ));

      const errorIcon = screen.getByLabelText("不正解");
      expect(errorIcon).toBeInTheDocument();
      // SVGアイコンの場合はクラス名で確認
      expect(errorIcon).toHaveClass("tabler-icon-x");
    });
  });

  describe("複数選択問題", () => {
    it("複数の選択肢を選択できる", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();

      render(() => (
        <AnswerOptions
          question={mockMultipleQuestion}
          selectedOptions={[]}
          onSelectionChange={onSelectionChange}
          isAnswered={false}
        />
      ));

      const optionA = screen.getByText("選択肢A").closest("button");
      const optionC = screen.getByText("選択肢C").closest("button");

      expect(optionA).not.toBeNull();
      expect(optionC).not.toBeNull();

      // biome-ignore lint/style/noNonNullAssertion: テストでnullチェック済み、クリック動作の確実性のためassertion使用
      await user.click(optionA!);
      expect(onSelectionChange).toHaveBeenCalledWith([0]);

      // 2番目の選択をテスト（オプションCをクリック）
      onSelectionChange.mockClear();
      // biome-ignore lint/style/noNonNullAssertion: テストでnullチェック済み、クリック動作の確実性のためassertion使用
      await user.click(optionC!);
      expect(onSelectionChange).toHaveBeenCalledWith([2]);
    });

    it("既選択の選択肢をクリックすると選択解除される", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();

      render(() => (
        <AnswerOptions
          question={mockMultipleQuestion}
          selectedOptions={[0, 2]}
          onSelectionChange={onSelectionChange}
          isAnswered={false}
        />
      ));

      const optionA = screen.getByText("選択肢A").closest("button");
      expect(optionA).not.toBeNull();

      if (optionA) {
        await user.click(optionA);
      }

      expect(onSelectionChange).toHaveBeenCalledWith([2]);
    });

    it("複数選択の説明文が表示される", () => {
      render(() => (
        <AnswerOptions
          question={mockMultipleQuestion}
          selectedOptions={[]}
          onSelectionChange={vi.fn()}
          isAnswered={false}
        />
      ));

      expect(
        screen.getByText(
          "正しいと思う選択肢をすべて選んでください。複数選択可能です。",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("回答後の表示", () => {
    it("選択肢の状態が正しく表示される", () => {
      render(() => (
        <AnswerOptions
          question={mockMultipleQuestion}
          selectedOptions={[0, 1]}
          onSelectionChange={vi.fn()}
          isAnswered={true}
          correctOptions={[0, 2]}
        />
      ));

      // 正解・不正解のアイコンが表示されることを確認（複数ある場合はgetAllByを使用）
      expect(screen.getAllByLabelText("正解")).toHaveLength(2); // 選択肢AとCが正解
      expect(screen.getByLabelText("不正解")).toBeInTheDocument(); // 選択肢Bが不正解
    });

    it("未選択の場合は正解のアイコンのみ表示される", () => {
      render(() => (
        <AnswerOptions
          question={mockSingleQuestion}
          selectedOptions={[]}
          onSelectionChange={vi.fn()}
          isAnswered={true}
          correctOptions={[0]}
        />
      ));

      // 正解のアイコンが1つ表示されることを確認
      expect(screen.getAllByLabelText("正解")).toHaveLength(1);
      // 不正解のアイコンは表示されないことを確認
      expect(screen.queryByLabelText("不正解")).not.toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    describe("ARIA属性", () => {
      it("選択肢グループに適切なroleとaria属性が設定される", () => {
        render(() => (
          <AnswerOptions
            question={mockMultipleQuestion}
            selectedOptions={[]}
            onSelectionChange={vi.fn()}
            isAnswered={false}
          />
        ));

        const group = screen.getByRole("group");
        expect(group).toHaveAttribute(
          "aria-labelledby",
          "question-options-title",
        );
        expect(group).toHaveAttribute("aria-describedby", "selection-help");
      });

      it("各選択肢ボタンにaria-pressedが正しく設定される", () => {
        render(() => (
          <AnswerOptions
            question={mockMultipleQuestion}
            selectedOptions={[0, 2]}
            onSelectionChange={vi.fn()}
            isAnswered={false}
          />
        ));

        const buttons = screen.getAllByRole("button");
        expect(buttons[0]).toHaveAttribute("aria-pressed", "true"); // 選択肢A (選択済み)
        expect(buttons[1]).toHaveAttribute("aria-pressed", "false"); // 選択肢B (未選択)
        expect(buttons[2]).toHaveAttribute("aria-pressed", "true"); // 選択肢C (選択済み)
        expect(buttons[3]).toHaveAttribute("aria-pressed", "false"); // 選択肢D (未選択)
      });

      it("各選択肢ボタンに適切なaria-labelが設定される", () => {
        render(() => (
          <AnswerOptions
            question={mockMultipleQuestion}
            selectedOptions={[0]}
            onSelectionChange={vi.fn()}
            isAnswered={false}
          />
        ));

        const buttons = screen.getAllByRole("button");
        expect(buttons[0]).toHaveAttribute("aria-label", "選択肢A (選択済み)");
        expect(buttons[1]).toHaveAttribute("aria-label", "選択肢B");
        expect(buttons[2]).toHaveAttribute("aria-label", "選択肢C");
        expect(buttons[3]).toHaveAttribute("aria-label", "選択肢D");
      });

      it("回答済みの場合はaria-describedbyが削除される", () => {
        render(() => (
          <AnswerOptions
            question={mockSingleQuestion}
            selectedOptions={[0]}
            onSelectionChange={vi.fn()}
            isAnswered={true}
            correctOptions={[0]}
          />
        ));

        const buttons = screen.getAllByRole("button");
        buttons.forEach((button) => {
          expect(button).not.toHaveAttribute("aria-describedby");
        });
      });
    });

    describe("セマンティック構造", () => {
      it("選択肢タイトルに適切なIDが設定される", () => {
        render(() => (
          <AnswerOptions
            question={mockSingleQuestion}
            selectedOptions={[]}
            onSelectionChange={vi.fn()}
            isAnswered={false}
          />
        ));

        const title = screen.getByText("選択肢");
        expect(title).toHaveAttribute("id", "question-options-title");
      });

      it("選択説明に適切なIDが設定される", () => {
        render(() => (
          <AnswerOptions
            question={mockSingleQuestion}
            selectedOptions={[]}
            onSelectionChange={vi.fn()}
            isAnswered={false}
          />
        ));

        const help = screen.getByText(
          "1つの選択肢を選んでください。",
        ).parentElement;
        expect(help).toHaveAttribute("id", "selection-help");
      });
    });
  });
});
