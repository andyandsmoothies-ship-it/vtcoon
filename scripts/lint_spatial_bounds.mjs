#!/usr/bin/env node

/**
 * scripts/lint_spatial_bounds.mjs
 * Facade entrypoint for AST Dual-Bound Spatial Assertion Linter
 */

import fs from 'node:fs';
import { auditDualBoundSpatialAssertions } from './plan_audit/rules_spatial_bounds.mjs';

export { auditDualBoundSpatialAssertions };

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('scripts/lint_spatial_bounds.mjs')) {
  const files = process.argv.slice(2);
  let totalErrors = 0;
  for (const f of files) {
    if (fs.existsSync(f)) {
      const { errors } = auditDualBoundSpatialAssertions(fs.readFileSync(f, 'utf8'), f);
      totalErrors += errors.length;
    }
  }
  if (totalErrors > 0) process.exit(1);
}
