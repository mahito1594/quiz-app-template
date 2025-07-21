/**
 * Quiz Type Definitions with Parse, Don't Validate approach using Valibot
 *
 * This module provides type-safe parsing for quiz data loaded from YAML files.
 * Uses valibot for runtime validation to ensure data integrity and provide
 * meaningful error messages when quiz data is malformed.
 */

import * as v from "valibot";

/**
 * Schema for question types in the quiz system.
 * Enforces the two supported question formats to maintain consistency
 * across the application and ensure proper UI rendering.
 */
const QuestionTypeSchema = v.picklist(
  ["single", "multiple"],
  'Question type must be "single" or "multiple"',
);

/**
 * Schema for individual quiz questions.
 * Validates question structure and business rules to prevent runtime errors
 * and ensure questions are answerable by users.
 */
const QuestionSchema = v.pipe(
  v.object({
    type: QuestionTypeSchema,
    question: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(1, "Question text cannot be empty"),
    ),
    options: v.pipe(
      v.array(v.string()),
      v.minLength(2, "Question must have at least 2 options"),
    ),
    correct: v.array(v.number()),
    explanation: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(1, "Question explanation cannot be empty"),
    ),
  }),
  v.check((data) => {
    // Validate correct indices are within options range
    if (!Array.isArray(data.correct) || !Array.isArray(data.options))
      return true; // Skip if data is incomplete
    for (const index of data.correct) {
      if (
        typeof index !== "number" ||
        index < 0 ||
        index >= data.options.length
      ) {
        return false;
      }
    }
    return true;
  }, "Invalid correct answer index"),
  v.check((data) => {
    // Single choice must have exactly one correct answer
    if (data.type === "single" && data.correct.length !== 1) {
      return false;
    }
    return true;
  }, "Single choice question must have exactly one correct answer"),
);

/**
 * Schema for quiz categories.
 * Validates category structure and ID format to ensure URL compatibility
 * and consistent navigation throughout the application.
 */
const CategorySchema = v.pipe(
  v.object({
    id: v.pipe(
      v.string(),
      v.regex(
        /^[a-zA-Z0-9-]+$/,
        "Category id can only contain alphanumeric characters and hyphens",
      ),
    ),
    name: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(1, "Category name cannot be empty"),
    ),
    description: v.string(),
    order: v.number(),
    questions: v.array(QuestionSchema),
  }),
);

/**
 * Schema for quiz metadata.
 * Validates metadata structure and date format to ensure consistency
 * and enable proper version tracking and display.
 */
const MetadataSchema = v.object({
  version: v.string(),
  title: v.string(),
  lastUpdated: v.pipe(
    v.string(),
    v.regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format in lastUpdated"),
  ),
  totalQuestions: v.number(),
  description: v.optional(v.string()),
});

/**
 * Schema for complete quiz data structure.
 * Validates the entire quiz structure and cross-references between metadata
 * and actual content to ensure data integrity and prevent inconsistencies.
 */
const QuizDataSchema = v.pipe(
  v.object({
    metadata: MetadataSchema,
    categories: v.pipe(
      v.array(CategorySchema),
      v.minLength(1, "Quiz must have at least one category"),
    ),
  }),
  v.check((data) => {
    // Check for duplicate category IDs - this runs after basic array validation
    if (!data.categories || !Array.isArray(data.categories)) return true; // Skip if data is incomplete
    const ids = data.categories.map((cat) => cat.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      return false;
    }
    return true;
  }, "Duplicate category id found"),
  v.check((data) => {
    // Check total questions count matches actual count
    if (!data.categories || !Array.isArray(data.categories) || !data.metadata)
      return true; // Skip if data is incomplete
    const actualCount = data.categories.reduce(
      (sum, cat) => sum + cat.questions.length,
      0,
    );
    return data.metadata.totalQuestions === actualCount;
  }, "Total questions count mismatch"),
);

/**
 * Represents the supported question types in the quiz system.
 * Single choice allows exactly one correct answer, multiple choice allows several.
 */
export type QuestionType = v.InferOutput<typeof QuestionTypeSchema>;

/**
 * Represents a single quiz question with validation and explanation.
 * Contains all necessary data to display a question and validate user answers.
 */
export type Question = v.InferOutput<typeof QuestionSchema>;

/**
 * Represents a category of related quiz questions.
 * Groups questions for organization and navigation purposes.
 */
export type Category = v.InferOutput<typeof CategorySchema>;

/**
 * Represents quiz metadata including version and content statistics.
 * Provides essential information about the quiz structure and versioning.
 */
export type Metadata = v.InferOutput<typeof MetadataSchema>;

/**
 * Represents the complete quiz data structure.
 * Contains all quiz content organized by categories with metadata.
 */
export type QuizData = v.InferOutput<typeof QuizDataSchema>;

/**
 * Custom error class for quiz parsing failures.
 * Provides structured error information to help identify exactly which
 * field caused the validation failure, enabling precise error reporting.
 */
export class QuizParseError extends Error {
  /** The field path where the validation error occurred */
  public field: string;

  /**
   * Creates a new QuizParseError.
   *
   * @param message - Human-readable error description
   * @param field - Dot-notation path to the field that failed validation
   */
  constructor(message: string, field: string = "") {
    super(message);
    this.name = "QuizParseError";
    this.field = field;
  }
}

/**
 * Converts Valibot validation issues to structured QuizParseError.
 * Maps Valibot's internal error format to our application-specific error type
 * to maintain consistent error handling across the application.
 *
 * @param issues - Validation issues from Valibot
 * @param basePath - Base field path to prepend to error paths
 * @returns Structured QuizParseError with field path information
 */
function convertValibotError(
  issues: v.Issues,
  basePath: string = "",
): QuizParseError {
  const issue = issues[0]; // Take the first issue
  let path = "";
  if (issue.path) {
    // Convert Valibot path format to expected test format
    path = issue.path
      .map((p) => {
        if (typeof p.key === "number") {
          return `[${p.key}]`;
        }
        return p.key;
      })
      .join(".");
    // Clean up leading dots
    path = path.replace(/^\[/, "[").replace(/\.\[/g, "[");
  }
  const fullPath = basePath
    ? `${basePath}.${path}`.replace(/\.\[/g, "[")
    : path;

  // Handle specific error message mappings
  let message = issue.message;
  if (
    message.includes('Expected "metadata"') &&
    message.includes("undefined")
  ) {
    message = "Metadata is required";
  }

  return new QuizParseError(message, fullPath);
}

/**
 * Parses and validates individual question data.
 * Ensures question structure meets business requirements and throws
 * descriptive errors for invalid data to aid in quiz content creation.
 *
 * @param rawData - Raw question data from YAML or other source
 * @param fieldPath - Context path for error reporting
 * @returns Validated Question object
 * @throws {QuizParseError} When question data is invalid
 */
export function parseQuestion(
  rawData: unknown,
  fieldPath: string = "",
): Question {
  const result = v.safeParse(QuestionSchema, rawData);
  if (!result.success) {
    const error = convertValibotError(result.issues, fieldPath);
    throw error;
  }
  return result.output;
}

/**
 * Parses and validates complete quiz data structure.
 * Validates the entire quiz including cross-references between metadata
 * and content to ensure data consistency and application reliability.
 *
 * @param rawData - Raw quiz data from YAML file
 * @returns Validated QuizData object
 * @throws {QuizParseError} When quiz data is invalid or inconsistent
 */
export function parseQuizData(rawData: unknown): QuizData {
  const result = v.safeParse(QuizDataSchema, rawData);
  if (!result.success) {
    throw convertValibotError(result.issues);
  }
  return result.output;
}
