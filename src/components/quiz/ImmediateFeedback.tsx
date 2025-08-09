import {
  IconArrowRight,
  IconBulb,
  IconConfetti,
  IconMoodSad,
} from "@tabler/icons-solidjs";
import { type Component, Show } from "solid-js";
import { SolidMarkdown } from "solid-markdown";
import type { Question } from "../../schema/quiz.js";

/**
 * ImmediateFeedbackコンポーネントの定数
 */
const FEEDBACK_CONSTANTS = {
  /** 絵文字サイズクラス */
  EMOJI_SIZE: "text-3xl",
  /** タイトルサイズクラス */
  TITLE_SIZE: "text-2xl",
  /** サブテキストサイズクラス */
  SUBTEXT_SIZE: "text-sm",
  /** 正解時のメッセージ */
  SUCCESS_MESSAGES: {
    title: "正解です！",
    subtitle: "よくできました！",
  },
  /** 不正解時のメッセージ */
  ERROR_MESSAGES: {
    title: "不正解です",
    subtitle: "惜しい！解説を確認しましょう。",
  },
} as const;

export type ImmediateFeedbackProps = {
  /** 問題データ */
  question: Question;
  /** 正解かどうか */
  isCorrect: boolean;
  /** 選択した選択肢インデックス配列 */
  selectedOptions: number[];
  /** 正解の選択肢インデックス配列 */
  correctOptions: number[];
  /** 次の問題へ進むボタンの表示フラグ */
  showNextButton: boolean;
  /** 次の問題へ進むコールバック */
  onNext: () => void;
  /** 結果画面へ進むコールバック（最後の問題の場合） */
  onFinish: () => void;
  /** 最後の問題かどうか */
  isLastQuestion: boolean;
};

/**
 * 即時フィードバックコンポーネント
 * 回答後に正解・不正解と解説を表示
 */
const ImmediateFeedback: Component<ImmediateFeedbackProps> = (props) => {
  return (
    <div
      class={`card shadow-lg border-2 ${
        props.isCorrect
          ? "bg-success text-success-content border-success"
          : "bg-error text-error-content border-error"
      }`}
    >
      <div class="card-body">
        {/* 結果ヘッダー */}
        <div class="flex items-center gap-3 mb-4">
          <div class={FEEDBACK_CONSTANTS.EMOJI_SIZE}>
            {props.isCorrect ? (
              <IconConfetti size={32} class="text-success" aria-label="正解" />
            ) : (
              <IconMoodSad size={32} class="text-error" aria-label="不正解" />
            )}
          </div>
          <div>
            <h2 class={`card-title ${FEEDBACK_CONSTANTS.TITLE_SIZE}`}>
              {props.isCorrect
                ? FEEDBACK_CONSTANTS.SUCCESS_MESSAGES.title
                : FEEDBACK_CONSTANTS.ERROR_MESSAGES.title}
            </h2>
            <p class={`${FEEDBACK_CONSTANTS.SUBTEXT_SIZE} opacity-90`}>
              {props.isCorrect
                ? FEEDBACK_CONSTANTS.SUCCESS_MESSAGES.subtitle
                : FEEDBACK_CONSTANTS.ERROR_MESSAGES.subtitle}
            </p>
          </div>
        </div>

        {/* 選択肢の結果表示 */}
        <div class="mb-6 p-4 bg-base-100 text-base-content rounded-lg">
          <h3 class="font-semibold mb-2">回答結果</h3>
          <div class="space-y-1 text-sm">
            <p>
              <span class="font-medium">あなたの回答:</span>{" "}
              {props.selectedOptions.length > 0
                ? props.selectedOptions
                    .map((idx) => props.question.options[idx])
                    .join(", ")
                : "未回答"}
            </p>
            <p>
              <span class="font-medium">正解:</span>{" "}
              {props.correctOptions
                .map((idx) => props.question.options[idx])
                .join(", ")}
            </p>
          </div>
        </div>

        {/* 解説 */}
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">解説</h3>
          <div class="prose prose-sm max-w-none bg-base-100 text-base-content p-4 rounded-lg">
            <SolidMarkdown>{props.question.explanation}</SolidMarkdown>
          </div>
        </div>

        {/* アクションボタン */}
        <Show when={props.showNextButton}>
          <div class="card-actions justify-end">
            <Show
              when={!props.isLastQuestion}
              fallback={
                <button
                  type="button"
                  class="btn btn-primary btn-lg"
                  onClick={props.onFinish}
                >
                  結果を見る
                  <IconArrowRight size={20} class="ml-2" aria-label="矢印" />
                </button>
              }
            >
              <button
                type="button"
                class="btn btn-primary btn-lg"
                onClick={props.onNext}
              >
                次の問題
                <IconArrowRight size={20} class="ml-2" aria-label="矢印" />
              </button>
            </Show>
          </div>
        </Show>

        {/* 励ましメッセージ */}
        <Show when={!props.isCorrect}>
          <div class="mt-4 p-3 bg-base-100 text-base-content rounded-lg">
            <p class="text-sm flex items-start gap-2">
              <IconBulb
                size={16}
                class="text-warning mt-0.5 flex-shrink-0"
                aria-label="ヒント"
              />
              <span>
                <strong>ヒント:</strong>
                間違えた問題は復習リストに追加されます。後で復習して理解を深めましょう！
              </span>
            </p>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default ImmediateFeedback;
