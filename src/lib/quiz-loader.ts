/**
 * Quiz data loading functionality with functional programming principles
 *
 * This module provides type-safe loading of quiz data from YAML files,
 * using dependency injection and Result types for robust error handling.
 */

import type { QuizData } from "../schema/quiz";
import { parseQuizData, QuizParseError } from "../schema/quiz";
import type { Result } from "../util/types";

/**
 * Error types for quiz loading operations
 */
export type QuizLoadErrorType =
  | "FILE_NOT_FOUND"
  | "PARSE_ERROR"
  | "VALIDATION_ERROR"
  | "UNKNOWN_ERROR";

/**
 * Custom error class for quiz loading failures.
 * Provides structured error information to help identify exactly what
 * went wrong during the loading process, enabling precise error reporting.
 */
export class QuizLoadError extends Error {
  /** The type of error that occurred */
  public type: QuizLoadErrorType;
  /** The file path that caused the error */
  public filePath?: string;

  /**
   * Creates a new QuizLoadError.
   *
   * @param message - Human-readable error description
   * @param type - The type of error that occurred
   * @param filePath - Optional file path where the error occurred
   */
  constructor(message: string, type: QuizLoadErrorType, filePath?: string) {
    super(message);
    this.name = "QuizLoadError";
    this.type = type;
    this.filePath = filePath;
  }
}

/**
 * File content with its source path information
 */
export type FileContent = {
  readonly filePath: string;
  readonly rawData: unknown;
};

/**
 * Function type for loading raw file content
 */
export type FileLoader = (
  filePath: string,
) => Promise<Result<FileContent, QuizLoadError>>;

/**
 * Function type for validating raw data to QuizData
 */
export type DataValidator = (
  content: FileContent,
) => Result<QuizData, QuizLoadError>;

/**
 * Converts QuizParseError to QuizLoadError with proper context
 */
function mapParseError(error: QuizParseError, filePath: string): QuizLoadError {
  return new QuizLoadError(
    `Validation failed: ${error.message}`,
    "VALIDATION_ERROR",
    filePath,
  );
}

/**
 * Validates file content using the existing parseQuizData function.
 * This is a pure function that doesn't perform any I/O operations.
 *
 * @param content - File content with path information
 * @returns Result containing validated QuizData or error
 */
export const validateQuizData: DataValidator = (
  content: FileContent,
): Result<QuizData, QuizLoadError> => {
  try {
    const quizData = parseQuizData(content.rawData);
    return { success: true, data: quizData };
  } catch (error) {
    // Handle known QuizParseError separately to preserve detailed validation information
    if (error instanceof QuizParseError) {
      return { success: false, error: mapParseError(error, content.filePath) };
    }

    // Wrap any other unexpected exceptions (e.g., JSON parsing errors, memory issues)
    // into a generic PARSE_ERROR to maintain consistent error interface
    const loadError = new QuizLoadError(
      `Parse error: ${error instanceof Error ? error.message : "Unknown error"}`,
      "PARSE_ERROR",
      content.filePath,
    );
    return { success: false, error: loadError };
  }
};

/**
 * Default file loader using Vite's YAML plugin
 * This function performs I/O and should be injected as a dependency
 */
export const viteYamlLoader: FileLoader = async (
  filePath: string,
): Promise<Result<FileContent, QuizLoadError>> => {
  try {
    const module = await import(/* @vite-ignore */ filePath);
    const rawData = module.default || module;

    return {
      success: true,
      data: { filePath, rawData },
    };
  } catch (_error) {
    const loadError = new QuizLoadError(
      `Failed to load file: ${filePath}`,
      "FILE_NOT_FOUND",
      filePath,
    );
    return { success: false, error: loadError };
  }
};

/**
 * Loads and validates quiz data from a YAML file using dependency injection.
 *
 * This function is pure and composable - it takes a file loader as a dependency,
 * making it easy to test and configure for different environments.
 *
 * @param loader - Function to load file content
 * @param validator - Function to validate raw data
 * @param filePath - Path to the YAML file to load
 * @returns Promise that resolves to Result containing QuizData or error
 */
export async function loadQuizData(
  loader: FileLoader,
  validator: DataValidator,
  filePath: string,
): Promise<Result<QuizData, QuizLoadError>> {
  const loadResult = await loader(filePath);

  if (!loadResult.success) {
    return loadResult;
  }

  return validator(loadResult.data);
}

/**
 * Convenience function that uses default implementations.
 *
 * Design Rationale:
 * We provide this as a separate function rather than using default parameters
 * in loadQuizData for several important reasons:
 *
 * 1. **Explicit Dependency Injection**: The core loadQuizData function forces
 *    callers to explicitly provide dependencies, making the function's requirements
 *    clear and enabling easy testing with mocks.
 *
 * 2. **Exception vs Result Patterns**: This function converts the Result type
 *    back to exceptions for callers who prefer traditional error handling,
 *    while keeping the core function pure and composable.
 *
 * 3. **API Clarity**: Having two distinct functions makes it obvious which
 *    approach you're taking - dependency injection (loadQuizData) vs
 *    convenience with defaults (loadQuizDataWithDefaults).
 *
 * 4. **Future Flexibility**: If we need different default implementations
 *    (e.g., for different environments), we can create new convenience functions
 *    without changing the core API.
 *
 * For most production use cases, this is the function you want to call.
 * For testing or custom implementations, use loadQuizData directly.
 *
 * @param filePath - Path to the YAML file to load
 * @returns Promise that resolves to validated QuizData
 * @throws {QuizLoadError} When file loading or validation fails
 */
export async function loadQuizDataWithDefaults(
  filePath: string,
): Promise<QuizData> {
  const result = await loadQuizData(viteYamlLoader, validateQuizData, filePath);

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}
