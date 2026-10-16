/**
 * scripts/plan_audit/rules_spatial_bounds.mjs
 * AST Dual-Bound Spatial Assertion Linter (IMP-408)
 *
 * Enforces that spatial coordinate assertions include paired upper and lower bounds
 * (or Math.abs symmetric bounds) to eliminate one-sided drifting bugs.
 */

const SPATIAL_KEYWORDS = /\b(?:position|worldPosition|localX|localZ|archwayWorldPosition|offset|ndcX|ndcY|tangentX|clearance|bounding|plinth|pedestal|dais)\b|mesh\.position/i;
const NON_SPATIAL_KEYWORDS = /\b(?:balance|cash|score|turnsCount|rent|price|tax|interest|netWorth|elapsed|delay|duration)\b/i;

export function auditDualBoundSpatialAssertions(testContent, filePath = '', options = {}) {
  const errors = [];
  const warnings = [];
  let checkedCount = 0;

  const isLegacy = Boolean(options.isLegacyBaseline);
  const blocks = /(?:it|test)\s*\(/g.test(testContent)
    ? testContent.split(/(?=(?:it|test)\s*\()/g)
    : [testContent];

  for (const block of blocks) {
    const subjectMap = new Map();

    const recordBound = (rawSubject, lower, upper) => {
      const subject = rawSubject.replace(/\s+/g, '');
      const current = subjectMap.get(subject) || { lower: false, upper: false };
      current.lower = current.lower || lower;
      current.upper = current.upper || upper;
      subjectMap.set(subject, current);
    };

    for (const line of block.split('\n')) {
      if (NON_SPATIAL_KEYWORDS.test(line) || !SPATIAL_KEYWORDS.test(line)) {
        continue;
      }

      // 1. Math.abs symmetric dual bounds: Math.abs(x) <= threshold (both lower and upper bound)
      const mathAbsMethod = line.match(/expect\(\s*Math\.abs\(([^)]+)\)\s*\)\s*\.\s*(?:toBeLessThan|toBeLessThanOrEqual)\s*\(/);
      const mathAbsCompare = line.match(/expect\(\s*Math\.abs\(([^)]+)\)\s*(?:<=|<)\s*[^)]+\)\s*\.\s*toBe\s*\(\s*true\s*\)/);
      if (mathAbsMethod || mathAbsCompare) {
        const raw = (mathAbsMethod || mathAbsCompare)[1];
        recordBound(raw, true, true);
        continue;
      }

      // 2. Lower bound assertions (>= or >)
      const lowerMethod = line.match(/expect\(([^)]+)\)\s*\.\s*(?:toBeGreaterThan|toBeGreaterThanOrEqual)\s*\(/);
      const lowerCompare = line.match(/expect\(([^)]+?)\s*(?:>=|>)\s*[^)]+\)\s*\.\s*toBe\s*\(\s*true\s*\)/);
      if (lowerMethod || lowerCompare) {
        const raw = (lowerMethod || lowerCompare)[1];
        recordBound(raw, true, false);
        continue;
      }

      // 3. Upper bound assertions (<= or <)
      const upperMethod = line.match(/expect\(([^)]+)\)\s*\.\s*(?:toBeLessThan|toBeLessThanOrEqual)\s*\(/);
      const upperCompare = line.match(/expect\(([^)]+?)\s*(?:<=|<)\s*[^)]+\)\s*\.\s*toBe\s*\(\s*true\s*\)/);
      if (upperMethod || upperCompare) {
        const raw = (upperMethod || upperCompare)[1];
        recordBound(raw, false, true);
        continue;
      }
    }

    for (const [subject, entry] of subjectMap) {
      checkedCount++;
      if (!entry.lower || !entry.upper) {
        const side = entry.lower ? 'lower only' : 'upper only';
        const msg = `[DUAL_BOUND_SPATIAL_VIOLATION] Spatial coordinate "${subject}" in ${filePath || 'test'} has one-sided inequality (${side}). Must assert paired bounds (>= and <=) or Math.abs symmetric bound.`;
        if (isLegacy) {
          warnings.push(msg);
        } else {
          errors.push(msg);
        }
      }
    }
  }

  return { errors, warnings, checkedCount };
}
