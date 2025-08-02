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
 * @example
 * ```typescript
 * // Handling multiple error types with union types
 * type ValidationError = "empty" | "too_short" | "invalid_format";
 *
 * function validatePassword(password: string): Result<string, ValidationError> {
 *   if (!password) return { success: false, error: "empty" };
 *   if (password.length < 8) return { success: false, error: "too_short" };
 *   if (!/[A-Z]/.test(password)) return { success: false, error: "invalid_format" };
 *   return { success: true, data: password };
 * }
 *
 * const validation = validatePassword("weak");
 * if (validation.success) {
 *   // validation.data is string (validated password)
 *   console.log("Password accepted:", validation.data);
 * } else {
 *   // validation.error is ValidationError
 *   switch (validation.error) {
 *     case "empty": console.log("Password is required"); break;
 *     case "too_short": console.log("Password must be at least 8 characters"); break;
 *     case "invalid_format": console.log("Password must contain uppercase letter"); break;
 *   }
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
