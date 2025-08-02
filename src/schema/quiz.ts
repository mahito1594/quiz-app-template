/**
 * Quiz Type Definitions with Parse, Don't Validate approach using Valibot
 *
 * This module provides type-safe parsing for quiz data loaded from YAML files.
 * Uses valibot for runtime validation to ensure data integrity and provide
 * meaningful error messages when quiz data is malformed.
 */

import * as v from "valibot";

/**
 * Validation constants for quiz data parsing
 */
const VALIDATION_CONSTANTS = {
  /** Minimum number of options required per question */
  MIN_OPTIONS_COUNT: 2,
  /** Number of correct answers required for single choice questions */
  SINGLE_CHOICE_CORRECT_COUNT: 1,
  /** Regular expression pattern for YYYY-MM-DD date format */
  DATE_REGEX: /^\d{4}-\d{2}-\d{2}$/,
  /** Regular expression pattern for valid category IDs (alphanumeric and hyphens only) */
  CATEGORY_ID_REGEX: /^[a-zA-Z0-9-]+$/,
} as const;

/**
 * Error messages for quiz data validation
 */
const ERROR_MESSAGES = {
  // Question validation
  /** Error message for invalid question type (not "single" or "multiple") */
  INVALID_QUESTION_TYPE: 'Question type must be "single" or "multiple"',
  /** Error message for empty question text after trimming */
  EMPTY_QUESTION_TEXT: "Question text cannot be empty",
  /** Error message for questions with fewer than 2 options */
  INSUFFICIENT_OPTIONS: "Question must have at least 2 options",
  /** Error message for empty explanation text after trimming */
  EMPTY_EXPLANATION: "Question explanation cannot be empty",
  /** Error message for correct answer indices outside the options range */
  INVALID_CORRECT_INDEX: "Invalid correct answer index",
  /** Error message for single choice questions with multiple correct answers */
  SINGLE_CHOICE_MULTIPLE_ANSWERS:
    "Single choice question must have exactly one correct answer",

  // Category validation
  /** Error message for category IDs containing invalid characters */
  INVALID_CATEGORY_ID:
    "Category id can only contain alphanumeric characters and hyphens",
  /** Error message for empty category name after trimming */
  EMPTY_CATEGORY_NAME: "Category name cannot be empty",

  // Metadata validation
  /** Error message for lastUpdated field not matching YYYY-MM-DD format */
  INVALID_DATE_FORMAT: "Invalid date format in lastUpdated",

  // Quiz validation
  /** Error message for quiz data with empty categories array */
  NO_CATEGORIES: "Quiz must have at least one category",
  /** Error message for duplicate category IDs within the same quiz */
  DUPLICATE_CATEGORY_ID: "Duplicate category id found",
  /** Error message for metadata totalQuestions not matching actual question count */
  TOTAL_QUESTIONS_MISMATCH: "Total questions count mismatch",
  /** Error message for missing metadata object in quiz data */
  METADATA_REQUIRED: "Metadata is required",
} as const;

/**
 * Schema for question types in the quiz system.
 * Enforces the two supported question formats to maintain consistency
 * across the application and ensure proper UI rendering.
 */
const QuestionTypeSchema = v.picklist(
  ["single", "multiple"],
  ERROR_MESSAGES.INVALID_QUESTION_TYPE,
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
      v.minLength(1, ERROR_MESSAGES.EMPTY_QUESTION_TEXT),
    ),
    options: v.pipe(
      v.array(v.string()),
      v.minLength(
        VALIDATION_CONSTANTS.MIN_OPTIONS_COUNT,
        ERROR_MESSAGES.INSUFFICIENT_OPTIONS,
      ),
    ),
    correct: v.array(v.number()),
    explanation: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(1, ERROR_MESSAGES.EMPTY_EXPLANATION),
    ),
  }),
  v.check(
    (data) => hasValidCorrectIndices(data),
    ERROR_MESSAGES.INVALID_CORRECT_INDEX,
  ),
  v.check(
    (data) => hasSingleCorrectAnswer(data),
    ERROR_MESSAGES.SINGLE_CHOICE_MULTIPLE_ANSWERS,
  ),
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
        VALIDATION_CONSTANTS.CATEGORY_ID_REGEX,
        ERROR_MESSAGES.INVALID_CATEGORY_ID,
      ),
    ),
    name: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(1, ERROR_MESSAGES.EMPTY_CATEGORY_NAME),
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
    v.regex(
      VALIDATION_CONSTANTS.DATE_REGEX,
      ERROR_MESSAGES.INVALID_DATE_FORMAT,
    ),
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
      v.minLength(1, ERROR_MESSAGES.NO_CATEGORIES),
    ),
  }),
  v.check(
    (data) => hasUniqueCategories(data.categories as unknown[]),
    ERROR_MESSAGES.DUPLICATE_CATEGORY_ID,
  ),
  v.check(
    (data) => hasTotalQuestionsMatch(data),
    ERROR_MESSAGES.TOTAL_QUESTIONS_MISMATCH,
  ),
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
 * Helper function to validate data structure integrity before processing.
 * Used in check functions to safely handle incomplete or malformed data.
 *
 * @param data - Data object to validate
 * @param requiredFields - Array of required field names to check
 * @returns True if data structure is valid, false otherwise
 */

/**
 * Creates a properly formatted field path from Valibot path information.
 * Converts Valibot's internal path format to dot notation with array indices.
 *
 * @param valibotPath - Path array from Valibot validation issue
 * @returns Formatted field path string
 */
function createFieldPath(valibotPath: Array<{ key: unknown }>): string {
  if (!valibotPath || valibotPath.length === 0) return "";

  return valibotPath
    .map((p) => {
      if (typeof p.key === "number") {
        return `[${p.key}]`;
      }
      return String(p.key);
    })
    .join(".")
    .replace(/^\./, "") // Remove leading dot
    .replace(/\.\[/g, "["); // Clean up array notation
}

/**
 * Maps Valibot error messages to application-specific error messages.
 * Handles special cases where Valibot's default messages need adjustment.
 *
 * @param originalMessage - Original error message from Valibot
 * @returns Mapped error message
 */
function mapErrorMessage(originalMessage: string): string {
  if (
    originalMessage.includes('Expected "metadata"') &&
    originalMessage.includes("undefined")
  ) {
    return ERROR_MESSAGES.METADATA_REQUIRED;
  }

  return originalMessage;
}

/**
 * Validates that all correct answer indices are within the valid range of options.
 * @param data - Question data to validate
 * @returns True if all indices are valid, false otherwise
 */
function hasValidCorrectIndices(data: {
  correct: unknown;
  options: unknown;
}): boolean {
  if (!Array.isArray(data.correct) || !Array.isArray(data.options)) {
    return true; // Skip validation if data structure is incomplete
  }

  return data.correct.every(
    (index: unknown) =>
      typeof index === "number" &&
      index >= 0 &&
      index < (data.options as unknown[]).length,
  );
}

/**
 * Validates that single choice questions have exactly one correct answer.
 * @param data - Question data to validate
 * @returns True if validation passes, false otherwise
 */
function hasSingleCorrectAnswer(data: {
  type: unknown;
  correct: unknown;
}): boolean {
  if (data.type === "single" && Array.isArray(data.correct)) {
    return (
      data.correct.length === VALIDATION_CONSTANTS.SINGLE_CHOICE_CORRECT_COUNT
    );
  }
  return true;
}

/**
 * Validates that category IDs are unique within the categories array.
 * @param categories - Array of categories to validate
 * @returns True if all IDs are unique, false otherwise
 */
function hasUniqueCategories(categories: unknown[]): boolean {
  if (!Array.isArray(categories)) {
    return true; // Skip validation if data structure is incomplete
  }

  const ids = categories.map((cat) => (cat as { id: unknown }).id);
  const uniqueIds = new Set(ids);
  return ids.length === uniqueIds.size;
}

/**
 * Validates that the total questions count in metadata matches the actual count.
 * @param data - Quiz data to validate
 * @returns True if counts match, false otherwise
 */
function hasTotalQuestionsMatch(data: {
  categories: unknown;
  metadata: unknown;
}): boolean {
  if (!data.categories || !Array.isArray(data.categories) || !data.metadata) {
    return true; // Skip validation if data structure is incomplete
  }

  const actualCount = data.categories.reduce(
    (sum: number, cat: { questions: unknown[] }) => sum + cat.questions.length,
    0,
  );
  return (
    (data.metadata as { totalQuestions: number }).totalQuestions === actualCount
  );
}

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
 * **Conversion Strategy:**
 * - Takes the first validation issue from the array (fails fast)
 * - Converts Valibot's path format to dot notation with array indices
 * - Maps specific error messages (e.g., metadata required errors)
 * - Combines base path with field path for nested validation contexts
 *
 * @param issues - Validation issues from Valibot
 * @param basePath - Base field path to prepend to error paths
 * @returns Structured QuizParseError with field path information
 * 
 * @example
 * ```typescript
 * // Input: Valibot issues for missing metadata
 * const issues = [{ 
 *   message: 'Expected "metadata" but received undefined',
 *   path: [{ key: 'metadata' }]
 * }];
 * 
 * // Output: QuizParseError
 * const error = convertValibotError(issues, 'quiz');
 * // error.message: "Metadata is required"
 * // error.field: "quiz.metadata"
 * ```
 */
function convertValibotError(
  issues: v.BaseIssue<unknown>[],
  basePath: string = "",
): QuizParseError {
  const issue = issues[0]; // Take the first issue

  // Convert path using helper function
  const path = issue.path ? createFieldPath(issue.path) : "";
  const fullPath = basePath
    ? `${basePath}.${path}`.replace(/\.\[/g, "[")
    : path;

  // Map error message using helper function
  const message = mapErrorMessage(issue.message);

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
