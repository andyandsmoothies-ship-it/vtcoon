/**
 * [3D SPATIAL INVARIANTS] Validation functions for Three.js render metrics.
 * Aligned strictly with SSOT PERF_BUDGET_LIMITS in perf_budget.ts.
 */

export function validateDrawCallsBudget(calls: number, limit = 85): boolean {
  if (!Number.isFinite(calls)) return false;
  if (!Number.isFinite(limit)) return false;
  if (calls >= 0 && calls <= limit) {
    return true;
  }
  return false;
}
