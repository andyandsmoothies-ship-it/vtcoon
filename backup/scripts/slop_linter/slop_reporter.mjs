/**
 * Formats and prints slop linter results.
 */
export function formatSlopResults(files, allErrors, allWarnings) {
  if (allWarnings.length > 0) {
    console.log(`\n⚠️  [Anti-Slop Linter] ${allWarnings.length} Soft Warning(s):`);
    for (const w of allWarnings) {
      console.log(`  [${w.rule}] ${w.file}:${w.line} - ${w.message}`);
    }
  }

  if (allErrors.length > 0) {
    console.error(`\n❌ [Anti-Slop Linter] ${allErrors.length} Hard Violation(s) Detected:`);
    for (const err of allErrors) {
      console.error(`  [${err.rule}] ${err.file}:${err.line} - ${err.message}`);
    }
    return { success: false, errors: allErrors, warnings: allWarnings };
  }

  console.log(`✅ [Anti-Slop Linter] Clean! 0 Hard Violations across ${files.length} files.\n`);
  return { success: true, errors: allErrors, warnings: allWarnings };
}
