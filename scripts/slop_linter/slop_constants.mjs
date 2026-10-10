import fs from 'node:fs';
import path from 'node:path';

export const SLOP_RULES = {
  ZERO_SWALLOWED_CATCH: 'zero-swallowed-catch',
  ZERO_DIRTY_CASTS: 'zero-dirty-casts',
  FILE_LOC_BUDGET: 'file-loc-budget',
  FUNCTION_LOC_BUDGET: 'function-loc-budget',
  ZERO_WORKAROUND_COMMENTS: 'zero-workaround-comments',
  ZERO_GETTER_PROXIES: 'zero-getter-proxies',
  ZERO_PSEUDO_PROXIES: 'zero-pseudo-proxies',
  ZERO_TEST_PROPS: 'zero-test-props',
  ATOMIC_TEST_MAX_ASSERTS: 'atomic-test-max-asserts',
  ZERO_DEAD_SSR: 'zero-dead-ssr',
  ZERO_ORPHAN_PRODUCTION_FILES: 'zero-orphan-production-files',
  MARKDOWN_HYGIENE_LATEX: 'markdown-hygiene-latex',
  ZERO_RAW_CANVAS_DOM: 'zero-raw-canvas-dom',
  EULER_YAW_CLAMP: 'euler-yaw-clamp',
  CLIENT_SERVER_BOUNDARY: 'client-server-boundary',
  ZERO_ALLOCATION_RENDER_LOOP: 'zero-allocation-render-loop',
  R3F_NO_CONDITIONAL_RETURN_NULL: 'r3f-no-conditional-return-null',
  KINEMATICS_FINITE_DEFENSE: 'kinematics-finite-defense',
};

export const TIER_BUDGETS = {
  TIER1_LOGIC: { maxWarn: 300, maxError: 550 },
  TIER2_UI: { maxWarn: 400, maxError: 500 },
  TIER3_STATIC: { maxWarn: 650, maxError: 800 },
  TIER_TEST: { maxWarn: 600, maxError: 650 },
};

/**
 * Categorizes a file path into its appropriate budget tier.
 */
export function categorizeFile(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  if (norm.includes('/tests/') || norm.startsWith('tests/')) {
    return 'TIER_TEST';
  }
  if (norm.includes('tile_icons.ts') || norm.includes('property_manager_data.ts') || norm.includes('board_config.ts')) {
    return 'TIER3_STATIC';
  }
  if (norm.includes('src/client/ui/') || norm.includes('src/client/3d/') || norm.endsWith('.tsx')) {
    return 'TIER2_UI';
  }
  if (norm.includes('src/domain/') || norm.includes('src/server/')) {
    return 'TIER1_LOGIC';
  }
  return 'TIER1_LOGIC';
}

/**
 * Recursively retrieves all TypeScript/TSX source files.
 */
export function getSourceFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const stat = fs.statSync(dir);
  if (!stat.isDirectory()) {
    if ((dir.endsWith('.ts') || dir.endsWith('.tsx')) && !dir.endsWith('.d.ts')) {
      fileList.push(dir);
    }
    return fileList;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.agents') {
        getSourceFiles(fullPath, fileList);
      }
    } else if ((entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) && !entry.name.endsWith('.d.ts')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}
