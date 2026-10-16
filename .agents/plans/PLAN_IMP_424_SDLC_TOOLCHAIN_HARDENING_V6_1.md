# PLAN_IMP_424: SDLC Toolchain & Guardrails Hardening V6.1

## 1. Context & Architectural Goal
- **Source Strategy**: SDLC Hardening V6.1 — Comprehensive Toolchain Pre-Flight & Evidence Hardening.
- **Classification**: Tier 1.5 Toolchain Refactor & Automated Guardrails.
- **Subsystem Boundary**: `scripts/**`, `tests/scripts/**`.
- **Target Invariant**: Eliminate toolchain parser bypasses, false green passes, tautological testing loopholes, and misleading report boilerplate uncovered in forensic audits IMP-418..423.

### Principles Applied
- **Poka-Yoke Affordance** -> Hard gate halts execution immediately when 0 target files are parsed, preventing false green passes.
- **Anti-TIDD & Seam Discipline** -> Binds test count extraction to Vitest/Sentinel JSON outputs rather than parsing raw source comments.
- **Whole-Context Remediation** -> Simultaneously hardens Station 0 (plan parser), Station 2.5 (prefilter/AST linter), Station 3.5 (visual critic waiver), and Station 4 (report auditor).
- **Buffer Zone Guard** -> Implements active warning buffer zones (28.5 KB for FEATURE_MAP, 349 LOC for activity_log_subscriber) before fatal hard limits are breached.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `scripts/plan_audit/plan_markdown_parser.mjs` | Harness Scripts / Tooling | 122 | 122 | ~0 | 9999 | Safe (Parser Logic) |
| `scripts/audit_plan.mjs` | Harness Scripts / Tooling (Facade) | 171 | 171 | ~0 | 200 | Safe (Facade Entrypoint <= 200) |
| `scripts/evidence_audit/audit_visual_and_telemetry.mjs` | Harness Scripts / Tooling | 168 | 168 | ~0 | 9999 | Safe (Waiver Logic) |
| `scripts/report/report_git_inspector.mjs` | Harness Scripts / Tooling | 404 | 404 | ~0 | 9999 | Safe (JSON Test Extractor) |
| `scripts/fast_prefilter.mjs` | Harness Scripts / Tooling | 310 | 310 | ~0 | 9999 | Safe (Buffer Warning & Active Rule 17) |
| `scripts/evidence_audit/audit_reports_and_ssot.mjs` | Harness Scripts / Tooling | 282 | 282 | ~0 | 9999 | Safe (General Slop Blacklist & Buffer) |
| `scripts/slop_linter/slop_ast_rules.mjs` | Harness Scripts / Tooling | 432 | 432 | ~0 | 9999 | Safe (AST fs.readFileSync ban) |
| `scripts/slop_linter/slop_constants.mjs` | Harness Scripts / Tooling | 79 | 79 | ~0 | 9999 | Safe (Rule Constant) |
| `scripts/check_loc.mjs` | Harness Scripts / Tooling (Facade) | 174 | 174 | ~0 | 200 | Safe (Facade Entrypoint <= 200) |
| `tests/scripts/toolchain_declarations.d.ts` | Harness Types | 458 | 458 | ~0 | 9999 | Safe (Types) |
| `tests/scripts/imp424_toolchain_guardrails_hardening.test.ts` | Living Test | 0 | 165 | +165 | 600 | Safe (New Contract Suite) |

---

## 3. Core Contract Invariants & Architectural Seams

1. **[INV-TOOLCHAIN-01: Markdown Table Target Files Parsing & Zero-Target Hard Gate]**:
   - `plan_markdown_parser.mjs` parses target files from Markdown table rows (`| Path | Tier | ... |` or `| Target File | Action | Path |`).
   - `audit_plan.mjs` enforces `if (targetFiles.size === 0) { errors++; }`, halting pre-flight if parser fails.

2. **[INV-TOOLCHAIN-02: Visual Critic Waiver for Pure Type/Export UI Seams]**:
   - `audit_visual_and_telemetry.mjs` grants `isReExportSeamWaiver` if git diff for modified UI/3D files contains exclusively `import`, `export`, `type`, or `interface` statements without JSX/CSS presentation deltas.
   - Waives mandatory 3D screenshot captures and bans dispatching `game-3d-visual-critic` on non-visual state/network slices.

3. **[INV-TOOLCHAIN-03: Authoritative Test Count Extraction from JSON]**:
   - `report_git_inspector.mjs` purges raw comment regex `match(/\bit\s*\(/g)`.
   - Extracts exact test counts from Vitest JSON output or evidence JSON snapshots (`station1_*.json`, `chaos_sentinel_*.json`).

4. **[INV-TOOLCHAIN-04: Early Warning Buffer Zone for FEATURE_MAP.md]**:
   - `fast_prefilter.mjs` and `audit_reports_and_ssot.mjs` issue early warning at 28.5 KB <= size < 30.0 KB (30,720 bytes).
   - Hard exit 1 is triggered when size >= 30.0 KB.

5. **[INV-TOOLCHAIN-05: AST Linter Ban on fs.readFileSync in Client Tests]**:
   - `slop_ast_rules.mjs` detects and rejects `fs.readFileSync` or `fs.existsSync` inside `tests/client/**`.

6. **[INV-TOOLCHAIN-06: Hard Gate 350 LOC Lock for activity_log_subscriber.ts]**:
   - `check_loc.mjs` flags hard error if `activity_log_subscriber.ts` >= 350 LOC, enforcing the Refactor-First mandate.

7. **[INV-TOOLCHAIN-07: Blacklist Banned Slop Phrases in Reports]**:
   - `audit_reports_and_ssot.mjs` rejects final reports containing "an toàn đa luồng trên client" or "bằng chứng trực quan trên vé State".

---

## 4. Contract Test Scenarios (`imp424_toolchain_guardrails_hardening.test.ts`)

- **TC-424.01 [UC-PARSER-TABLE/MSS]**: Given a plan with target files declared in Markdown tables, When `parseTargetFiles` executes, Then it extracts all file paths and flags `isNew` accurately.
- **TC-424.02 [UC-ZERO-TARGET-GATE/MSS]**: Given an invalid plan with 0 parsed target files, When `audit_plan.mjs` runs, Then it reports a critical defect and exits with error.
- **TC-424.03 [UC-VISUAL-WAIVER/MSS]**: Given a ticket modifying only types/exports in UI files, When `auditVisualAndTelemetry` evaluates, Then it auto-grants `isReExportSeamWaiver` and skips 3D capture enforcement.
- **TC-424.04 [UC-TEST-COUNT-EXTRACTION/MSS]**: Given a test file with commented-out `// it('test')`, When test counts are extracted, Then only executed tests are counted without regex inflation.
- **TC-424.05 [UC-FEATURE-MAP-BUFFER/MSS]**: Given FEATURE_MAP.md between 28.5 KB and 30.0 KB, When checked, Then it issues an early warning; at >= 30.0 KB it fails hard.
- **TC-424.06 [UC-AST-NO-FS-IN-CLIENT-TESTS/MSS]**: Given a client test importing or calling `fs.readFileSync`, When AST slop linter checks, Then it returns a hard rule violation.
- **TC-424.07 [UC-LOC-HARD-LOCK/MSS]**: Given `activity_log_subscriber.ts` exceeding 349 LOC, When `check_loc.mjs` evaluates, Then it issues a hard error.
- **TC-424.08 [UC-SLOP-BLACKLIST/MSS]**: Given a report containing blacklisted slop phrases, When `auditReportsAndSSOT` audits, Then it records a fatal violation.

---

## 5. Definition of Done (DoD) & Stopping Criteria
- **DoD #1 (Contract Suite)**: All 8 contract tests in `imp424_toolchain_guardrails_hardening.test.ts` pass deterministically (100% GREEN).
- **DoD #2 (Facade Limit)**: `audit_plan.mjs` and `check_loc.mjs` remain <= 200 physical lines.
- **DoD #3 (Zero Type Errors)**: `tsc --noEmit` exits with 0 errors.
- **DoD #4 (Zero Dirty Casts)**: 0 occurrences of `as any` or loose type bypasses.
- **DoD #5 (Fast Pre-Filter)**: `npm run prefilter` passes all mechanical checks.
- **DoD #6 (Evidence Audit)**: `node scripts/check_evidence.mjs imp-424` exits with code 0.
