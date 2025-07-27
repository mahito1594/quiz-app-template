/**
 * Common utility types used across the application
 *
 * This module provides reusable type definitions that implement common
 * patterns in functional programming and error handling.
 */

/**
 * Result type for explicit error handling without exceptions
 *
 * This type represents the outcome of an operation that can either succeed
 * or fail. It's inspired by Rust's Result type and provides a type-safe
 * way to handle errors without throwing exceptions.
 *
 * @template T - The type of the success value
 * @template E - The type of the error value
 *
 * @example
 * ```typescript
 * function parseNumber(input: string): Result<number, string> {
 *   const num = Number(input);
 *   if (isNaN(num)) {
 *     return { success: false, error: "Invalid number format" };
 *   }
 *   return { success: true, data: num };
 * }
 *
 * const result = parseNumber("42");
 * if (result.success) {
 *   console.log(result.data); // TypeScript knows this is number
 * } else {
 *   console.error(result.error); // TypeScript knows this is string
 * }
 * ```
 *
 * Note: If more complex Result type utilities are needed in the future,
 * consider using a well-tested library like es-toolbelt or fp-ts instead
 * of implementing custom helper functions.
 */
export type Result<T, E> =
  | { success: true; data: T }
  | { success: false; error: E };
