/**
 * QuizData Context Provider for SolidJS
 *
 * SolidJSの標準的なcreateContext APIを使用した
 * 同期的なクイズデータのコンテキストプロバイダー実装
 */

import { createContext, type ParentComponent, useContext } from "solid-js";
import { parseQuizData, type QuizData } from "../schema/quiz";

// Context型定義
type QuizDataContextValue = {
  quizData: QuizData;
};

// Context作成（デフォルト値なし）
const QuizDataContext = createContext<QuizDataContextValue>();

// カスタムフックでContext使用
export const useQuizData = (): QuizDataContextValue => {
  const context = useContext(QuizDataContext);
  if (!context) {
    throw new Error("useQuizData must be used within a QuizDataProvider");
  }
  return context;
};

// Provider Props
type QuizDataProviderProps = {
  /**
   * 生のYAMLデータ
   * 本番：import yamlData from "../data/quiz.yaml"
   * テスト：import testYamlData from "./fixtures/sample-quiz.yaml"
   */
  data: unknown;
};

// Provider Component
export const QuizDataProvider: ParentComponent<QuizDataProviderProps> = (
  props,
) => {
  // 同期的にYAMLデータをパース
  const parsedData = parseQuizData(props.data);

  // Context value
  const contextValue: QuizDataContextValue = {
    quizData: parsedData,
  };

  return (
    <QuizDataContext.Provider value={contextValue}>
      {props.children}
    </QuizDataContext.Provider>
  );
};
