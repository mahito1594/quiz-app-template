/**
 * テスト用のユーティリティ関数
 */
import { render } from "@solidjs/testing-library";
import type { JSXElement, ParentComponent } from "solid-js";
import { QuizDataProvider } from "../src/context/QuizDataContext";
import testQuizYaml from "./fixtures/sample-quiz.yaml";

// テスト用のQuizDataProviderラッパー
export const TestQuizDataProvider: ParentComponent = (props) => {
  return (
    <QuizDataProvider data={testQuizYaml}>{props.children}</QuizDataProvider>
  );
};

// カスタムレンダー関数
export function renderWithQuizData(ui: () => JSXElement) {
  return render(() => <TestQuizDataProvider>{ui()}</TestQuizDataProvider>);
}
