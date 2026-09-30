import { expect } from 'vitest';

/**
 * Canonical 5+ boundary inputs for defensive IO and network data parsing.
 * Stack-agnostic and universally applicable to any data mapper/resolver.
 */
export const CANONICAL_BOUNDARIES: readonly unknown[] = [
  undefined,
  null,
  '',
  '   ',
  NaN,
  -1,
  {},
  [],
];

/**
 * Asserts that the target parser/resolver survives canonical boundary inputs
 * without throwing unhandled TypeErrors (e.g. Cannot read properties of null/undefined).
 */
export function assertSurvivesBoundaryFuzz(
  fn: (input: any) => unknown,
  contextName = 'anonymous'
): void {
  for (const val of CANONICAL_BOUNDARIES) {
    try {
      fn(val);
    } catch (err: unknown) {
      if (err instanceof TypeError) {
        throw new Error(
          `[BoundaryFuzzer] '${contextName}' crashed with TypeError on boundary input (${typeof val}): ${String(val)}. Details: ${(err as Error).message}`
        );
      }
    }
  }
}
