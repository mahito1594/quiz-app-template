import { describe, expect, it } from "vitest";
import {
  parseQuestion,
  parseQuizData,
  QuizParseError,
} from "../../src/types/quiz";

describe("Quiz Type Parsing", () => {
  describe("parseQuestion", () => {
    it("should parse single choice question correctly", () => {
      const rawData = {
        type: "single",
        question: "What is JavaScript?",
        options: ["Programming language", "Markup language", "Database", "OS"],
        correct: [0],
        explanation: "JavaScript is a programming language.",
      };

      const question = parseQuestion(rawData);

      expect(question.type).toBe("single");
      expect(question.question).toBe("What is JavaScript?");
      expect(question.options).toHaveLength(4);
      expect(question.correct).toEqual([0]);
      expect(question.explanation).toBe(
        "JavaScript is a programming language.",
      );
    });

    it("should parse multiple choice question correctly", () => {
      const rawData = {
        type: "multiple",
        question: "Which are frontend technologies?",
        options: ["React", "Node.js", "Vue.js", "MySQL"],
        correct: [0, 2],
        explanation: "React and Vue.js are frontend technologies.",
      };

      const question = parseQuestion(rawData);

      expect(question.type).toBe("multiple");
      expect(question.correct).toEqual([0, 2]);
    });

    it("should throw error for question with invalid type", () => {
      const rawData = {
        type: "invalid_type",
        question: "Test question",
        options: ["A", "B"],
        correct: [0],
        explanation: "Test",
      };

      expect(() => parseQuestion(rawData)).toThrow(QuizParseError);
      expect(() => parseQuestion(rawData)).toThrow(
        'Question type must be "single" or "multiple"',
      );
    });

    it("should throw error for question with empty options", () => {
      const rawData = {
        type: "single",
        question: "Test question",
        options: [],
        correct: [0],
        explanation: "Test",
      };

      expect(() => parseQuestion(rawData)).toThrow(QuizParseError);
      expect(() => parseQuestion(rawData)).toThrow(
        "Question must have at least 2 options",
      );
    });

    it("should throw error for question with correct answer index out of range", () => {
      const rawData = {
        type: "single",
        question: "Test question",
        options: ["A", "B"],
        correct: [5],
        explanation: "Test",
      };

      expect(() => parseQuestion(rawData)).toThrow(QuizParseError);
      expect(() => parseQuestion(rawData)).toThrow(
        "Invalid correct answer index",
      );
    });

    it("should throw error for single choice question with multiple correct answers", () => {
      const rawData = {
        type: "single",
        question: "Test question",
        options: ["A", "B", "C", "D"],
        correct: [0, 1],
        explanation: "Test",
      };

      expect(() => parseQuestion(rawData)).toThrow(QuizParseError);
      expect(() => parseQuestion(rawData)).toThrow(
        "Single choice question must have exactly one correct answer",
      );
    });

    it("should throw error for question with insufficient options", () => {
      const rawData = {
        type: "single",
        question: "Test question",
        options: ["Only option"],
        correct: [0],
        explanation: "Test",
      };

      expect(() => parseQuestion(rawData)).toThrow(QuizParseError);
      expect(() => parseQuestion(rawData)).toThrow(
        "Question must have at least 2 options",
      );
    });

    it("should throw error for empty question text", () => {
      const rawData = {
        type: "single",
        question: "",
        options: ["A", "B"],
        correct: [0],
        explanation: "Test",
      };

      expect(() => parseQuestion(rawData)).toThrow(QuizParseError);
      expect(() => parseQuestion(rawData)).toThrow(
        "Question text cannot be empty",
      );
    });

    it("should throw error for empty explanation", () => {
      const rawData = {
        type: "single",
        question: "Test question",
        options: ["A", "B"],
        correct: [0],
        explanation: "",
      };

      expect(() => parseQuestion(rawData)).toThrow(QuizParseError);
      expect(() => parseQuestion(rawData)).toThrow(
        "Question explanation cannot be empty",
      );
    });
  });

  describe("parseQuizData", () => {
    const validRawData = {
      metadata: {
        version: "1.0.0",
        title: "Test Quiz",
        lastUpdated: "2025-07-21",
        totalQuestions: 2,
        description: "Test description",
      },
      categories: [
        {
          id: "test-category",
          name: "Test Category",
          description: "Test category description",
          order: 1,
          questions: [
            {
              type: "single",
              question: "Test question 1",
              options: ["A", "B", "C", "D"],
              correct: [0],
              explanation: "Test explanation",
            },
            {
              type: "multiple",
              question: "Test question 2",
              options: ["X", "Y", "Z"],
              correct: [0, 2],
              explanation: "Test explanation 2",
            },
          ],
        },
      ],
    };

    it("should parse complete quiz data correctly", () => {
      const quizData = parseQuizData(validRawData);

      expect(quizData.metadata.title).toBe("Test Quiz");
      expect(quizData.categories).toHaveLength(1);
      expect(quizData.categories[0].questions).toHaveLength(2);
      expect(quizData.metadata.totalQuestions).toBe(2);
    });

    it("should throw error for quiz data with missing metadata", () => {
      const rawData = {
        categories: validRawData.categories,
      };

      expect(() => parseQuizData(rawData)).toThrow(QuizParseError);
      expect(() => parseQuizData(rawData)).toThrow("Metadata is required");
    });

    it("should throw error for quiz data with empty categories", () => {
      const rawData = {
        ...validRawData,
        categories: [],
      };

      expect(() => parseQuizData(rawData)).toThrow(QuizParseError);
      expect(() => parseQuizData(rawData)).toThrow(
        "Quiz must have at least one category",
      );
    });

    it("should throw error for quiz data with invalid category id", () => {
      const rawData = {
        ...validRawData,
        categories: [
          {
            ...validRawData.categories[0],
            id: "Invalid ID with spaces!",
          },
        ],
      };

      expect(() => parseQuizData(rawData)).toThrow(QuizParseError);
      expect(() => parseQuizData(rawData)).toThrow(
        "Category id can only contain alphanumeric characters and hyphens",
      );
    });

    it("should throw error for quiz data with duplicate category ids", () => {
      const rawData = {
        ...validRawData,
        categories: [
          validRawData.categories[0],
          { ...validRawData.categories[0] },
        ],
      };

      expect(() => parseQuizData(rawData)).toThrow(QuizParseError);
      expect(() => parseQuizData(rawData)).toThrow(
        "Duplicate category id found",
      );
    });

    it("should throw error for quiz data with totalQuestions mismatch", () => {
      const rawData = {
        ...validRawData,
        metadata: {
          ...validRawData.metadata,
          totalQuestions: 5,
        },
      };

      expect(() => parseQuizData(rawData)).toThrow(QuizParseError);
      expect(() => parseQuizData(rawData)).toThrow(
        "Total questions count mismatch",
      );
    });

    it("should throw error for empty category name", () => {
      const rawData = {
        ...validRawData,
        categories: [
          {
            ...validRawData.categories[0],
            name: "",
          },
        ],
      };

      expect(() => parseQuizData(rawData)).toThrow(QuizParseError);
      expect(() => parseQuizData(rawData)).toThrow(
        "Category name cannot be empty",
      );
    });

    it("should throw error for invalid date format", () => {
      const rawData = {
        ...validRawData,
        metadata: {
          ...validRawData.metadata,
          lastUpdated: "invalid-date",
        },
      };

      expect(() => parseQuizData(rawData)).toThrow(QuizParseError);
      expect(() => parseQuizData(rawData)).toThrow(
        "Invalid date format in lastUpdated",
      );
    });
  });

  describe("QuizParseError", () => {
    it("should include field path in error message", () => {
      const rawData = {
        metadata: {
          version: "1.0.0",
          title: "Test Quiz",
          lastUpdated: "2025-07-21",
          totalQuestions: 1,
        },
        categories: [
          {
            id: "test-category",
            name: "Test Category",
            description: "Test",
            order: 1,
            questions: [
              {
                type: "single",
                question: "Test question",
                options: ["A", "B"],
                correct: [5], // Invalid index
                explanation: "Test",
              },
            ],
          },
        ],
      };

      try {
        parseQuizData(rawData);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(QuizParseError);
        if (error instanceof QuizParseError) {
          expect(error.field).toBe("categories[0].questions[0]");
          expect(error.message).toContain("Invalid correct answer index");
        }
      }
    });
  });
});
