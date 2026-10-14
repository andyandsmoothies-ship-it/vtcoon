/**
 * scripts/boundary_linter/boundary_reporter.mjs
 * 
 * Formatter and reporter for Subsystem Boundary and Cycle Linter.
 */

export function formatBoundaryResults(errors, warnings, cycles = []) {
  let output = '';

  if (warnings.length > 0) {
    output += `\n⚠️  [BOUNDARY WARNINGS] Found ${warnings.length} architectural warnings:\n`;
    for (const w of warnings) {
      output += `  - [${w.rule}] ${w.file}:${w.line}\n    ${w.message}\n`;
    }
  }

  if (errors.length > 0) {
    output += `\n❌ [BOUNDARY ERRORS] Found ${errors.length} hard boundary violations:\n`;
    for (const e of errors) {
      output += `  - [${e.rule}] ${e.file}:${e.line}\n    ${e.message}\n`;
    }
  }

  if (cycles.length > 0) {
    output += `\n🔄 [CIRCULAR DEPENDENCY CYCLES] Found ${cycles.length} strongly connected components:\n`;
    cycles.forEach((c, idx) => {
      output += `  [SCC-${idx + 1}] (${c.length} files in cycle):\n`;
      c.forEach(f => {
        output += `    -> ${f}\n`;
      });
    });
  }

  return output;
}
