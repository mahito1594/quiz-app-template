import { A } from "@solidjs/router";
import { type Component, Match, Show, Switch } from "solid-js";
import type { Category } from "../schema/quiz.js";

/**
 * CategoryCardコンポーネントのプロパティ
 */
export type CategoryCardProps = {
  category: Category;
  progress: {
    hasProgress: boolean;
    isCompleted: boolean;
    currentQuestion: number;
    totalAnswered: number;
    accuracy: number;
  };
};

/**
 * カテゴリ情報カードコンポーネント
 * カテゴリの詳細情報、進捗状況、アクションボタンを表示
 */
const CategoryCard: Component<CategoryCardProps> = (props) => {
  const totalQuestions = () => props.category.questions.length;

  return (
    <div class="card bg-base-100 shadow-md border hover:shadow-lg transition-shadow">
      <div class="card-body">
        <h2 class="card-title text-xl">{props.category.name}</h2>
        <p class="text-base-content/70">{props.category.description}</p>

        {/* 進捗情報 */}
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>問題数</span>
            <span class="font-semibold">{totalQuestions()}問</span>
          </div>

          <Show when={props.progress.hasProgress}>
            <div class="flex justify-between text-sm">
              <span>進捗</span>
              <span class="font-semibold">
                {props.progress.totalAnswered} / {totalQuestions()}
              </span>
            </div>

            <Show when={props.progress.totalAnswered > 0}>
              <div class="flex justify-between text-sm">
                <span>正答率</span>
                <span class="font-semibold">
                  {props.progress.accuracy.toFixed(1)}%
                </span>
              </div>
            </Show>
          </Show>
        </div>

        {/* ステータスバッジ */}
        <div class="flex flex-wrap gap-2 mt-2">
          <Show when={props.progress.isCompleted}>
            <div class="badge badge-success">完了</div>
          </Show>
          <Show
            when={props.progress.hasProgress && !props.progress.isCompleted}
          >
            <div class="badge badge-warning">進行中</div>
          </Show>
          <Show when={!props.progress.hasProgress}>
            <div class="badge badge-ghost">未開始</div>
          </Show>
        </div>

        {/* アクションボタン */}
        <div class="card-actions justify-end mt-4">
          <Switch>
            <Match when={props.progress.isCompleted}>
              <A href={`/quiz/${props.category.id}`} class="btn btn-primary">
                もう一度
              </A>
            </Match>
            <Match when={props.progress.hasProgress}>
              <A href={`/quiz/${props.category.id}`} class="btn btn-primary">
                続きから
              </A>
            </Match>
            <Match when={!props.progress.hasProgress}>
              <A href={`/quiz/${props.category.id}`} class="btn btn-primary">
                開始
              </A>
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
