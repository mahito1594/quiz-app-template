import { type Component, Show } from "solid-js";
import { SolidMarkdown } from "solid-markdown";
import type { Question } from "../../schema/quiz.js";

export type QuestionCardProps = {
  /** 問題データ */
  question: Question;
  /** 問題番号（1-based） */
  questionNumber: number;
  /** 総問題数 */
  totalQuestions: number;
  /** 現在選択中の選択肢インデックス配列 */
  selectedOptions: number[];
  /** 問題が回答済みかどうか */
  isAnswered: boolean;
  /** 正解かどうか（回答済みの場合のみ有効） */
  isCorrect?: boolean;
};

/**
 * 問題表示カードコンポーネント
 * 問題文、選択肢、進捗情報を表示
 */
const QuestionCard: Component<QuestionCardProps> = (props) => {
  return (
    <div class="card bg-base-100 shadow-lg border">
      <div class="card-body">
        {/* 進捗表示 */}
        <div class="flex justify-between items-center mb-4">
          <div class="text-sm text-base-content/70">
            問題 {props.questionNumber} / {props.totalQuestions}
          </div>
          <div class="flex items-center gap-2">
            {/* 問題タイプバッジ */}
            <div
              class={`badge ${
                props.question.type === "single"
                  ? "badge-primary"
                  : "badge-secondary"
              }`}
            >
              {props.question.type === "single" ? "単一選択" : "複数選択"}
            </div>

            {/* 回答状態バッジ */}
            <Show when={props.isAnswered}>
              <div
                class={`badge ${
                  props.isCorrect ? "badge-success" : "badge-error"
                }`}
              >
                {props.isCorrect ? "正解" : "不正解"}
              </div>
            </Show>
          </div>
        </div>

        {/* 進捗バー */}
        <div class="w-full bg-base-300 rounded-full h-2 mb-6">
          <div
            class="bg-primary h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(props.questionNumber / props.totalQuestions) * 100}%`,
            }}
          />
        </div>

        {/* 問題文 */}
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-3">問題文</h2>
          <div class="prose prose-sm max-w-none">
            <SolidMarkdown>{props.question.question}</SolidMarkdown>
          </div>
        </div>

        {/* 選択肢インストラクション */}
        <div class="mb-4">
          <p class="text-sm text-base-content/70">
            {props.question.type === "single"
              ? "以下の選択肢から1つを選んでください。"
              : "以下の選択肢から適切なものをすべて選んでください。"}
          </p>
        </div>

        {/* 選択状態の表示（デバッグ用・本番では削除可能） */}
        <Show when={props.selectedOptions.length > 0}>
          <div class="text-xs text-base-content/50 mb-2">
            選択中: {props.selectedOptions.join(", ")}
          </div>
        </Show>
      </div>
    </div>
  );
};

export default QuestionCard;
