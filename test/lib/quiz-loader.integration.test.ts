/**
 * Integration tests for quiz data loading with actual YAML files
 *
 * These tests verify that the Vite YAML plugin integration works correctly
 * and that we can actually load and parse real YAML files.
 */

import { describe, expect, it } from "vitest";
import {
  loadQuizData,
  validateQuizData,
  viteYamlLoader,
} from "../../src/lib/quiz-loader";

describe("YAML file integration tests", () => {
  it("should load actual sample-quiz.yaml file using viteYamlLoader", async () => {
    // Use the actual Vite YAML loader to load a real YAML file
    const loadResult = await viteYamlLoader("test/fixtures/sample-quiz.yaml");

    // The file should load successfully
    expect(loadResult.success).toBe(true);

    if (loadResult.success) {
      expect(loadResult.data.filePath).toBe("test/fixtures/sample-quiz.yaml");
      expect(loadResult.data.rawData).toBeDefined();

      // Validate the loaded data
      const validateResult = validateQuizData(loadResult.data);

      expect(validateResult.success).toBe(true);
      if (validateResult.success) {
        expect(validateResult.data.metadata.title).toBe("サンプル問題集");
        expect(validateResult.data.categories).toHaveLength(2);
      }
    }
  });

  it("should handle non-existent files properly with viteYamlLoader", async () => {
    const result = await viteYamlLoader("test/fixtures/does-not-exist.yaml");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("FILE_NOT_FOUND");
      expect(result.error.filePath).toBe("test/fixtures/does-not-exist.yaml");
    }
  });

  it("should perform end-to-end loading with real files", async () => {
    const result = await loadQuizData(
      viteYamlLoader,
      validateQuizData,
      "test/fixtures/sample-quiz.yaml",
    );

    expect(result.success).toBe(true);
    if (result.success) {
      // Verify complete quiz structure
      expect(result.data.metadata.version).toBe("1.0.0");
      expect(result.data.metadata.totalQuestions).toBe(4);

      // Verify categories
      expect(result.data.categories[0].id).toBe("basic-programming");
      expect(result.data.categories[1].id).toBe("web-basics");

      // Verify questions
      expect(result.data.categories[0].questions).toHaveLength(2);
      expect(result.data.categories[1].questions).toHaveLength(2);

      // Verify question types
      expect(result.data.categories[0].questions[0].type).toBe("single");
      expect(result.data.categories[0].questions[1].type).toBe("multiple");
    }
  });

  it("should validate real malformed YAML file", async () => {
    const result = await loadQuizData(
      viteYamlLoader,
      validateQuizData,
      "test/fixtures/malformed.yaml",
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe("VALIDATION_ERROR");
    }
  });
});

describe("Real YAML content verification", () => {
  it("should match expected content from sample-quiz.yaml", async () => {
    const result = await loadQuizData(
      viteYamlLoader,
      validateQuizData,
      "test/fixtures/sample-quiz.yaml",
    );

    expect(result.success).toBe(true);
    if (result.success) {
      const { data: quiz } = result;

      // Verify specific content from the actual YAML file
      expect(quiz.metadata.lastUpdated).toBe("2025-07-21");
      expect(quiz.metadata.description).toBe("テスト用のサンプル問題集");

      // Verify first question
      const firstQuestion = quiz.categories[0].questions[0];
      expect(firstQuestion.question).toContain(
        "プログラミング言語として正しいもの",
      );
      expect(firstQuestion.options).toContain("JavaScript");
      expect(firstQuestion.options).toContain("HTML");
      expect(firstQuestion.correct).toEqual([0]);

      // Verify multiple choice question
      const multipleQuestion = quiz.categories[0].questions[1];
      expect(multipleQuestion.correct).toEqual([0, 2]);
      expect(multipleQuestion.options).toContain("React");
      expect(multipleQuestion.options).toContain("Vue.js");
    }
  });
});
