import { IconCheck, IconX } from "@tabler/icons-solidjs";
import { type Component, For, Show } from "solid-js";
import type { Question } from "../../schema/quiz.js";

export type AnswerOptionsProps = {
  /** 問題データ */
  question: Question;
  /** 現在選択中の選択肢インデックス配列 */
  selectedOptions: number[];
  /** 選択肢変更時のコールバック */
  onSelectionChange: (selectedOptions: number[]) => void;
  /** 問題が回答済みかどうか */
  isAnswered: boolean;
  /** 正解の選択肢インデックス配列（回答済みの場合のみ表示） */
  correctOptions?: number[];
};

/**
 * 回答選択肢コンポーネント
 * 単一選択・複数選択に対応
 */
const AnswerOptions: Component<AnswerOptionsProps> = (props) => {
  /**
   * 選択肢のクリックハンドラ
   */
  const handleOptionClick = (optionIndex: number) => {
    if (props.isAnswered) return; // 回答済みの場合は選択を変更できない

    if (props.question.type === "single") {
      // 単一選択の場合
      props.onSelectionChange([optionIndex]);
    } else {
      // 複数選択の場合
      const currentSelection = props.selectedOptions;
      if (currentSelection.includes(optionIndex)) {
        // 既に選択されている場合は除去
        props.onSelectionChange(
          currentSelection.filter((idx) => idx !== optionIndex),
        );
      } else {
        // 未選択の場合は追加
        props.onSelectionChange([...currentSelection, optionIndex]);
      }
    }
  };

  /**
   * 選択肢のスタイルクラスを取得
   */
  const getOptionClasses = (optionIndex: number) => {
    const baseClasses =
      "w-full text-left transition-all duration-200 h-auto min-h-[3rem] whitespace-normal";
    const isSelected = props.selectedOptions.includes(optionIndex);
    const isCorrect = props.correctOptions?.includes(optionIndex);
    const isIncorrect = props.isAnswered && isSelected && !isCorrect;

    if (props.isAnswered) {
      // 回答済みの場合の色分け
      if (isCorrect) {
        return `${baseClasses} btn btn-success cursor-default`;
      } else if (isIncorrect) {
        return `${baseClasses} btn btn-error cursor-default`;
      } else {
        return `${baseClasses} btn btn-outline cursor-default opacity-60`;
      }
    } else {
      // 回答前の場合
      if (isSelected) {
        return `${baseClasses} btn btn-primary`;
      } else {
        return `${baseClasses} btn btn-outline hover:btn-primary`;
      }
    }
  };

  return (
    <div class="space-y-3">
      <h3 id="question-options-title" class="text-lg font-semibold mb-4">
        選択肢
      </h3>

      <fieldset
        aria-labelledby="question-options-title"
        aria-describedby="selection-help"
        class="space-y-3 border-none p-0 m-0"
        disabled={props.isAnswered}
      >
        <For each={props.question.options}>
          {(option, index) => {
            const isSelected = () => props.selectedOptions.includes(index());
            const optionLabel = () => option;

            return (
              <button
                type="button"
                class={getOptionClasses(index())}
                onClick={() => handleOptionClick(index())}
                disabled={props.isAnswered}
                aria-pressed={isSelected()}
                aria-label={`${optionLabel()}${isSelected() ? " (選択済み)" : ""}`}
                aria-describedby={
                  props.isAnswered ? undefined : "selection-help"
                }
              >
                <div class="flex items-start gap-3 text-left w-full py-2 px-1">
                  {/* 回答後のみアイコンを表示 */}
                  <Show when={props.isAnswered}>
                    <span class="flex-shrink-0">
                      <Show
                        when={props.correctOptions?.includes(index())}
                        fallback={
                          <Show when={props.selectedOptions.includes(index())}>
                            <IconX
                              class="text-error"
                              size={20}
                              aria-label="不正解"
                              title="不正解"
                              stroke-width={3}
                            />
                          </Show>
                        }
                      >
                        <IconCheck
                          class="text-success"
                          size={20}
                          aria-label="正解"
                          title="正解"
                          stroke-width={3}
                        />
                      </Show>
                    </span>
                  </Show>

                  {/* 選択肢テキスト */}
                  <span class="flex-1 leading-relaxed break-words">
                    {option}
                  </span>
                </div>
              </button>
            );
          }}
        </For>
      </fieldset>

      {/* 選択状況の説明 */}
      <Show when={!props.isAnswered}>
        <div id="selection-help" class="text-sm text-base-content/60 mt-4">
          {props.question.type === "single" ? (
            <p>1つの選択肢を選んでください。</p>
          ) : (
            <p>正しいと思う選択肢をすべて選んでください。複数選択可能です。</p>
          )}
        </div>
      </Show>
    </div>
  );
};

export default AnswerOptions;
