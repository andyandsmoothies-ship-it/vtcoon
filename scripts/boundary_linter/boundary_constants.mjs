/**
 * scripts/boundary_linter/boundary_constants.mjs
 * 
 * Constants and baselines for Subsystem Boundary and Cycle Linter.
 */

import path from 'node:path';

export const BOUNDARY_RULES = {
  CLIENT_IMPORTS_SERVER: 'BOUNDARY-01: Client MUST NOT import from Server internals',
  DEEP_RELATIVE_IMPORT: 'SEAM-01: Relative import exceeds depth threshold (>= 3 levels)',
  CIRCULAR_DEPENDENCY: 'CYCLE-01: Circular dependency loop detected',
};

// Known legacy files with Client -> Server imports (to be retired in Phase 1)
// The Ratchet Pattern: Legacy files trigger WARNING; new files or new violations trigger HARD ERROR.
export const KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS = new Set([]);

export function normalizeRelPath(p) {
  return p.replace(/\\/g, '/');
}
