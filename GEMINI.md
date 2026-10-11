# AGENTS CONSTITUTION (PROJECT HARNESS)

> Precedence: This project harness specializes Global AG OS Rules. Project rules strictly override global rules in case of conflict.
> Language Policy: All settings, instructions, and harness files must be in concise English. User-facing reports (`docs/reports/**`) and game artifacts must be in Vietnamese.

## 1. MANDATORY MECHANICAL GATES
Every ticket must pass 100% of automated gates before handoff:
1. **Plan Audit & Signoff**: `node scripts/audit_plan.mjs <plan_path> [--auto-sign]`
2. **Scope Confinement**: `node scripts/check_scope.mjs [plan_path]`
3. **Fast Pre-Filter (Type, LOC, Linters, Assert Density)**: `npm run prefilter -- <files>`
4. **Live Socket Port 0 & Mutation**: `npm run sentinel -- --ticket <id> --test <test_path>`
5. **Comprehensive Evidence Audit**: `node scripts/check_evidence.mjs <ticket>`
*(All toolchain scripts adhere to the Facade Re-export Pattern: root `scripts/*.mjs` are lean facades <= 200 LOC; specialized logic lives in `scripts/report/`, `scripts/slop_linter/`, `scripts/visual_capture/`, `scripts/plan_audit/`, `scripts/sentinel/`).*

## 2. IRON LAWS (NEGATIVE CONSTRAINTS - VIOLATION = EXIT 1)
- **Zero Dirty Casts**: FORBIDDEN `as any`, `as unknown as T` across `src/**` and `tests/**`.
- **Anti-TIDD**: FORBIDDEN test-only exports, props, methods (`ForTesting`). All new exports in `src/**` must have consumers outside `tests/**`.
- **Seam Discipline**: Interface is the test boundary. FORBIDDEN monkey-patching frameworks (`spyOn(React)`, `__CLIENT_INTERNALS_*`, `Object.prototype`).
- **LOC Ceilings**: Tier 1 (Domain/FSM/Server) <= 400 LOC; Tier 2 (UI/3D/Views) <= 500 LOC; Tier 3 (Static Config) <= 800 LOC; Living Tests <= 600 LOC. Measure via `npm run check:loc`. Code-golfing banned.
- **Toolchain Facade Invariant**: Root entrypoints in `scripts/*.mjs` MUST remain thin orchestrator facades (<= 200 LOC). All new script logic, AST rules, or telemetry extractors MUST be implemented in the corresponding subdirectories (`scripts/report/`, `scripts/slop_linter/`, `scripts/visual_capture/`, `scripts/plan_audit/`, `scripts/sentinel/`).
- **Assertion Density**: 1-4 asserts (`expect`) per atomic test. FORBIDDEN loops (`for`, `forEach`) in `it()`.
- **Fast & Deterministic Testing**: Use seeded PRNG, zero-delay sockets, fake timers. FORBIDDEN unseeded `Math.random()` and arbitrary sleeps (>= 3000ms).
- **Non-Interactive CLI Guard**: FORBIDDEN naked `npx <pkg>` without `--yes` in subshells. FORBIDDEN inline multiline PowerShell in `-e "..."`.
- **Client/Server Boundary**: FORBIDDEN importing Node runtime built-ins (`node:*`, ws) into client bundles. Sockets must use dynamic `port: 0`.
- **Pure-Move Quarantine**: Refactors must preserve 100% behavior. No semantic changes, no error swallowing (`try...catch`).
- **Poka-Yoke UI Affordance**: Button enabled/disabled states and displayed costs MUST derive directly from Domain Validators (`canDo`, `evaluation`), never recalculated independently.
- **i18n Exhaustiveness**: Every `ActionRejectReason` code must map 100% in `src/domain/i18n/vi.ts` typed `Record<ActionRejectReason, string>`.
- **Causal Root Scope Invariant**: FORBIDDEN resolving plan challenges with verbal claims or isolated expression tweaks. If file $A$ causes state erasure, file $A$ MUST be in scope, or the feature must be architecturally decoupled.
- **Full Lifecycle Testing**: FORBIDDEN solitary static mocking of store state for lifecycle/camera/pawn features. Contract suites MUST exercise the canonical sequence (`triggerDiceRoll` -> `startPawnMove`).
- **R3F Transient Unmount Invariant**: FORBIDDEN returning `null` on transient state when `useFrame` is registered. Must use `<group visible={...}>` to prevent GPU buffer/shader reallocation churn on mobile.
- **Function-to-Test Parity & Scaffolding Protocol**: FORBIDDEN omitting test specs for declared exported functions. When new production files are introduced, empty stubs MUST be scaffolded before Station 1 to guarantee Semantic Behavioral RED (runtime assertions fail, never loader `Cannot find module`).
- **Symmetric State Exit Invariant**: FORBIDDEN altering an FSM phase exit or recovery logic on one action (e.g. `downgrade`) without auditing and harmonizing all symmetric actions leading to that same exit (e.g. `mortgage`, `bankruptcy`). Any shared state exit MUST use a centralized helper or symmetric FSM restoration logic.
- **Anti-Shallow UI Refactoring & Props Explosion**: FORBIDDEN decomposing React components by moving JSX chunks into shallow stateless subcomponents with wide interfaces (>= 4 props). Any effort to de-escalate UI component LOC must prioritize extracting Pure Data Derivation Logic (formatting, sanitization, label resolution) into existing domain helper/visual files (*_visuals.ts, *_helpers.ts) before modifying the presentation component tree.
- **Subagent Timebox & Targeted Scope Invariant**: FORBIDDEN subagents running broad un-targeted test suites (naked `vitest run` across the entire repo). Subagents (`qa-tester`, `implementer`) MUST execute strictly their assigned slice test (`npx vitest run <specific_test_path>`). Subagent tasks MUST be timeboxed to fast cognitive execution (<= 3-5 min per dispatch). Heavy full regression test suites, global builds, and mutation testing belong strictly to Station 4 executed by the Main Agent via native background OS processes (`run_command`).
- **Anti-Conjectural Root Cause Invariant**: FORBIDDEN resolving runtime anomalies, visual artifacts, or platform-specific glitches (WebGL strobing, GPU precision overflow, thermal throttling, camera lag) solely by conjectural inspection of `.tsx`/source files. If the root cause cannot be statically proven, an empirical observability tool (diagnostic HUD `?debug=3d`, layer isolation, live telemetry) MUST be used in Station 0.5 to physically isolate the culprit before drafting a plan or writing Station 1 tests.
- **Flight Recorder & Forensic Invariant**: FORBIDDEN resolving gameplay, balance, bankruptcy, or state machine desync bugs solely through static code speculation. The agent MUST request or ingest the Flight Recorder dump (`npm run analyze:log <dump.json>` or `window.__vtcoon.exportFlightRecorder()`) to inspect tick timelines and invariant violations before planning.
- **Economic Characterization Baseline Invariant**: FORBIDDEN modifying core property pricing, rent curves, mortgage rates, tax brackets, or auction settlement logic without establishing/verifying a 40-cell characterization snapshot baseline test to prevent unannounced economic drift across building tiers.

## 3. LEAN PIPELINE
- **Tier 1 (Fast-Track)**: < 50 LOC, visual/CSS/spacing, copy, isolated fix (0 Schema, 0 FSM, 0 Net). Main Agent executes directly in 1-2 min, 0 subagents, 0 plan.
- **Micro-Slice (<= 50 LOC, 1 subsystem)**:
  0. Station 0.5 (Empirical Root-Cause Gate - Mandatory for Runtime Anomalies, Heisenbugs & State Desync):
     - For non-deterministic visual/runtime glitches (flickering, GPU precision overflow, thermal throttling, camera desync), planning based on static code speculation is FORBIDDEN. The agent MUST isolate the physical culprit via observability hooks (e.g. `?debug=3d`, layer toggles, console traces, `window.__vtcoon`) and confirm the exact root cause with physical evidence before drafting the plan.
     - For gameplay, balance, bankruptcy, or state machine desync bugs, the agent MUST request or ingest the In-Game Flight Recorder dump (`npm run analyze:log <dump.json>`) to inspect tick timelines and invariant violations before drafting the plan.
  1. Draft Lean Plan: `.agents/plans/PLAN_[ID].md` (<= 200 lines, 0 code-dump).
  2. Machine Plan Audit: `node scripts/audit_plan.mjs <plan> --auto-sign` (0 defects auto-signs `HARDENED_APPROVED`).
  3. Adversarial Gate (Mandatory for State/FSM/Economy/Coordinators): Run 1 adversarial round (`adversarial-challenger`) writing to `.agents/audit/PLAN_CHALLENGE_[TICKET].md` whenever touching FSM lifecycle, State transitions, or Economy to block blind spots before implementation.
  4. Human Gate: User approves ("đồng ý").
  5. Station 1 (RED): Scaffold empty stubs in `src/**` for new files; `qa-tester` writes contract tests in `tests/**` (Adversarial Inversion: fails strictly on runtime assertions).
  6. Station 2 (GREEN): `implementer` writes minimal code in `src/**`.
  7. Mechanical Gates: Run `npm run prefilter -- <files>` and `npm run check:scope`.
  8. Audit & Delivery Reports: Main Agent runs `npm run report -- [ID]` to synthesize physical station audits (`.agents/audit/SPEC_REVIEW_[ID].md`, `CODE_REVIEW_[ID].md`, and `.agents/audit/PLAN_CHALLENGE_[ID].md`) and the comprehensive acceptance report (`docs/reports/improvements/IMP-[ID]-[slug]_report.md`) embedding all subagent comments/verdicts, captures Dual-Viewport (for UI changes), and delivers to User.
- **Epic / Large Feature (> 50 LOC, > 2-3 files)**:
  - Must run **Auto-Slicing Protocol** emitting Micro-Slices Roadmap (< 10 lines) before planning.
  - Must run 1 adversarial round (`adversarial-challenger`) writing to `.agents/audit/PLAN_CHALLENGE_[TICKET].md` to block game design / economic exploits.

## 4. SSOT DOMAIN GOTCHAS (docs/domain/gotchas/)
Consult the respective pillar before planning or modifying code:
- FSM & Game Lifecycle: [`fsm_lifecycle.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/fsm_lifecycle.md)
- Economy & Treasury: [`economy_treasury.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/economy_treasury.md)
- Bot AI Negotiation: [`bot_negotiation.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/bot_negotiation.md)
- Network & Live Sockets: [`network_delta.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/network_delta.md)
- UI & Touch Ergonomics: [`ui_ergonomics.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/ui_ergonomics.md)
- 3D Graphics & Mobile: [`3d_cinematics.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md)
- Testing Traps: [`testing_traps.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/testing_traps.md)
- Deep Module Design: [`deep_modules.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/deep_modules.md)
