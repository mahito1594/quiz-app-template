import {
  IconCheck,
  IconCircle,
  IconCircleFilled,
  IconSquare,
  IconSquareCheckFilled,
  IconX,
} from "@tabler/icons-solidjs";
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
          <IconCheck
            class="text-success"
            size={20}
            aria-label="正解"
            title="正解"
          />
        </Match>

        <Match when={props.isAnswered && isIncorrect}>
          <IconX
            class="text-error"
            size={20}
            aria-label="不正解"
            title="不正解"
          />
        </Match>

        <Match when={!props.isAnswered && props.question.type === "single"}>
          {isSelected ? (
            <IconCircleFilled
              class="text-primary"
              size={20}
              aria-label="選択済み"
              title="選択済み"
            />
          ) : (
            <IconCircle
              class="text-base-content/50"
              size={20}
              aria-label="未選択"
              title="未選択"
            />
          )}
        </Match>

        <Match when={!props.isAnswered && props.question.type === "multiple"}>
          {isSelected ? (
            <IconSquareCheckFilled
              class="text-primary"
              size={20}
              aria-label="チェック済み"
              title="チェック済み"
            />
          ) : (
            <IconSquare
              class="text-base-content/50"
              size={20}
              aria-label="未チェック"
              title="未チェック"
            />
          )}
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
