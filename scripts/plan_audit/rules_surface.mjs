import fs from 'node:fs';
import path from 'node:path';
import { findSourceFiles } from './plan_markdown_parser.mjs';

/**
 * scripts/plan_audit/rules_surface.mjs
 * 
 * Physical surface area audit:
 * 1. Ambient Module Augmentation Scanner (protects declare module in tests/**).
 * 2. Export Parity & Consumer Guard (catches dropped exports imported by tests/** or src/**).
 * 3. Pre-flight Surface Area Prober (CLI utility for Station 0).
 */

/**
 * Checks for ambient `declare module` referencing target files in tests/**.
 */
export function auditAmbientModuleAugmentation(targetFiles, planContent) {
  let errors = 0;
  const testFiles = findSourceFiles('tests');
  if (testFiles.length === 0) return 0;

  // Cache test file contents for fast scanning
  const testContents = new Map();
  for (const tf of testFiles) {
    const content = fs.readFileSync(tf, 'utf8');
    if (content.includes('declare module')) {
      testContents.set(tf, content);
    }
  }

  if (testContents.size === 0) return 0;

  for (const [relPath] of targetFiles.entries()) {
    const baseName = path.basename(relPath).replace(/\.(ts|tsx|js|jsx)$/, '');
    const modulePattern = new RegExp(`declare\\s+module\\s+['"][^'"]*\\b${baseName}(?:\\.[a-z]+)?['"]`, 'g');

    for (const [testPath, content] of testContents.entries()) {
      if (modulePattern.test(content)) {
        const testRelPath = path.relative(process.cwd(), testPath).replace(/\\/g, '/');
        // Check if plan specifies deleting or converting to stub
        const fileTargetSnippetRegex = new RegExp(`Target physical file.*?:\\s*[\`']?.*?${baseName}\\.[a-z]+[\`']?([\\s\\S]*?)(?:Target physical file|##|$)`, 'i');
        const snippetMatch = planContent.match(fileTargetSnippetRegex);
        const snippetText = snippetMatch ? snippetMatch[1] : '';

        const isDeleting = /deleted|xóa|decommission/i.test(snippetText) && !/export\s+\*/i.test(snippetText);
        const hasExportStar = /export\s+\*\s+from/i.test(snippetText);
        const mentionsTestInPlan = planContent.includes(path.basename(testRelPath));

        if (isDeleting && !hasExportStar && !mentionsTestInPlan) {
          console.error(`  ❌ [AMBIENT_MODULE_AUGMENTATION_TRAP] Target file '${relPath}' has an ambient declaration in '${testRelPath}'!`);
          console.error(`     Deleting this file without a backward-compatible 'export * from ...' stub or without updating the test file will cause compiler failure.`);
          console.error(`     Remediation: Retain 'export * from ...' stub in plan or add '${testRelPath}' to plan target files.`);
          errors++;
        }
      }
    }
  }

  return errors;
}

/**
 * Checks if target files drop exports that are actively consumed in tests/** or src/**.
 * Triggers when a target file is decommissioned, converted to a stub, or has its exports restructured.
 */
export function auditExportParityAndCallers(targetFiles, planContent) {
  let errors = 0;
  const allSourceFiles = [...findSourceFiles('src'), ...findSourceFiles('tests')];

  for (const [relPath, isNew] of targetFiles.entries()) {
    if (isNew) continue;
    const absPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(absPath)) continue;

    const baseName = path.basename(relPath).replace(/\.(ts|tsx|js|jsx)$/, '');
    const diskContent = fs.readFileSync(absPath, 'utf8');

    // Check if the plan provides a replacement specification for this file
    const fileTargetSnippetRegex = new RegExp(`Target physical file.*?:\\s*[\`']?.*?${baseName}\\.[a-z]+[\`']?([^\n]*)\n([\\s\\S]*?)(?:Target physical file|##|$)`, 'i');
    const snippetMatch = planContent.match(fileTargetSnippetRegex);
    if (!snippetMatch) continue;

    const headerSuffix = (snippetMatch[1] || '').toLowerCase();
    const snippetText = snippetMatch[2];

    // Only audit when a file is decommissioned, converted to stub, or its exports block is explicitly restructured
    const isDiffEdit = /<<<<[\s\S]*?====[\s\S]*?>>>>/.test(snippetText);
    const isStubOrDecommission = /stub|decommission|deleted|xóa|re-export stub/i.test(headerSuffix);
    const hasReExportBlock = !isDiffEdit && (/export\s+(?:type\s+)?\{[^}]+\}\s+from/i.test(snippetText) || /export\s+\{[^}]+\}/i.test(snippetText));

    if (!isStubOrDecommission && !hasReExportBlock) {
      // Pure additive or localized diff modification, existing disk exports remain intact.
      continue;
    }

    // If plan uses `export * from`, all symbols are preserved transitively
    if (/export\s+\*\s+from/i.test(snippetText)) continue;

    // Extract exported symbols from disk
    const diskExports = new Set();
    const namedExportRegex = /export\s+(?:type\s+|interface\s+|const\s+|function\s+|class\s+|let\s+|var\s+)([A-Za-z0-9_$]+)/g;
    let m;
    while ((m = namedExportRegex.exec(diskContent)) !== null) {
      diskExports.add(m[1]);
    }
    const blockExportRegex = /export\s*(?:type\s*)?\{([^}]+)\}/g;
    while ((m = blockExportRegex.exec(diskContent)) !== null) {
      const items = m[1].split(',');
      for (const item of items) {
        const clean = item.replace(/type\s+/g, '').trim().split(/\s+as\s+/)[0].trim();
        if (clean && /^[A-Za-z0-9_$]+$/.test(clean)) diskExports.add(clean);
      }
    }

    if (diskExports.size === 0) continue;

    // Check which disk exports are dropped from the plan specification
    for (const symbol of diskExports) {
      const inPlanSnippet = new RegExp(`\\b${symbol}\\b`).test(snippetText);
      const inPlanCallSite = new RegExp(`\\b${symbol}\\b`).test(planContent);

      if (!inPlanSnippet && !inPlanCallSite) {
        // Verify if any file in tests/** actively imports this symbol from this file
        for (const sf of allSourceFiles) {
          const sfRel = path.relative(process.cwd(), sf).replace(/\\/g, '/');
          if (sfRel === relPath) continue;

          // Check if sfRel imports from relPath
          const sfContent = fs.readFileSync(sf, 'utf8');
          const importFromTargetRegex = new RegExp(`import\\s+[^;]*?\\b${symbol}\\b[^;]*?from\\s+['"][^'"]*\\b${baseName}(?:\\.[a-z]+)?['"]`);
          if (importFromTargetRegex.test(sfContent)) {
            console.error(`  ❌ [ORPHANED_EXPORT_CONSUMER_TRAP] Symbol '${symbol}' from '${relPath}' is imported by '${sfRel}', but is omitted from the plan's specification without re-export or rewiring!`);
            console.error(`     This will cause compiler error: Module has no exported member '${symbol}'.`);
            console.error(`     Remediation: Re-export '${symbol}' from the target file or rewire '${sfRel}' in the plan.`);
            errors++;
            break; // Report once per dropped symbol
          }
        }
      }
    }
  }

  return errors;
}

/**
 * Inspects physical disk surface for target files and returns telemetry report.
 */
export function probeTargetFilesSurface(targetFilePaths) {
  const allSourceFiles = [...findSourceFiles('src'), ...findSourceFiles('tests')];
  const results = [];

  for (const relPath of targetFilePaths) {
    const normalizedRel = relPath.replace(/\\/g, '/');
    const absPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(absPath)) {
      results.push({ path: normalizedRel, exists: false });
      continue;
    }

    const content = fs.readFileSync(absPath, 'utf8');
    const lines = content.split('\n');
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
    const sloc = lines.filter((l) => l.trim().length > 0 && !l.trim().startsWith('//')).length;

    const baseName = path.basename(normalizedRel).replace(/\.(ts|tsx|js|jsx)$/, '');
    const importRegex = new RegExp(`from\\s+['"][^'"]*\\b${baseName}(?:\\.[a-z]+)?['"]`);
    const declareModuleRegex = new RegExp(`declare\\s+module\\s+['"][^'"]*\\b${baseName}(?:\\.[a-z]+)?['"]`);

    const srcCallers = [];
    const testCallers = [];
    const ambientAugmentations = [];

    for (const sf of allSourceFiles) {
      const sfRel = path.relative(process.cwd(), sf).replace(/\\/g, '/');
      if (sfRel === normalizedRel) continue;

      const sfContent = fs.readFileSync(sf, 'utf8');
      if (importRegex.test(sfContent)) {
        if (sfRel.startsWith('tests/')) {
          testCallers.push(sfRel);
        } else {
          srcCallers.push(sfRel);
        }
      }
      if (sfRel.startsWith('tests/') && declareModuleRegex.test(sfContent)) {
        ambientAugmentations.push(sfRel);
      }
    }

    results.push({
      path: normalizedRel,
      exists: true,
      physicalLines: lines.length,
      sloc,
      srcCallers,
      testCallers,
      ambientAugmentations,
    });
  }

  return results;
}
