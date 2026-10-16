# PLAN_IMP_408: Cross-Platform Blender CLI Path Resolver & AST Dual-Bound Spatial Linter (Harness V6.0)

## 1. Context & Architectural Goal
- **Source Strategy Reports**: [`VTCOON_SDLC_HARNESS_AND_SPATIAL_HARDENING_PROPOSAL_REPORT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/VTCOON_SDLC_HARNESS_AND_SPATIAL_HARDENING_PROPOSAL_REPORT.md) (Proposals 1 & 4) & [`RETRO_2026-10-15_IMP399_IMP406_3D_BLENDER_AND_CROSSPLATFORM_SDLC.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/audits/RETRO_2026-10-15_IMP399_IMP406_3D_BLENDER_AND_CROSSPLATFORM_SDLC.md).
- **Subsystem Boundary Isolation**: Slices Group 1 into `tooling-scripts` (IMP-408), keeping all target files strictly in `scripts/` and `tests/scripts/` to satisfy `rules_scope.mjs` mechanical gate with 0 cross-subsystem contamination.
- **Problems**:
  1. `scripts/generate_high_fidelity_models.mjs` hardcodes candidate paths (lines 118-120) with a rigid local Windows path `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe`. It lacks version negotiation, platform-aware fallback sweeps (Windows, macOS, Linux, Snap/Flatpak), environment variable normalization (`BLENDER_EXE` vs `BLENDER_PATH`), and actionable diagnostics when Blender is missing (silently swallowing absence and falsely reporting 28 models generated).
  2. Contract tests across `tests/client/*3d*.test.ts` frequently check only lower bounds on spatial coordinates (`toBeGreaterThanOrEqual`), missing upper bounds (`toBeLessThanOrEqual`). This one-sided inequality flaw allowed entities like the Monopoly Archway (IMP-401) to slide outside marble plinths without triggering test failures.
- **Architectural Solution & Facade Pattern**:
  1. **Cross-Platform Blender CLI Resolver ([`scripts/blender/resolve_blender.mjs`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/blender/resolve_blender.mjs))**:
     - Deep module evaluating env overrides (`BLENDER_EXE`, `BLENDER_PATH`), platform-specific standard paths (Win/macOS/Linux), and safe `PATH` system probes.
     - Probes Blender version (`blender --version`) and returns `{ exists, path, version, source }`. Emits actionable installation/path instructions on failure.
     - Facade re-export: [`scripts/resolve_blender.mjs`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/resolve_blender.mjs) (thin orchestrator <= 30 LOC per Toolchain Facade Invariant).
  2. **AST Dual-Bound Spatial Linter ([`scripts/plan_audit/rules_spatial_bounds.mjs`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/plan_audit/rules_spatial_bounds.mjs))**:
     - Analyzes test AST for spatial coordinate assertions (`localX`, `localZ`, `worldPosition`, `offset`, `ndcX`, `ndcY`, `tangentX`, `clearance`).
     - Recognizes mathematical equivalence: `expect(Math.abs(coord) <= threshold).toBe(true)` or `expect(Math.abs(coord)).toBeLessThanOrEqual(threshold)` is mathematically symmetric dual-bounded ($-threshold \le coord \le threshold$) and passes without false alarms.
     - Implements **Ratchet Protocol**: legacy baseline test suites emit non-blocking warnings; newly planned ticket test suites mandate strict dual bounds (Hard Error on one-sided inequality).
     - Facade re-export: [`scripts/lint_spatial_bounds.mjs`](file:///c:/Users/HP/Documents/GitHub/vtcoon/scripts/lint_spatial_bounds.mjs) (thin orchestrator <= 40 LOC).
  3. **Call-Site Wiring & Honest Diagnostics**:
     - Wire `resolveBlenderExecutable` into `scripts/generate_high_fidelity_models.mjs`, replacing hardcoded candidates. If Blender is missing, emit honest warning detailing procedural count and actionable diagnostic guidance from `formatBlenderDiagnosticInstructions()`.
     - Wire `auditDualBoundSpatialAssertions` into `scripts/plan_audit/rules_testing.mjs`.

### Principles Applied
- **Toolchain Facade Invariant** -> Root entrypoints in `scripts/*.mjs` remain thin facades (<= 50 LOC); logic decomposes into `scripts/blender/` and `scripts/plan_audit/`.
- **Spatial AABB / Non-Occlusion** -> Mechanically enforces dual-bound coordinate assertions, preventing one-sided boundary drift.
- **100% DTO & Call-Site Wiring** -> Wired `resolveBlenderExecutable` directly into `generate_high_fidelity_models.mjs` with honest logging.
- **Equivalence-Partition Testing** -> Tests partitioned across OS platforms (Win, Mac, Linux), missing vs present binaries, version probing, and valid vs invalid spatial assertion ASTs.
- **Pure-Move Quarantine** -> Preserved existing asset generation workflow and plan audit rules without breaking changes.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `scripts/blender/resolve_blender.mjs` | Tier 1 (Tooling) | 0 | 110 | ~+110 | 400 | Safe (New) |
| `scripts/resolve_blender.mjs` | Scripts Facade | 0 | 25 | ~+25 | 200 | Safe (New Facade) |
| `scripts/plan_audit/rules_spatial_bounds.mjs` | Tier 1 (Tooling) | 0 | 115 | ~+115 | 400 | Safe (New) |
| `scripts/lint_spatial_bounds.mjs` | Scripts Facade | 0 | 35 | ~+35 | 200 | Safe (New Facade) |
| `scripts/generate_high_fidelity_models.mjs` | Scripts Facade | 136 | 132 | ~-4 | 200 | Safe (Refactored) |
| `scripts/plan_audit/rules_testing.mjs` | Tier 1 (Tooling) | 316 | 322 | ~+6 | 400 | ⚠️ Warning (Tech Debt: `[DEBT-LOC-RULES-TESTING]`) |
| `tests/scripts/imp408_cross_platform_blender_and_bounds_linter.test.ts` | Living Test | 0 | 220 | ~+220 | 600 | Safe (New) |

---

## 3. Lean Type & Exported Symbol Contracts

**Target physical file**: `scripts/blender/resolve_blender.mjs` (New)
```javascript
export function resolveBlenderExecutable(options = {}) {
  // Returns: { exists: boolean, path: string | null, version: string | null, source: 'env' | 'candidate' | 'path' | 'none' }
}

export function formatBlenderDiagnosticInstructions(platform = process.platform) {
  // Returns formatted actionable guidance for missing Blender CLI across Win/macOS/Linux
}

export function runBlenderPythonScript(scriptPath, scriptArgs = [], options = {}) {
  // Resolves blender binary and executes: blender --background --python scriptPath -- scriptArgs
  // Options support { timeoutMs, cwd, env, dryRun }
}
```

**Target physical file**: `scripts/resolve_blender.mjs` (New Facade)
```javascript
import { resolveBlenderExecutable, formatBlenderDiagnosticInstructions, runBlenderPythonScript } from './blender/resolve_blender.mjs';

export { resolveBlenderExecutable, formatBlenderDiagnosticInstructions, runBlenderPythonScript };
```

**Target physical file**: `scripts/plan_audit/rules_spatial_bounds.mjs` (New)
```javascript
export function auditDualBoundSpatialAssertions(testContent, filePath = '', options = {}) {
  // Analyzes AST/test blocks for one-sided spatial inequality assertions (>= without <=)
  // Supports options.isLegacyBaseline (boolean) to enforce Ratchet Protocol (Warning vs Hard Error)
  // Recognizes Math.abs(coord) <= threshold as valid symmetric dual-bounds
  // Returns: { errors: string[], warnings: string[], checkedCount: number }
}
```

**Target physical file**: `scripts/lint_spatial_bounds.mjs` (New Facade)
```javascript
import { auditDualBoundSpatialAssertions } from './plan_audit/rules_spatial_bounds.mjs';

export { auditDualBoundSpatialAssertions };
```

### Call-Site Wiring & Integration Anchors
- **Target physical file**: `scripts/generate_high_fidelity_models.mjs`
  - Replaces hardcoded `candidates` array with `resolveBlenderExecutable()`.
  - Replaces silent ignoring with honest diagnostic warnings (`formatBlenderDiagnosticInstructions()`).
- **Target physical file**: `scripts/plan_audit/rules_testing.mjs`
  - Integrates `auditDualBoundSpatialAssertions` into test assertion scanning for spatial files with Ratchet enforcement.

---

## 4. Station 1: Core Contract Invariants (`tests/scripts/imp408_cross_platform_blender_and_bounds_linter.test.ts`)

- **TC-408.01 [UC-BLENDER-CLI-RESOLVER-CROSS-PLATFORM/MSS]**: Given mocked environment variables (`BLENDER_PATH`, `BLENDER_EXE`) or mocked standard install paths across Windows (`Blender 5.2\blender.exe`), macOS (`Blender.app`), and Linux (`/usr/bin/blender`), When `resolveBlenderExecutable` is called, Then returns `{ exists: true, path, source: 'env' | 'candidate', version: '5.2.0' }`, and when non-existent, returns `{ exists: false, path: null, source: 'none' }` with formatted diagnostics without unhandled exceptions.
- **TC-408.02 [UC-BLENDER-PYTHON-RUNNER-EXECUTION/MSS]**: Given a simulated or resolved blender path and an isolated test script/command snippet (FORBIDDEN executing heavy `blender_sanctuary_assets.py` inside test suites), When `runBlenderPythonScript` is invoked, Then passes `--background` and `--python` flags in exact argument sequence, forwards script args safely, and throws descriptive errors on non-zero exit codes.
- **TC-408.03 [UC-AST-DUAL-BOUND-SPATIAL-LINTER-DETECTION/MSS]**: Given test source code with one-sided spatial assertion `expect(seg.archwayWorldPosition[0]).toBeGreaterThanOrEqual(0.55);` lacking an upper bound, When `auditDualBoundSpatialAssertions` executes, Then flags `DUAL_BOUND_SPATIAL_VIOLATION`; and when provided with dual bounds (`toBeGreaterThanOrEqual` + `toBeLessThanOrEqual`) or symmetric absolute bounds `Math.abs(coord) <= threshold`, passes with 0 violations; and when `isLegacyBaseline: true`, downgrades violations to non-blocking warnings under the Ratchet Protocol.
- **TC-408.04 [UC-TOOLCHAIN-WIRING-AND-FACADE-INTEGRATION/MSS]**: Given `scripts/generate_high_fidelity_models.mjs` and `scripts/plan_audit/rules_testing.mjs`, When AST verification executes, Then proves `generate_high_fidelity_models.mjs` delegates directly to `resolveBlenderExecutable` with honest diagnostic fallback on missing binaries, `rules_testing.mjs` invokes dual-bound spatial linting, and root facades `resolve_blender.mjs` and `lint_spatial_bounds.mjs` remain <= 40 LOC.

---

## 5. Station 3 & 4 Verification & Evidence Plan
- **Mechanical Gates**:
  1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_408_CROSS_PLATFORM_BLENDER_AND_SPATIAL_LINTERS.md --auto-sign`
  2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_408_CROSS_PLATFORM_BLENDER_AND_SPATIAL_LINTERS.md`
  3. `npx --yes tsc --noEmit` (Exit 0)
  4. `node scripts/lint_spatial_bounds.mjs`
  5. `npm run prefilter -- scripts/blender/resolve_blender.mjs scripts/resolve_blender.mjs scripts/plan_audit/rules_spatial_bounds.mjs scripts/lint_spatial_bounds.mjs scripts/generate_high_fidelity_models.mjs scripts/plan_audit/rules_testing.mjs tests/scripts/imp408_cross_platform_blender_and_bounds_linter.test.ts`
  6. **Tooling Evidence Synthesis**:
     `node scripts/collect_evidence.mjs imp-408 tests/scripts/imp408_cross_platform_blender_and_bounds_linter.test.ts && npm run report -- imp-408 && node scripts/check_evidence.mjs imp-408`
  7. **Regression verification**: `npx --yes vitest run tests/scripts/imp408_cross_platform_blender_and_bounds_linter.test.ts`

## 6. Definition of Done (DoD)
- [ ] `scripts/blender/resolve_blender.mjs` implements cross-platform resolution and execution with `<= 120 LOC`.
- [ ] `scripts/resolve_blender.mjs` facade re-exports resolver with `<= 30 LOC`.
- [ ] `scripts/plan_audit/rules_spatial_bounds.mjs` implements dual-bound spatial linting with `<= 120 LOC`, Ratchet Protocol, and `Math.abs` equivalence.
- [ ] `scripts/lint_spatial_bounds.mjs` facade re-exports spatial linter with `<= 40 LOC`.
- [ ] `scripts/generate_high_fidelity_models.mjs` wires `resolveBlenderExecutable`, emits honest diagnostic warnings on missing binaries, and drops to `<= 135 LOC`.
- [ ] Living test suite `tests/scripts/imp408_cross_platform_blender_and_bounds_linter.test.ts` passes 100% with 4 atomic tests without running heavy asset generation.
- [ ] Tooling evidence snapshot collected via `collect_evidence.mjs` and `check_evidence.mjs` exits `0`.
