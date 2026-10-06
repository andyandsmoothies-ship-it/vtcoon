# AGENTS CONSTITUTION (PROJECT HARNESS)

> Precedence: This project harness specializes Global AG OS Rules. Project rules strictly override global rules in case of conflict.
> Target Market: Viet Nam. All user-facing documents and game artifacts must be in Vietnamese.

## 1. HARD CONSTRAINTS & CODE QUALITY

- **Deep Modules & Anti-Slop (lint:slop & check:loc)**:
  - Architecture: Deep modules only (simple interfaces hiding complex logic). Zero single-use wrappers, zero 1-line delegate methods. Newly added production exports MUST have at least one caller outside `tests/**` (mechanically audited via `scripts/audit_plan.mjs` Rule 1.2 and `scripts/lint_slop.mjs`).
  - Seam Discipline & Anti-TIDD: The interface is the test seam. Banned exposing test-only properties/methods (`ForTesting` suffix), test backdoors, or monkey-patching framework internals (`__CLIENT_INTERNALS_*`, `__SECRET_*`, `Object` prototypes) in `src/**`.
  - Poka-Yoke Affordance Invariant: UI Affordance helpers MUST NEVER duplicate economic or domain logic. All button enabled/disabled states and cost displays MUST derive directly from Domain Validators (`canDo`, `evaluation`).
  - Pure-Move Quarantine: Refactor tickets must be 100% behavior-preserving. Zero semantic mutations, zero input normalization, zero silenced errors. Refactor tickets require differential parity testing before pruning old code.
  - LOC Ceilings: Tier 1 (Domain Logic / FSM / Server) <= 400 LOC (warn 300, hard error 550); Tier 2 (UI / 3D Canvas / Views) <= 500 LOC (warn 400); Tier 3 (Static Data / Config) <= 800 LOC; Living Tests <= 600 LOC. Measure via `npm run check:loc`. Ban code-golfing.
  - Client/Server Boundary & Zero Dirty Casts: Banned `as any`, `as unknown as T` across ALL files. Banned importing platform built-ins (`node:*`, ws) into client/browser bundles. Dynamic live sockets (`port: 0`) in integration tests.
  - Fast & Deterministic: Seeded PRNG, bounded zero-delay sockets, fake timers. Banned unseeded `Math.random()` and long blocking sleeps (>= 3000ms in contracts).

## 2. RISK-BASED TIERING & 4-STATION CLOSED-LOOP PIPELINE

- **Tier 1 (Fast-Track)**: < 50 LOC, pure visual/CSS/spacing, audio, text, or isolated fix to 1-2 files (0 Schema, 0 FSM/Server, 0 Network). Executed directly by Main Agent in 1-2 minutes (Zero subagents, no plan, exempt from diagramming).
- **Tier 2 (Full Rigor)**: Schema, Network, FSM, or > 50 LOC. Main agent drafts plan in `.agents/plans/PLAN_[TICKET].md`, executes Two-Stage Plan Hardening, then runs 4-Station Pipeline:
  - **Auto-Slicing Protocol**: Cross-subsystem features or tasks spanning > 2-3 logic files MUST halt and present a Micro-Slices Roadmap (< 10 lines) before drafting. Slices must be independent, deployable, delta <= 50 LOC, strictly 1 subsystem, with dedicated contract tests. Scope Conservation: 100% of affected files must be assigned to a slice or explicitly deferred.
  - **Lean Plan Specification**: Architectural blueprint only (Types, Signatures, Invariants, Test Matrices). Target <= 250 lines. Full code copy-pasting is strictly banned (maximum 1-3 snippets <= 30 LOC for subtle algorithms). Validate mechanically via `node scripts/audit_plan.mjs <plan>`.
  - **Two-Stage Plan Hardening**: Stage A (`plan-griller` verifies 5 Pillars & physical disk via `audit_plan.mjs`), Stage B (`adversarial-challenger` probes novel exploit vectors into `.agents/audit/PLAN_CHALLENGE_[TICKET].md`). Requires `HARDENED_APPROVED` before Human Review Gate.
  - **Station 1 (RED Contract Test)**: `qa-tester` writes atomic contract tests in `tests/**` (1-4 asserts/test, zero loops in `it()`). Adversarial Inversion: tests must fail on runtime assertions, not missing imports. Emits `.agents/evidence/station1_[TICKET].json`.
  - **Station 2 (GREEN Implementation)**: `implementer` writes minimum code in `src/**` to pass tests. Zero bug-codification. Implementer Pushback & Discovery Mandate: report unforeseen physical constraints via `### 💡 IMPLEMENTATION DISCOVERY`.
  - **Station 2.5 (Fast Pre-Filter Sweep)**: Single-pass mechanical filter via `npm run prefilter -- <files>` (`tsc --noEmit`, LOC budget, zero dirty casts, console.log purge, linters: `lint:slop`, `lint:ui`, `check:i18n`).
  - **Station 3 (Independent Review Funnel)**:
    - *Phase 3.0 (Physical Visual Evidence)*: Mandatory dual-viewport screenshots (`scripts/capture_visual_evidence.mjs --dual-viewport`) unless explicit `pureLogicWaiver` applies.
    - *Phase 3.1 (Spec Gate)*: `spec-reviewer` verifies 100% plan fidelity & reconciles discoveries.
    - *Phase 3.2 (Craft Gate)*: Parallel concurrent dispatch via single tool call (`code-reviewer` + visual critic: `game-3d-visual-critic` for 3D, `ui-craft-reviewer` for 2D).
    - *Phase 3.3 (Persistence)*: Reports physically persisted to `.agents/audit/*_REVIEW_[TICKET].md`.
  - **Station 4 (Adversarial Boundary & Mutation Sentinel)**: `chaos-sentinel` executes 3 physical probes: (1) Wire-to-Core Closed-Loop Parity, (2) Ephemeral Dynamic Boundary (`port: 0`), (3) Targeted Mutation Sensitivity (floor >= 8 tests for micro-slices, >= 14 for epics, 100% kill rate, 0 survived). READ-ONLY on `src/**`. Emits `.agents/evidence/chaos_sentinel_[TICKET].json`.
  - **Epic Consolidation Gate**: Final slice of a roadmap MUST generate an Epic Consolidation Report in `docs/reports/...` validating cumulative metrics and end-to-end integration.

## 3. DOMAIN INVARIANTS SSOT (docs/domain/gotchas/)

Always consult the relevant pillar before drafting plans or modifying target code:

| Target Subsystem / Directory | Domain Scope | Modular Invariants SSOT |
| :--- | :--- | :--- |
| `src/domain/fsm/`, `src/domain/turn_loop.ts` | Phase FSM, Turn N+1 Teardown, Solvency, PRNG Streams | [`fsm_lifecycle.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/fsm_lifecycle.md) |
| `src/domain/property_*`, `treasury_*`, `bond_*` | Treasury Conservation, Pricing, Utilities, Bonds | [`economy_treasury.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/economy_treasury.md) |
| `src/domain/bot/`, `src/domain/p2p_trade.ts` | Multi-Agent Harassment, Valuation, Pacing, Duel Denial | [`bot_negotiation.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/bot_negotiation.md) |
| `src/server/network/`, `src/client/network/` | 5-Station Vertical Slice, Tombstones, Timers, Intents | [`network_delta.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/network_delta.md) |
| `src/client/ui/`, `src/client/modal_host.tsx` | Mobile 360px 3-Tier, 44px Touch Targets, Spatial Bounds | [`ui_ergonomics.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/ui_ergonomics.md) |
| `src/client/3d/`, `src/client/game_canvas.tsx` | Ocean Depth, Splines, In-Action Capture & Telemetry | [`3d_cinematics.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md) |
| `tests/**`, `tests/probes/` | Detroit Classical, Atomic Contract, Mutation Sensitivity | [`testing_traps.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/testing_traps.md) |
| `src/server/`, `src/domain/` | Deep Modules, Collection Protocol Parity, Aggregate Root | [`deep_modules.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/deep_modules.md) |

- **Cross-Domain Rules**:
  - *Error Code & Dictionary Exhaustiveness*: Every `ActionRejectReason` code must have 100% bi-directional mapping in `src/domain/i18n/vi.ts` typed strictly as `Record<ActionRejectReason, string>` (Enforced via `npm run check:i18n`).
  - *No Invariant Displacement*: Adding new edge or boundary tests MUST NOT displace, drop, or replace previously verified domain invariants.
  - *Dual-Platform 3D Performance & Mobile Thermal Invariant (IMP-265)*: 3D scenes must conditionally freeze continuous micro-animations and omit heavy passes (`ContactShadows`) when `isMobile === true` (See details in `3d_cinematics.md` Gotcha #14).

## 4. DEFINITION OF DONE & MECHANICAL GATES

A task is COMPLETE only when:
1. `npm run prefilter -- <files>` passes 100% (tsc, LOC, zero dirty casts, zero orphan files, linters).
2. Automated tests pass Adversarial Inversion with flow tags (`[UC-XXX/MSS]` or `[UC-XXX/A#]`), assertion density <= 4 per test, and zero living test mutations.
3. Reviewer gates approve in order: Phase 3.1 `spec-reviewer`, Phase 3.2 `code-reviewer` + visual critic; all reports physically persisted to `.agents/audit/*.md`.
4. Station 4 (`chaos-sentinel`) signs off 3 physical probes with zero surviving mutants and machine JSON evidence validated via `node scripts/check_evidence.mjs [TICKET]`.
5. Progress & Tech Debt ledger updated in `docs/epics/[epic]/_epic_ledger.md` and dedicated completion report persisted to `docs/reports/...`.
6. Honest Merge Danger Accounting: Stateful or UI affordance changes carry an objective risk floor of >= 1-2/10.

## 5. MECHANICAL COMMAND REFERENCE

- **Fast Pre-Filter (Station 2.5)**: `npm run prefilter -- <files>`
- **Plan Mechanical Auditor**: `node scripts/audit_plan.mjs <plan_path>`
- **Evidence & Gate Checker**: `node scripts/check_evidence.mjs <ticket>`
- **Anti-Slop & LOC Linters**: `npm run lint:slop` | `npm run check:loc <files>`
- **UI Craft & i18n Checks**: `npm run lint:ui` | `npm run check:i18n`
