import { type Component, For, Match, Show, Switch } from "solid-js";
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
    const baseClasses = "w-full text-left transition-all duration-200";
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

  /**
   * 選択肢の接頭辞アイコンを取得（アクセシビリティ対応版）
   */
  const getOptionIcon = (optionIndex: number) => {
    const isSelected = props.selectedOptions.includes(optionIndex);
    const isCorrect = props.correctOptions?.includes(optionIndex);
    const isIncorrect = props.isAnswered && isSelected && !isCorrect;

    return (
      <Switch>
        <Match when={props.isAnswered && isCorrect}>
          <span class="icon-check text-success" title="正解">
            ✓
          </span>
        </Match>

        <Match when={props.isAnswered && isIncorrect}>
          <span class="icon-error text-error" title="不正解">
            ✗
          </span>
        </Match>

        <Match when={!props.isAnswered && props.question.type === "single"}>
          <span
            class={`icon-radio ${isSelected ? "selected" : "unselected"}`}
            title={isSelected ? "選択済み" : "未選択"}
          >
            {isSelected ? "●" : "○"}
          </span>
        </Match>

        <Match when={!props.isAnswered && props.question.type === "multiple"}>
          <span
            class={`icon-checkbox ${isSelected ? "selected" : "unselected"}`}
            title={isSelected ? "チェック済み" : "未チェック"}
          >
            {isSelected ? "☑" : "☐"}
          </span>
        </Match>
      </Switch>
    );
  };

  return (
    <div class="space-y-3">
      <h3 class="text-lg font-semibold mb-4">選択肢</h3>

      <For each={props.question.options}>
        {(option, index) => (
          <button
            type="button"
            class={getOptionClasses(index())}
            onClick={() => handleOptionClick(index())}
            disabled={props.isAnswered}
          >
            <div class="flex items-start gap-3 text-left w-full">
              {/* アイコン */}
              <span class="text-lg font-mono mt-0.5 flex-shrink-0">
                {getOptionIcon(index())}
              </span>

              {/* 選択肢テキスト */}
              <span class="flex-1 leading-relaxed">{option}</span>
            </div>
          </button>
        )}
      </For>

      {/* 選択状況の説明 */}
      <Show when={!props.isAnswered}>
        <div class="text-sm text-base-content/60 mt-4">
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
