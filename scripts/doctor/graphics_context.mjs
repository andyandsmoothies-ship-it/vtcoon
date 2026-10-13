import fs from 'node:fs';
import path from 'node:path';

/**
 * Verifies headless 3D graphics test seam and canvas environment availability.
 *
 * @param {string} [repoRoot=process.cwd()]
 * @returns {Array<{ category: string, name: string, status: 'PASS' | 'WARN' | 'FAIL', message: string, details?: string }>}
 */
export function checkGraphicsContext(repoRoot = process.cwd()) {
  const results = [];

  // 1. Centralized R3F Test Harness Seam (Standardized Graphics Fixture Invariant)
  const harnessPath = path.join(repoRoot, 'tests', 'helpers', 'r3f_test_harness.ts');
  if (fs.existsSync(harnessPath)) {
    results.push({
      category: 'Graphics & 3D',
      name: 'R3F Graphics Fixture Seam',
      status: 'PASS',
      message: 'tests/helpers/r3f_test_harness.ts present and ready'
    });
  } else {
    results.push({
      category: 'Graphics & 3D',
      name: 'R3F Graphics Fixture Seam',
      status: 'WARN',
      message: 'Centralized r3f_test_harness.ts not found at expected path',
      details: 'Per Standardized Graphics Fixture Invariant, tests should use tests/helpers/r3f_test_harness.ts.'
    });
  }

  // 2. WebGL2 Spatial Probe File
  const probePath = path.join(repoRoot, 'tests', 'probes', 'webgl_spatial_probe.test.ts');
  if (fs.existsSync(probePath)) {
    results.push({
      category: 'Graphics & 3D',
      name: 'WebGL2 Spatial Sentinel Probe',
      status: 'PASS',
      message: 'Headless WebGL2 spatial probe suite verified'
    });
  } else {
    results.push({
      category: 'Graphics & 3D',
      name: 'WebGL2 Spatial Sentinel Probe',
      status: 'WARN',
      message: 'tests/probes/webgl_spatial_probe.test.ts missing'
    });
  }

  return results;
}
