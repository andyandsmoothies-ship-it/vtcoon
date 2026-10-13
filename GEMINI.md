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
*(All toolchain scripts adhere to the Facade Re-export Pattern: root `scripts/*.mjs` are lean facades <= 200 LOC; specialized logic lives in `scripts/report/`, `scripts/slop_linter/`, `scripts/visual_capture/`, `scripts/plan_audit/`, `scripts/sentinel/`, `scripts/evidence_audit/`).*

## 2. IRON LAWS (NEGATIVE CONSTRAINTS - VIOLATION = EXIT 1)
- **Zero Dirty Casts**: FORBIDDEN `as any`, `as unknown as T` across `src/**` and `tests/**`.
- **Anti-TIDD**: FORBIDDEN test-only exports, props, methods (`ForTesting`). All new exports in `src/**` must have consumers outside `tests/**`.
- **Seam Discipline**: Interface is the test boundary. FORBIDDEN monkey-patching frameworks (`spyOn(React)`, `__CLIENT_INTERNALS_*`, `Object.prototype`).
- **LOC Ceilings**: Tier 1 (Domain/FSM/Server) <= 400 LOC; Tier 2 (UI/3D/Views) <= 500 LOC; Tier 3 (Static Config) <= 800 LOC; Living Tests <= 600 LOC. Measure via `npm run check:loc`. Code-golfing banned.
- **Toolchain Facade Invariant**: Root entrypoints in `scripts/*.mjs` MUST remain thin orchestrator facades (<= 200 LOC). All new script logic, AST rules, or telemetry extractors MUST be implemented in the corresponding subdirectories (`scripts/report/`, `scripts/slop_linter/`, `scripts/visual_capture/`, `scripts/plan_audit/`, `scripts/sentinel/`, `scripts/evidence_audit/`).
- **Assertion Density**: 1-4 asserts (`expect`) per atomic test. FORBIDDEN loops (`for`, `forEach`) in `it()`.
- **Fast & Deterministic Testing**: Use seeded PRNG, zero-delay sockets, fake timers. FORBIDDEN unseeded `Math.random()` and arbitrary sleeps (>= 3000ms).
- **Non-Interactive CLI Guard**: FORBIDDEN naked `npx <pkg>` without `--yes` in subshells. FORBIDDEN inline multiline PowerShell in `-e "..."`.
- **Client/Server Boundary**: FORBIDDEN importing Node runtime built-ins (`node:*`, ws) into client bundles. Sockets must use dynamic `port: 0`.
- **Pure-Move Quarantine**: Refactors must preserve 100% behavior. No semantic changes, no error swallowing (`try...catch`).
- **Poka-Yoke UI Affordance**: Button enabled/disabled states and displayed costs MUST derive directly from Domain Validators (`canDo`, `evaluation`), never recalculated independently.
- **i18n Exhaustiveness**: Every `ActionRejectReason` code must map 100% in `src/domain/i18n/vi.ts` typed `Record<ActionRejectReason, string>`.
- **Function-to-Test Parity & Scaffolding Protocol**: FORBIDDEN omitting test specs for declared exported functions. When new production files are introduced, empty stubs MUST be scaffolded before Station 1 to guarantee Semantic Behavioral RED (runtime assertions fail, never loader `Cannot find module`).
- **Wiring Parity Invariant (Anti-Tautological & Call-Site Wiring)**: FORBIDDEN creating or modifying pure calculation/helper files (`*_helpers.ts`, `*_detect.ts`, `*_math.ts`) with contract tests that only invoke the helper in isolation without verifying its physical call-site. Every new or modified helper function MUST have at least one integration contract test proving that its target production consumer/component invokes it and reacts to its output. In Chaos Sentinel, at least one AST mutation probe MUST target the production consumer call-site.
- **Knowledge Fold Invariant**: Any ticket/IMP modifying domain rules, economic models, FSM phase transitions, network protocols, or UI affordances MUST update `docs/FEATURE_MAP.md` before Station 3 sign-off to keep the 1-page system matrix authoritative and prevent context drift across future updates.
- **SSOT Primacy Invariant**: When researching current gameplay rules, economic variables, FSM phases, or subsystem boundaries, agents MUST treat `docs/FEATURE_MAP.md` as the authoritative Single Source of Truth. Historical plans in `.agents/plans/` represent past point-in-time diffs (deltas) and MUST NOT be used to deduce current architectural truth.
- **Zero-Boilerplate Audit Invariant**: FORBIDDEN submitting Station 3 audit reports (`SPEC_REVIEW_*.md`, `CODE_REVIEW_*.md`) or final acceptance reports containing default generator boilerplate placeholders (`Đồng bộ và bảo toàn logic nghiệp vụ`, `Thực hiện cập nhật logic tối thiểu`, generic summaries, or `TODO_REVIEW_REQUIRED`). Enforced mechanically via `check_evidence.mjs`.
- **Graphics & UI View-Model Seam Invariant**: FORBIDDEN mixing complex visual calculation/transform math, store selectors, and WebGL/DOM rendering inside raw JSX components. Any new or modified 3D/UI feature MUST extract pure calculation and state mapping into a twin pure helper/descriptor file (`*_visuals.ts` or `*_helpers.ts`). Contract tests in Station 1 MUST verify the pure View-Model functions without resorting to brittle headless Three.js WebGL mocking. Call-site integration tests MUST use the centralized `tests/helpers/r3f_test_harness.ts`.
- **Standardized Graphics Fixture Invariant**: FORBIDDEN creating bespoke local mocks of `@react-three/fiber` or Three.js frame loops across test files. All R3F lifecycle, `useFrame`, and WebGL context simulation MUST use the centralized test seam `tests/helpers/r3f_test_harness.ts`.
- **Device Sniffing Dependency Injection Invariant**: FORBIDDEN leaf or deep 3D/UI child components directly importing and executing global device sniffers (`isMobileHardware`, `isPhoneHardware`, `isIOSPhone`) inside rendering loops or nested subtrees. Platform capabilities and hardware tiers MUST be injected deterministically via top-level Component Props or a centralized Context/store selector. Contract and unit test suites MUST verify mobile vs desktop variants purely via prop/context configuration without monkey-patching globals or using `vi.spyOn` on device detection modules.
- **Main Agent Pre-Delivery 1:1 Self-Audit Gate**: FORBIDDEN Main Agent presenting final delivery reports to the user without physically reading the rendered report file (`view_file`) line-by-line to verify 1:1 against physical disk reality, ensuring zero dangling empty headers, accurate SLOC metrics, and strict relevance of included tables.
- **Runtime Self-Healing & Ephemeral TTL Invariant**: FORBIDDEN trusting that external event pairs (`down/up`, `start/end`, `open/close`) will complete unconditionally. Ephemeral flags (`isRolling`, `isPawnAnimating`), gesture tracking collections (`activePointers`), and modal/subsystem locks MUST implement an authoritative Dead Man's Switch (TTL 3s–5s) or background watchdog that auto-clears stalled state. Client watchdogs MUST trigger a deterministic self-healing recovery action rather than merely logging telemetry.
- **Composite Transaction Testing Invariant**: FORBIDDEN financial, economic, or balance-processing implementation tickets omitting composite integration tests. When modifying event synthesizers or balance delta processors, contract test suites MUST include at least one scenario verifying simultaneous bidirectional cashflows within the same tick (e.g. Inflow such as Go Salary alongside Outflow such as Debt Repayment or Tax) to eliminate Netting Collision blindspots.
- **Zero Semantic Borrowing Invariant**: FORBIDDEN borrowing existing unrelated enum tokens or action types (`unmortgage`, `tax`) to represent newly introduced economic behaviors. New financial or domain operations MUST introduce canonical first-class types across `ActivityLogType`, `FloatingActionType`, and UI narrative formatters.
- **LOC Buffer Zone Guard**: When a target file reaches >= 350 LOC (Tier 1 ceiling 400), adding new logic directly into the file is FORBIDDEN. Plans touching files >= 350 LOC MUST declare a `Refactor-First` step decomposing logic into sub-helpers (<= 250 LOC) before introducing new features.
*(Specialized domain invariants and subagent review protocols are strictly delegated to `docs/domain/gotchas/*.md` and `.agents/agents/*.md`).*


## 3. LEAN PIPELINE
- **Tier 1 (Fast-Track)**: < 50 LOC, visual/CSS/spacing, copy, isolated fix (0 Schema, 0 FSM, 0 Net). Main Agent executes directly in 1-2 min, 0 subagents, 0 plan.
- **Micro-Slice (<= 50 LOC, 1 subsystem)**:
  0. Station 0.5 (Empirical Root-Cause Gate - Mandatory for Runtime Anomalies, Heisenbugs & State Desync):
     - For non-deterministic visual/runtime glitches (flickering, GPU precision overflow, thermal throttling, camera desync), planning based on static code speculation is FORBIDDEN. The agent MUST isolate the physical culprit via observability hooks (e.g. `?debug=3d`, layer toggles, console traces, `window.__vtcoon`) and confirm the exact root cause with physical evidence before drafting the plan.
     - For gameplay, balance, bankruptcy, or state machine desync bugs, the agent MUST request or ingest the In-Game Flight Recorder dump (`npm run analyze:log <dump.json>`) to inspect tick timelines and invariant violations before drafting the plan.
  1. Draft Lean Plan: `.agents/plans/PLAN_[ID].md` (<= 200 lines, 0 code-dump).
  2. Machine Plan Audit: `node scripts/audit_plan.mjs <plan> --auto-sign` (0 defects auto-signs `HARDENED_APPROVED`).
  3. Adversarial Gate (Mandatory for State/FSM/Economy/Coordinators/3D-Graphics/Financial-UI/Mobile-Ergonomics): Run 1 blind adversarial round (`adversarial-challenger` or `forensic-challenger`) writing to `.agents/audit/PLAN_CHALLENGE_[TICKET].md` whenever touching FSM lifecycle, State transitions, Economy, Financial UI notifications, Mobile ergonomics, or 3D Graphics/Performance/Culling/Shaders to block blind spots before implementation. Neutral Blind Dispatch Protocol: Main Agent is FORBIDDEN from feeding leading checklists or biased hints to the auditor.
  4. Human Gate: User approves ("đồng ý").
  5. Station 1 (RED): Scaffold empty stubs in `src/**` for new files; `qa-tester` writes contract tests in `tests/**` (Adversarial Inversion: fails strictly on runtime assertions).
  6. Station 2 (GREEN): `implementer` writes minimal code in `src/**`.
  7. Mechanical Gates: Run `npm run prefilter -- <files>` and `npm run check:scope`.
  8. Audit & Delivery Reports: Main Agent runs `npm run report -- [ID]` to synthesize physical station audits (`.agents/audit/SPEC_REVIEW_[ID].md`, `CODE_REVIEW_[ID].md`, and `.agents/audit/PLAN_CHALLENGE_[ID].md` / `FORENSIC_AUDIT_[ID].md`) and the comprehensive acceptance report (`docs/reports/improvements/IMP-[ID]-[slug]_report.md`) embedding all subagent comments/verdicts. For deep forensic signoff, run 1 adversarial verification round (`forensic-challenger`) against the final report to eliminate artifact contamination before delivery.
- **Epic / Large Feature (> 50 LOC, > 2-3 files)**:
  - Must run **Auto-Slicing Protocol** emitting Micro-Slices Roadmap (< 10 lines) before planning.
  - Must run 1 adversarial round (`adversarial-challenger`) writing to `.agents/audit/PLAN_CHALLENGE_[TICKET].md` to block game design / economic exploits.

## 4. SSOT DOMAIN GOTCHAS (docs/domain/gotchas/)
Consult the respective pillar before planning or modifying code:
- Master Feature Map (SSOT Matrix): [`FEATURE_MAP.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/FEATURE_MAP.md)
- FSM & Game Lifecycle: [`fsm_lifecycle.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/fsm_lifecycle.md)
- Economy & Treasury: [`economy_treasury.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/economy_treasury.md)
- Bot AI Negotiation: [`bot_negotiation.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/bot_negotiation.md)
- Network & Live Sockets: [`network_delta.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/network_delta.md)
- UI & Touch Ergonomics: [`ui_ergonomics.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/ui_ergonomics.md)
- 3D Graphics & Mobile: [`3d_cinematics.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md)
- Testing Traps: [`testing_traps.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/testing_traps.md)
- Deep Module Design: [`deep_modules.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/deep_modules.md)
