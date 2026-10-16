import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  resolveBlenderExecutable,
  formatBlenderDiagnosticInstructions,
  runBlenderPythonScript,
} from '../../scripts/blender/resolve_blender.mjs';
import {
  resolveBlenderExecutable as facadeResolveBlender,
  formatBlenderDiagnosticInstructions as facadeFormatBlender,
  runBlenderPythonScript as facadeRunBlender,
} from '../../scripts/resolve_blender.mjs';
import { auditDualBoundSpatialAssertions } from '../../scripts/plan_audit/rules_spatial_bounds.mjs';
import { auditDualBoundSpatialAssertions as facadeAuditDualBound } from '../../scripts/lint_spatial_bounds.mjs';

describe('IMP-408: Cross-Platform Blender CLI Resolver & AST Dual-Bound Spatial Linter', () => {
  describe('Blender CLI Path Resolver (TC-408.01) [UC-BLENDER-CLI-RESOLVER-CROSS-PLATFORM/MSS]', () => {
    it('TC-408.01a [UC-BLENDER-CLI-RESOLVER-CROSS-PLATFORM/MSS]: resolves blender binary from BLENDER_PATH override with source env', () => {
      const customPath = 'D:\\BlenderCustom\\blender.exe';
      const res = resolveBlenderExecutable({
        env: { BLENDER_PATH: customPath },
        platform: 'win32',
        existsSyncFn: (p: string) => p === customPath,
        execFileSyncFn: () => 'Blender 5.2.0 (sub 21)\nbuild date: 2026-08-01\n',
      });

      expect(res.exists).toBe(true);
      expect(res.path).toBe(customPath);
      expect(res.source).toBe('env');
      expect(res.version).toContain('5.2.0');
    });

    it('TC-408.01b [UC-BLENDER-CLI-RESOLVER-CROSS-PLATFORM/MSS]: resolves blender binary from BLENDER_EXE override when BLENDER_PATH is absent', () => {
      const customExe = '/opt/blender-5.2/blender';
      const res = resolveBlenderExecutable({
        env: { BLENDER_EXE: customExe },
        platform: 'linux',
        existsSyncFn: (p: string) => p === customExe,
        execFileSyncFn: () => 'Blender 5.2.1\n',
      });

      expect(res.exists).toBe(true);
      expect(res.path).toBe(customExe);
      expect(res.source).toBe('env');
    });

    it('TC-408.01c [UC-BLENDER-CLI-RESOLVER-CROSS-PLATFORM/MSS]: resolves standard Windows candidate path when platform is win32', () => {
      const winStandard = 'C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe';
      const res = resolveBlenderExecutable({
        env: {},
        platform: 'win32',
        existsSyncFn: (p: string) => p === winStandard,
        execFileSyncFn: () => 'Blender 5.2.0\n',
      });

      expect(res.exists).toBe(true);
      expect(res.path).toContain('Blender 5.2');
      expect(res.source).toBe('candidate');
    });

    it('TC-408.01d [UC-BLENDER-CLI-RESOLVER-CROSS-PLATFORM/MSS]: resolves standard macOS candidate path when platform is darwin', () => {
      const macStandard = '/Applications/Blender.app/Contents/MacOS/Blender';
      const res = resolveBlenderExecutable({
        env: {},
        platform: 'darwin',
        existsSyncFn: (p: string) => p === macStandard,
        execFileSyncFn: () => 'Blender 5.2.0\n',
      });

      expect(res.exists).toBe(true);
      expect(res.path).toBe(macStandard);
      expect(res.source).toBe('candidate');
    });

    it('TC-408.01e [UC-BLENDER-CLI-RESOLVER-CROSS-PLATFORM/MSS]: resolves standard Linux candidate path when platform is linux', () => {
      const linuxStandard = '/usr/bin/blender';
      const res = resolveBlenderExecutable({
        env: {},
        platform: 'linux',
        existsSyncFn: (p: string) => p === linuxStandard,
        execFileSyncFn: () => 'Blender 5.2.0\n',
      });

      expect(res.exists).toBe(true);
      expect(res.path).toBe(linuxStandard);
      expect(res.source).toBe('candidate');
    });

    it('TC-408.01f [UC-BLENDER-CLI-RESOLVER-CROSS-PLATFORM/MSS]: resolves system PATH command lookup when candidate paths are not found', () => {
      const res = resolveBlenderExecutable({
        env: { PATH: '/usr/local/bin:/usr/bin' },
        platform: 'linux',
        existsSyncFn: () => false,
        whichFn: (cmd: string) => (cmd === 'blender' ? '/usr/local/bin/blender' : null),
        execFileSyncFn: () => 'Blender 5.2.0\n',
      });

      expect(res.exists).toBe(true);
      expect(res.path).toBe('/usr/local/bin/blender');
      expect(res.source).toBe('path');
    });

    it('TC-408.01g [UC-BLENDER-CLI-RESOLVER-CROSS-PLATFORM/MSS]: returns empty shape when no blender executable exists anywhere', () => {
      const res = resolveBlenderExecutable({
        env: {},
        platform: 'linux',
        existsSyncFn: () => false,
        whichFn: () => null,
      });

      expect(res.exists).toBe(false);
      expect(res.path).toBeNull();
      expect(res.version).toBeNull();
      expect(res.source).toBe('none');
    });

    it('TC-408.01h [UC-BLENDER-CLI-RESOLVER-CROSS-PLATFORM/MSS]: formatBlenderDiagnosticInstructions provides actionable guidance across platforms', () => {
      const winDiag = formatBlenderDiagnosticInstructions('win32');
      const macDiag = formatBlenderDiagnosticInstructions('darwin');
      const linuxDiag = formatBlenderDiagnosticInstructions('linux');

      expect(winDiag).toMatch(/winget|BLENDER_PATH|Program Files/i);
      expect(macDiag).toMatch(/brew|Blender\.app|BLENDER_PATH/i);
      expect(linuxDiag).toMatch(/snap|apt|BLENDER_PATH/i);
    });

    it('TC-408.01i [UC-BLENDER-CLI-RESOLVER-CROSS-PLATFORM/MSS]: enforces relational covariance across different platform candidates', () => {
      const winRes = resolveBlenderExecutable({
        platform: 'win32',
        existsSyncFn: (p: string) => p.includes('Blender 5.2\\blender.exe'),
      });
      const macRes = resolveBlenderExecutable({
        platform: 'darwin',
        existsSyncFn: (p: string) => p.includes('Blender.app'),
      });
      const linuxRes = resolveBlenderExecutable({
        platform: 'linux',
        existsSyncFn: (p: string) => p === '/usr/bin/blender',
      });

      expect(winRes.path).not.toEqual(macRes.path);
      expect(macRes.path).not.toEqual(linuxRes.path);
      expect(winRes.path).not.toEqual(linuxRes.path);
    });
  });

  describe('Blender Python Runner Execution (TC-408.02) [UC-BLENDER-PYTHON-RUNNER-EXECUTION/MSS]', () => {
    it('TC-408.02a [UC-BLENDER-PYTHON-RUNNER-EXECUTION/MSS]: formats background and python flags in exact argument sequence with dryRun option', () => {
      const scriptPath = 'scripts/model_generators/test_script.py';
      const scriptArgs = ['--output', 'model.glb', '--lod', 'high'];

      const runResult = runBlenderPythonScript(scriptPath, scriptArgs, {
        dryRun: true,
        resolveFn: () => ({ exists: true, path: '/usr/bin/blender', version: '5.2.0', source: 'candidate' }),
      });

      expect(runResult.executed).toBe(true);
      expect(runResult.args).toEqual([
        '--background',
        '--python',
        scriptPath,
        '--',
        '--output',
        'model.glb',
        '--lod',
        'high',
      ]);
    });

    it('TC-408.02b [UC-BLENDER-PYTHON-RUNNER-EXECUTION/MSS]: forwards script execution safely through custom execFileSync without running heavy assets', () => {
      const calls: Array<{ bin: string; args: string[] }> = [];
      const mockExec = (bin: string, args: string[]) => {
        calls.push({ bin, args });
        return 'OK';
      };

      runBlenderPythonScript('dummy.py', ['--flag'], {
        resolveFn: () => ({ exists: true, path: 'C:\\blender.exe', version: '5.2.0', source: 'env' }),
        execFileSyncFn: mockExec,
      });

      expect(calls.length).toBe(1);
      expect(calls[0]?.bin).toBe('C:\\blender.exe');
    });

    it('TC-408.02c [UC-BLENDER-PYTHON-RUNNER-EXECUTION/MSS]: throws descriptive error when blender executable is not found', () => {
      expect(() =>
        runBlenderPythonScript('dummy.py', [], {
          resolveFn: () => ({ exists: false, path: null, version: null, source: 'none' }),
        }),
      ).toThrow(/Blender executable not found/i);
    });

    it('TC-408.02d [UC-BLENDER-PYTHON-RUNNER-EXECUTION/MSS]: throws descriptive error when execution fails with non-zero exit status', () => {
      expect(() =>
        runBlenderPythonScript('crash.py', [], {
          resolveFn: () => ({ exists: true, path: 'blender', version: '5.2.0', source: 'path' }),
          execFileSyncFn: () => {
            const err: Error & { status?: number } = new Error('Process exited with code 1');
            err.status = 1;
            throw err;
          },
        }),
      ).toThrow(/Blender execution failed/i);
    });
  });

  describe('AST Dual-Bound Spatial Linter Detection (TC-408.03) [UC-AST-DUAL-BOUND-SPATIAL-LINTER-DETECTION/MSS]', () => {
    const gte = 'toBeGreaterThanOrEqual';
    const lte = 'toBeLessThanOrEqual';
    const lt = 'toBeLessThan';
    const gt = 'toBeGreaterThan';

    it('TC-408.03a [UC-AST-DUAL-BOUND-SPATIAL-LINTER-DETECTION/MSS]: flags DUAL_BOUND_SPATIAL_VIOLATION for one-sided lower bound spatial inequality', () => {
      const codeSnippet = `
        it('tests archway position', () => {
          expect(seg.archwayWorldPosition[0]).${gte}(0.55);
        });
      `;
      const result = auditDualBoundSpatialAssertions(codeSnippet, 'tests/client/sample.test.ts');

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('DUAL_BOUND_SPATIAL_VIOLATION');
    });

    it('TC-408.03b [UC-AST-DUAL-BOUND-SPATIAL-LINTER-DETECTION/MSS]: flags DUAL_BOUND_SPATIAL_VIOLATION for one-sided upper bound spatial inequality', () => {
      const codeSnippet = `
        it('tests tile mesh coordinate', () => {
          expect(tile.mesh.position.y).${lte}(1.25);
        });
      `;
      const result = auditDualBoundSpatialAssertions(codeSnippet, 'tests/client/sample.test.ts');

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('DUAL_BOUND_SPATIAL_VIOLATION');
    });

    it('TC-408.03c [UC-AST-DUAL-BOUND-SPATIAL-LINTER-DETECTION/MSS]: passes with 0 errors when spatial coordinate has paired dual bounds', () => {
      const codeSnippet = `
        it('tests bounded archway coordinate', () => {
          expect(seg.archwayWorldPosition[0]).${gte}(0.55);
          expect(seg.archwayWorldPosition[0]).${lte}(0.65);
        });
      `;
      const result = auditDualBoundSpatialAssertions(codeSnippet, 'tests/client/sample.test.ts');

      expect(result.errors.length).toBe(0);
      expect(result.checkedCount).toBe(1);
    });

    it('TC-408.03d [UC-AST-DUAL-BOUND-SPATIAL-LINTER-DETECTION/MSS]: recognizes Math.abs symmetric inequality as valid dual-bounds without false alarms', () => {
      const codeSnippet = `
        it('tests symmetric plinth offset', () => {
          expect(Math.abs(plinth.worldPosition.x)).${lte}(0.65);
          expect(Math.abs(plinth.worldPosition.z) <= 0.65).toBe(true);
        });
      `;
      const result = auditDualBoundSpatialAssertions(codeSnippet, 'tests/client/sample.test.ts');

      expect(result.errors.length).toBe(0);
      expect(result.checkedCount).toBe(2);
    });

    it('TC-408.03e [UC-AST-DUAL-BOUND-SPATIAL-LINTER-DETECTION/MSS]: ignores non-spatial assertions such as currency balance or score thresholds', () => {
      const codeSnippet = `
        it('tests player economic balance', () => {
          expect(player.balance).${gte}(1000);
          expect(turnsCount).${lt}(100);
        });
      `;
      const result = auditDualBoundSpatialAssertions(codeSnippet, 'tests/domain/player.test.ts');

      expect(result.errors.length).toBe(0);
      expect(result.checkedCount).toBe(0);
    });

    it('TC-408.03f [UC-AST-DUAL-BOUND-SPATIAL-LINTER-DETECTION/MSS]: Ratchet Protocol downgrades one-sided spatial inequality to warnings for legacy baselines', () => {
      const codeSnippet = `
        it('tests legacy archway position', () => {
          expect(seg.archwayWorldPosition[0]).${gte}(0.55);
        });
      `;
      const result = auditDualBoundSpatialAssertions(codeSnippet, 'tests/client/legacy.test.ts', {
        isLegacyBaseline: true,
      });

      expect(result.errors.length).toBe(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('DUAL_BOUND_SPATIAL_VIOLATION');
    });
  });

  describe('Toolchain Wiring and Facade Integration (TC-408.04) [UC-TOOLCHAIN-WIRING-AND-FACADE-INTEGRATION/MSS]', () => {
    it('TC-408.04a [UC-TOOLCHAIN-WIRING-AND-FACADE-INTEGRATION/MSS]: facade scripts/resolve_blender.mjs delegates to resolver functions', () => {
      const res = facadeResolveBlender({
        platform: 'win32',
        existsSyncFn: (p: string) => p.includes('Blender 5.2'),
      });
      const diag = facadeFormatBlender('win32');

      expect(typeof res.exists).toBe('boolean');
      expect(typeof diag).toBe('string');
    });

    it('TC-408.04b [UC-TOOLCHAIN-WIRING-AND-FACADE-INTEGRATION/MSS]: facade scripts/lint_spatial_bounds.mjs delegates to AST spatial auditor', () => {
      const res = facadeAuditDualBound('expect(x).toBe(1);', 'test.ts');

      expect(Array.isArray(res.errors)).toBe(true);
      expect(Array.isArray(res.warnings)).toBe(true);
    });

    it('TC-408.04c [UC-TOOLCHAIN-WIRING-AND-FACADE-INTEGRATION/MSS]: verifies root facade files maintain slim orchestrator profile <= 40 LOC', () => {
      const resolveBlenderLines = fs.readFileSync(path.resolve('scripts/resolve_blender.mjs'), 'utf-8').split('\n').length;
      const lintSpatialLines = fs.readFileSync(path.resolve('scripts/lint_spatial_bounds.mjs'), 'utf-8').split('\n').length;

      expect(resolveBlenderLines <= 40).toBe(true);
      expect(lintSpatialLines <= 40).toBe(true);
    });

    it('TC-408.04d [UC-TOOLCHAIN-WIRING-AND-FACADE-INTEGRATION/MSS]: verifies scripts/generate_high_fidelity_models.mjs call-site wires resolveBlenderExecutable', () => {
      const genScriptContent = fs.readFileSync(path.resolve('scripts/generate_high_fidelity_models.mjs'), 'utf-8');

      expect(genScriptContent).toContain('const blender = resolveBlenderExecutable();');
    });

    it('TC-408.04e [UC-TOOLCHAIN-WIRING-AND-FACADE-INTEGRATION/MSS]: verifies scripts/plan_audit/rules_testing.mjs wires dual-bound spatial linting', () => {
      const rulesTestingContent = fs.readFileSync(path.resolve('scripts/plan_audit/rules_testing.mjs'), 'utf-8');

      expect(rulesTestingContent).toMatch(/rules_spatial_bounds|auditDualBoundSpatialAssertions/);
    });
  });
});
