/**
 * Tests for quiz data loading functionality
 * Uses dependency injection for robust and testable implementation
 */

import { describe, expect, it } from "vitest";
import {
  type FileContent,
  type FileLoader,
  loadQuizData,
  loadQuizDataWithDefaults,
  QuizLoadError,
  validateQuizData,
} from "../../src/lib/quiz-loader";
import type { Result } from "../../src/util/types";

// ========================================================================
// Test Data and Mock Implementations
// ========================================================================

/**
 * Mock quiz data matching the structure of sample-quiz.yaml
 */
const SAMPLE_QUIZ_DATA = {
  metadata: {
    version: "1.0.0",
    title: "サンプル問題集",
    lastUpdated: "2025-07-21",
    totalQuestions: 4,
    description: "テスト用のサンプル問題集",
  },
  categories: [
    {
      id: "basic-programming",
      name: "プログラミング基礎",
      description: "基本的なプログラミング概念に関する問題",
      order: 1,
      questions: [
        {
          type: "single",
          question:
            "次のうち、プログラミング言語として正しいものはどれですか？",
          options: ["JavaScript", "HTML", "CSS", "JSON"],
          correct: [0],
          explanation: "JavaScriptはプログラミング言語です。",
        },
        {
          type: "multiple",
          question:
            "以下のうち、**フロントエンド**技術として分類されるものを**すべて**選択してください。",
          options: ["React", "Node.js", "Vue.js", "MySQL"],
          correct: [0, 2],
          explanation: "フロントエンド技術の正解：React, Vue.js",
        },
      ],
    },
    {
      id: "web-basics",
      name: "Web基礎",
      description: "Web開発の基本概念",
      order: 2,
      questions: [
        {
          type: "single",
          question: "HTTPステータスコード`404`の意味は何ですか？",
          options: [
            "サーバーエラー",
            "リクエスト成功",
            "ページが見つからない",
            "認証エラー",
          ],
          correct: [2],
          explanation: "HTTPステータスコード404は「Not Found」を意味します。",
        },
        {
          type: "single",
          question:
            "HTML5の新しいセマンティック要素として正しいものはどれですか？",
          options: ["`<div>`", "`<span>`", "`<section>`", "`<table>`"],
          correct: [2],
          explanation: "`<section>`はHTML5で追加されたセマンティック要素です。",
        },
      ],
    },
  ],
} as const;

/**
 * Mock malformed data for testing validation errors
 */
const MALFORMED_QUIZ_DATA = {
  invalid: "data structure",
} as const;

/**
 * Creates a mock FileLoader that returns predefined data based on file path
 */
function createMockFileLoader(): FileLoader {
  return async (
    filePath: string,
  ): Promise<Result<FileContent, QuizLoadError>> => {
    if (filePath.includes("sample-quiz.yaml")) {
      return {
        success: true,
        data: {
          filePath,
          rawData: SAMPLE_QUIZ_DATA,
        },
      };
    }

    if (
      filePath.includes("malformed.yaml") ||
      filePath.includes("invalid-quiz.yaml")
    ) {
      return {
        success: true,
        data: {
          filePath,
          rawData: MALFORMED_QUIZ_DATA,
        },
      };
    }

    if (filePath.includes("non-existent")) {
      return {
        success: false,
        error: {
          name: "QuizLoadError",
          message: `File not found: ${filePath}`,
          type: "FILE_NOT_FOUND",
          filePath,
        } as QuizLoadError,
      };
    }

    // Default case: file not found
    return {
      success: false,
      error: {
        name: "QuizLoadError",
        message: `Failed to load file: ${filePath}`,
        type: "FILE_NOT_FOUND",
        filePath,
      } as QuizLoadError,
    };
  };
}

/**
 * Creates a FileLoader that always fails with the specified error
 */
function createFailingFileLoader(
  errorType: "FILE_NOT_FOUND" | "UNKNOWN_ERROR" = "FILE_NOT_FOUND",
): FileLoader {
  return async (
    filePath: string,
  ): Promise<Result<FileContent, QuizLoadError>> => {
    return {
      success: false,
      error: {
        name: "QuizLoadError",
        message: `Mock error: Failed to load ${filePath}`,
        type: errorType,
        filePath,
      } as QuizLoadError,
    };
  };
}

// ========================================================================
// Tests
// ========================================================================

describe("loadQuizData with dependency injection", () => {
  it("should successfully load and validate quiz data using mock loader", async () => {
    const mockLoader = createMockFileLoader();
    const result = await loadQuizData(
      mockLoader,
      validateQuizData,
      "test/fixtures/sample-quiz.yaml",
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metadata.title).toBe("サンプル問題集");
      expect(result.data.metadata.totalQuestions).toBe(4);
      expect(result.data.categories).toHaveLength(2);
      expect(result.data.categories[0].id).toBe("basic-programming");
      expect(result.data.categories[1].id).toBe("web-basics");
    }
  });

  it("should return error result for non-existent file", async () => {
    const mockLoader = createMockFileLoader();
    const result = await loadQuizData(
      mockLoader,
      validateQuizData,
      "test/fixtures/non-existent.yaml",
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("FILE_NOT_FOUND");
      expect(result.error.filePath).toBe("test/fixtures/non-existent.yaml");
    }
  });

  it("should return validation error for malformed data", async () => {
    const mockLoader = createMockFileLoader();
    const result = await loadQuizData(
      mockLoader,
      validateQuizData,
      "test/fixtures/malformed.yaml",
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("VALIDATION_ERROR");
    }
  });

  it("should preserve all question data types and structure", async () => {
    const mockLoader = createMockFileLoader();
    const result = await loadQuizData(
      mockLoader,
      validateQuizData,
      "test/fixtures/sample-quiz.yaml",
    );

    expect(result.success).toBe(true);
    if (result.success) {
      // Check single choice question
      const singleQuestion = result.data.categories[0].questions[0];
      expect(singleQuestion.type).toBe("single");
      expect(singleQuestion.correct).toEqual([0]);
      expect(singleQuestion.options).toHaveLength(4);

      // Check multiple choice question
      const multipleQuestion = result.data.categories[0].questions[1];
      expect(multipleQuestion.type).toBe("multiple");
      expect(multipleQuestion.correct).toEqual([0, 2]);
    }
  });

  it("should handle file loader failures gracefully", async () => {
    const failingLoader = createFailingFileLoader("FILE_NOT_FOUND");
    const result = await loadQuizData(
      failingLoader,
      validateQuizData,
      "any-file.yaml",
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("FILE_NOT_FOUND");
    }
  });
});

describe("validateQuizData function", () => {
  it("should validate correct data successfully", () => {
    const fileContent: FileContent = {
      filePath: "test.yaml",
      rawData: SAMPLE_QUIZ_DATA,
    };

    const result = validateQuizData(fileContent);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metadata.title).toBe("サンプル問題集");
    }
  });

  it("should return error for invalid data", () => {
    const fileContent: FileContent = {
      filePath: "test.yaml",
      rawData: { invalid: "data" },
    };

    const result = validateQuizData(fileContent);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("VALIDATION_ERROR");
      expect(result.error.filePath).toBe("test.yaml");
    }
  });
});

describe("loadQuizDataWithDefaults convenience function", () => {
  it("should throw QuizLoadError for invalid data", async () => {
    // Since we can't easily mock ES modules in Vitest, we'll test the error path
    // by using a path that doesn't exist
    await expect(
      loadQuizDataWithDefaults("non-existent-file.yaml"),
    ).rejects.toThrow(QuizLoadError);
  });
});

describe("QuizLoadError", () => {
  it("should create error with correct properties", () => {
    const error = new QuizLoadError(
      "Test message",
      "PARSE_ERROR",
      "test/file.yaml",
    );

    expect(error.message).toBe("Test message");
    expect(error.type).toBe("PARSE_ERROR");
    expect(error.filePath).toBe("test/file.yaml");
    expect(error.name).toBe("QuizLoadError");
  });

  it("should inherit from Error class", () => {
    const error = new QuizLoadError("Test", "FILE_NOT_FOUND");
    expect(error).toBeInstanceOf(Error);
  });

  it("should work without filePath", () => {
    const error = new QuizLoadError("Test message", "UNKNOWN_ERROR");
    expect(error.filePath).toBeUndefined();
  });
});
