# AGENTS CONSTITUTION (PROJECT HARNESS)

> Precedence: This project harness specializes Global AG OS Rules. Project rules strictly override global rules in case of conflict.
> Target Market: Viet Nam. All user-facing documents and game artifacts must be in Vietnamese.

## 1. HARD CONSTRAINTS

- **Anti-Slop & Deep Modules (Enforced by lint:slop & check:loc)**:
  - Architecture: Deep modules only (simple interfaces hiding complex logic). Zero single-use abstractions, zero shallow pass-through wrappers.
  - TIER 1 (Domain Logic / FSM / Server): Max 400 LOC (warning at 300 LOC, hard error at 550 LOC).
  - TIER 2 (UI Components / 3D Canvas / Views): Max 500 LOC (warning at 400 LOC).
  - TIER 3 (Static Data / Config / Board Tables): Max 800 LOC (warning at 650 LOC).
  - Living / Integration Tests: Max 600 LOC (isolated unit tests <= 300 LOC; tolerance <= 650 LOC for suites >= 16 atomic tests).
  - Pre-Coding LOC Baseline: Measure via `npm run check:loc <files>` before drafting. Delta = `[Lines Added] - [Lines Deleted]`. If Tier 1 Expected > 400 or Tier 2 > 480, Task 1 MUST extract submodules before adding features. Subtractive refactoring mandatory when replacing mechanisms.
- **Risk-Based Autonomous Tiering & 4-Station Closed-Loop Pipeline**:
  - *Tier 1 (Fast-Track)*: < 50 LOC, pure visual/CSS/spacing, audio, text, or isolated fix to 1-2 files (0 Schema, 0 FSM/Server, 0 Network). Main agent executes directly in 1-2 minutes (Zero subagents, no plan). UI tweaks must NEVER bundle with network/timing.
  - *Tier 2 (Full Rigor)*: Schema, Network, FSM, or > 50 LOC. Main agent drafts plan, invokes `plan-griller` (P1-P5 audit), renders `🚦 [ACTIVATE 4-STATION CLOSED-LOOP PIPELINE]`, then executes 4-Station Pipeline:
    - **Hard Gate**: A Tier 2 plan is NOT executable without a `HARDENED_APPROVED` verdict from `plan-griller` written to `.agents/audit/PLAN_AUDIT_[TICKET].md`. Self-attestation labels ("Phê chuẩn kỹ thuật", "Technical Approval", "Approved") carry zero weight and constitute a gate bypass. Agent MUST halt and invoke `plan-griller` if this file is missing.
    - **Scope Bundling Ban**: Plans bundling > 2 unrelated change categories (e.g. server FSM + CSS visual + 3D rendering) MUST be split into separate tickets before grilling. Each ticket targets one domain. Bundled mega-plans are rejected at gate.
    1. Station 1 (RED Contract Test): `qa-tester` writes edge/contract tests in `tests/**` and proves failure (Adversarial Inversion). FORBIDDEN from editing `src/**`. Atomic test mandate (1-4 asserts/test, zero loops in `it()`, zero static checklist tests). Universal 5-Facet Matrix. Floor: >= 15 atomic tests / slice.
    2. Station 2 (GREEN Implementation): `implementer` writes minimum code in `src/**` to pass tests. Zero bug-codification.
    2.5. Station 2.5 (Fast Pre-Filter Sweep): `scout` (model: flash) runs mechanical filters before review: typecheck (`tsc --noEmit`), LOC budget, zero dirty casts (`as any`), and console.log purge.
    3. Station 3 (Independent Review Funnel): Three-phase review gate:
       - Phase 3.0 (Physical Visual Evidence Gate): Mandatory in-game capture into `.agents/tmp/` before invoking visual review.
       - Phase 3.1 (Spec & Scope Gate): `spec-reviewer` verifies 100% plan fidelity and zero scope drift. MUST pass before Phase 3.2.
       - Phase 3.2 (Deep Architecture & Craft Gate): `code-reviewer` audits anti-slop, memory/timer leaks, and race hazards. In parallel, `game-3d-visual-critic` (3D) and `ui-craft-reviewer` (2D) audit aesthetics and ergonomics via physical screenshots.
    4. Station 4 (Adversarial Boundary & Mutation Sentinel): `chaos-sentinel` executes 3 physical probes for Tier 2 tasks: (1) Wire-to-Core Closed-Loop Parity, (2) Ephemeral Dynamic Boundary Probe (`port: 0`), (3) Targeted Mutation Sensitivity Probe (inline mutants banned; probe floor >= 14 tests). READ-ONLY on `src/**`. Signs off `.agents/evidence/chaos_sentinel_[ID].json`.
- **Core Domain & Architectural Invariants (SSOT: `docs/domain/gotchas.md`)**:
  - *SSOT & Player Intent*: Player choices must be explicit Intent transitions (ADR-0001), never implicit side-effects. Callers opening modals MUST NOT pass duplicate boolean overrides (`canBuy`) that shadow host affordance helpers.
  - *Transient Teardown & Turn N+1*: Ephemeral states (auctions, trades, prompts) MUST be purged on turn transitions (`handleRollDice`/`handleEndTurn`). Delta tombstones MUST serialize `null` for objects and `[]` for arrays.
  - *Strict Intent Callback Isolation*: Action callbacks with server intents (`onBuy`, `onPass`) MUST NOT silently fallback to UI dismiss handlers (`onClose`).
  - *Treasury Conservation & Bankrupt Isolation*: System money delta = Player delta + Treasury delta. Bankrupt players: 0 income, 0 expenses, 0 actions. Insolvent entities (`balance < 0`) can only sell, never buy. Dynamic pricing queries `PROPERTY_DEEDS`.
  - *Full-Pipeline Vertical Slice*: State fields/events MUST update all 5 stations: (1) Entity/FSM, (2) DTO & Mappers, (3) Broadcaster sparse diff, (4) Client Parser, (5) Client Store & UI. Action resets drive on `turnPhase` transitions, not player ID.
  - *Plan Hygiene & Subtractive Parity*: Drop-in snippets must cite exact enclosing function name. Plans strictly forbid `as any`. Subtractive branch deletions require parity proof. Label updates must co-evolve `aria-label`.
  - *Revision Directive Coverage (Anti-Sycophancy)*: When submitting a revised plan (Revision N+1), the author MUST include an explicit 1:1 table mapping every griller directive to the exact file/line that addresses it. Phrases like "100% addressed" or "all directives incorporated" without this table are **banned** and constitute automatic `REVISE_REQUIRED`.
- **Domain Specialist Delegations & Craft Invariants**:
  - 3D Visual & Spatial Standards (Zero-Blank-Material, Ground Truth Anchor): Governed by `game-3d-visual-critic` (`.agents/agents/game-3d-visual-critic.md`).
  - 2D UI Craft, Mobile 360px Ergonomics & Touch Targets: Governed by `ui-craft-reviewer` (`.agents/agents/ui-craft-reviewer.md`) and `impeccable` skill. Passes `npm run lint:ui` with 0 violations.
  - Architectural Stress-Testing & Blind Spots: Governed by `plan-griller` (`.agents/agents/plan-griller.md`).
  - Adversarial Boundary & Mutation Resilience: Governed by `chaos-sentinel` (`.agents/agents/chaos-sentinel.md`).

## 2. DEFINITION OF DONE

A task is COMPLETE only when:
1. Automated tests pass Adversarial Inversion, include traceability tags (`[UC-XXX/MSS]` or `[UC-XXX/A#]`), and pass fixture contracts against SSOT.
2. Code passes `npm run lint:slop` (complexity <= 5, LOC budgets) and `npm run lint:ui` (0 violations).
3. Reviewer gates approve in order: Phase 3.1 `spec-reviewer` approves 100% spec reconciliation; Phase 3.2 `code-reviewer` approves code quality/observability; `game-3d-visual-critic` / `ui-craft-reviewer` approve visual craft via physical screenshots (`view_file`); implementer never approves own code; `.agents/evidence/` snapshot has `executed: true`.
4. Station 4 (`chaos-sentinel`) signs off 3 physical probes with zero parity gaps, zero mock divergence, and zero surviving mutants (mandatory for Tier 2; mechanically verified via `node scripts/check_evidence.mjs`).
5. Progress and Tech Debt Ledger updated in `docs/epics/[epic]/_epic_ledger.md`, and dedicated completion report persisted automatically to `docs/reports/improvements/IMP-[ID]-[slug]_report.md` (for IMP tickets) or `docs/reports/audits/[ID]_acceptance_report.md` (for core tickets).
6. Production resilience verified: defense against invalid intents, treasury conservation invariant, Turn N+1 state teardown, and explicit tombstone delivery.

## 3. PROJECT NFR BASELINE

- **Game Engine & FSM**: Server-authoritative transitions only. Deterministic PRNG seeded per session. Action timeout <= 60s.
- **Rendering & UI**: Target 60 FPS on React Three Fiber. Zero heavy computations on render thread.
- **Network & WebSocket**: State delta < 10KB per tick. Disconnection grace period 60s.
- **Code Quality**: TypeScript strict mode (`strict: true`, `noUncheckedIndexedAccess: true`).

## 4. INDEXED MEMORY POINTERS

- Requirements & Rules: [`docs/requirements.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/requirements.md)
- Domain Design Invariants (6 Pillars): [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)
- Domain Gotchas Archive (#1 - #289): [`docs/domain/gotchas_archive.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas_archive.md)
- Entity Model & 28 Title Deeds: [`docs/domain/entity_model.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/entity_model.md)
- Visual Design System & Tokens: [`docs/domain/design.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/design.md)
- Impeccable 2D Craft Skill: [`.agents/skills/impeccable/SKILL.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/SKILL.md)
- Architecture Decisions Ledger: `docs/domain/adr/`
- Active Epic Progress: `docs/epics/[epic]/_epic_ledger.md`
- Master Roadmap: [`docs/master_roadmap.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/master_roadmap.md)
