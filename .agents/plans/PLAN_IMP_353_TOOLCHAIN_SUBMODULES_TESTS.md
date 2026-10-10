# Plan IMP-353: Toolchain Submodules Unit Test Suite

## 0. Context & Prior In-Flight Scope (Uncommitted)
- **Prior In-Flight Scope (Uncommitted)**:
  - `GEMINI.md`
  - `docs/domain/gotchas/deep_modules.md`
  - `docs/reports/uat/uat_advanced_features_2_players.md`
  - `docs/reports/uat/uat_game_2_players_step_by_step.md`
  - `docs/reports/uat/uat_game_4_players_step_by_step.md`
  - `scripts/audit_plan.mjs`
  - `scripts/capture_visual_evidence.mjs`
  - `scripts/check_loc.mjs`
  - `scripts/generate_report.mjs`
  - `scripts/lint_slop.mjs`
  - `scripts/sentinel_runner.mjs`
  - `src/client/events/subscribers/audio_event_subscriber.ts`
  - `src/client/events/subscribers/property_market_badge_handler.ts`
  - `src/client/network/apply_delta.ts`
  - `src/client/store/game_store.ts`
  - `src/client/ui/transaction_narrative.ts`
  - `src/domain/bot/bot_trade.ts`
  - `src/server/room_manager.ts`
  - `src/server/room_trade_coordinator.ts`
  - `src/server/trade_coordinator_helper.ts`
  - `src/domain/bot/bot_negotiation_brain.ts`
  - `tests/client/imp346_delta_presentation_decoupling.test.ts`
  - `tests/domain/imp347_bot_negotiation_brain.test.ts`
  - `tests/client/anti_aliasing_and_visual_crispness.test.ts`
  - `tests/client/imp330_game_event_narrative_synthesizer.test.ts`

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-353`
- **Subsystem**: `harness-toolchain`
- **Problem Statement**:
  1. In IMP-348 through IMP-352, 5 root toolchain scripts were decomposed into modular subdirectories (`scripts/report/`, `scripts/plan_audit/`, `scripts/sentinel/`, `scripts/visual_capture/`, `scripts/slop_linter/`).
  2. While `tests/scripts/lint_slop.test.ts` tests the linter, the remaining submodules lack comprehensive contract unit test coverage.
  3. Without isolated test coverage, refactorings to toolchain modules risk regressions in plan auditing, mutant injection, report generation, and CLI argument parsing.
- **Architectural Solution**:
  1. Create a dedicated test suite `tests/scripts/toolchain_submodules.test.ts` covering the decoupled pure functions and helpers in `scripts/sentinel/`, `scripts/plan_audit/`, `scripts/report/`, `scripts/visual_capture/`, and `scripts/slop_linter/`.
  2. Zero mocking of file systems where pure string input/output transforms can be verified directly.
  3. Strictly comply with Living Test LOC ceiling (<= 600 LOC) and Assertion Density (1-4 asserts per test, 0 loops).
- **Direct Scope (Physical Files)**:
  - `tests/scripts/toolchain_submodules.test.ts` (New)
  - `tests/scripts/toolchain_declarations.d.ts` (New)

## 2. Planned Changes & LOC Budget

| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `tests/scripts/toolchain_submodules.test.ts` | Living Test | 0 | 129 | +129 | <= 600 | 🆕 Tệp mới (✔️ Safe) |
| `tests/scripts/toolchain_declarations.d.ts` | Tier 3 (Static Data/Config) | 0 | 100 | +100 | <= 800 | 🆕 Tệp mới (✔️ Safe) |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/scripts/toolchain_submodules.test.ts` (Tệp mới)

Test Specifications:
- TC-353.01 [UC-SENTINEL/MSS]: Given valid source content and target substring, When applyMutantToSource is invoked with replacement chunk, Then returns modified source code containing replacement chunk.
- TC-353.02 [UC-SENTINEL/A1]: Given source content missing target substring, When applyMutantToSource is invoked with unmatched target, Then throws error indicating mutant target mismatch.
- TC-353.03 [UC-SENTINEL/A2]: Given plan markdown containing target test path, When parseTestPathFromPlan is invoked with plan string, Then extracts relative test suite path accurately.
- TC-353.04 [UC-PLAN/MSS]: Given standard plan markdown content, When parsePlanFile is invoked with markdown text, Then extracts structured tasks, scope files, and signoff status.
- TC-353.05 [UC-PLAN/A1]: Given plan content with unapproved status, When autoSignPlan is invoked on plan text, Then appends HARDENED_APPROVED signature with SHA-256 hash.
- TC-353.06 [UC-REPORT/MSS]: Given evidence snapshot json content, When extractLocFromSnapshot is invoked with snapshot payload, Then maps physical file paths to exact SLOC metrics.
- TC-353.07 [UC-REPORT/A1]: Given structured ticket report data with station audits, When renderComprehensiveReportMarkdown is invoked with audit data, Then generates valid markdown containing telemetry table and acceptance verdict.
- TC-353.08 [UC-CAPTURE/MSS]: Given CLI argv array containing ticket and dual-viewport flags, When parseCaptureArgs is invoked with custom argument list, Then parses options with dualViewport true and target ticket.
- TC-353.09 [UC-SLOP/MSS]: Given sample TypeScript code with dirty cast, When lintSlopContent is invoked with code snippet, Then reports ZERO_DIRTY_CASTS violation.

### Station 2: Minimal Production Implementation (GREEN)
Note: Production submodules are already implemented across `scripts/`.
Any missing pure helper or export signature alignment identified during Station 1 will be refined within scope.

## 4. Verification & Mechanical Gates
- Gate 1 (Plan Audit): `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_353_TOOLCHAIN_SUBMODULES_TESTS.md --auto-sign`
- Gate 2 (Scope): `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_353_TOOLCHAIN_SUBMODULES_TESTS.md`
- Gate 3 (Prefilter): `npx vitest run tests/scripts/toolchain_submodules.test.ts`
- Gate 4 (LOC Budget): `node scripts/check_loc.mjs tests/scripts/toolchain_submodules.test.ts`
