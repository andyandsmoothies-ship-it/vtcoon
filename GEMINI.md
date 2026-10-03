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
  - Pre-Coding LOC Baseline: Measure via `npm run check:loc <files>` before drafting. Delta = `[Lines Added] - [Lines Deleted]`. Files in warning range (> 300 Tier 1, > 400 Tier 2) MUST be marked "Warning" (banned labeling "Safe") and register a Tech Debt item with future extraction plan. If Tier 1 Expected > 400 or Tier 2 > 480, Task 1 MUST extract submodules before adding features. Subtractive refactoring mandatory when replacing mechanisms.
- **Risk-Based Autonomous Tiering & 4-Station Closed-Loop Pipeline**:
  - *Tier 1 (Fast-Track)*: < 50 LOC, pure visual/CSS/spacing, audio, text, or isolated fix to 1-2 files (0 Schema, 0 FSM/Server, 0 Network). Main agent executes directly in 1-2 minutes (Zero subagents, no plan, exempt from diagramming and failure-mode enumeration). UI tweaks must not bundle with network/timing.
  - *Tier 2 (Full Rigor)*: Schema, Network, FSM, or > 50 LOC. Main agent drafts plan strictly in `.agents/plans/PLAN_[TICKET].md` (Single Source of Truth, zero `docs/plans/` duplicates), executes Two-Stage Plan Hardening, renders `🚦 [ACTIVATE 4-STATION CLOSED-LOOP PIPELINE]`, then executes 4-Station Pipeline:
    - **Two-Stage Plan Hardening Gate**:
      1. Stage A (Structural & Mechanical Audit): `plan-griller` verifies 5 Pillars (P1-P5) and physical disk baseline via `node scripts/audit_plan.mjs`.
      2. Stage B (Adversarial Challenge): `adversarial-challenger` probes novel attack vectors, concurrency/race hazards, economic exploits, and cascading failures into `.agents/audit/PLAN_CHALLENGE_[TICKET].md`.
      3. Hard Gate Verdict: Plan author reconciles all directives. Requires `HARDENED_APPROVED` verdict in `.agents/audit/PLAN_AUDIT_[TICKET].md`. Self-attestation carries zero weight.
    - **Human Review Gate**: After `HARDENED_APPROVED`, Main Agent pauses to present plan to User. Proceed to Station 1 only upon explicit User approval.
    - **Scope Bundling Ban**: Plans bundling > 2 unrelated change categories (e.g. server FSM + CSS visual + 3D rendering) MUST be split into separate tickets before grilling. Each ticket targets one domain. Bundled mega-plans are rejected at gate.
    1. Station 1 (RED Contract Test): `qa-tester` writes edge/contract tests in `tests/**` and proves failure (Adversarial Inversion). Strictly read-only on `src/**`. Atomic test mandate (1-4 asserts/test, zero loops in `it()`, zero static checklist tests). Universal 5-Facet Matrix. Floor: >= 15 atomic tests / slice.
    2. Station 2 (GREEN Implementation): `implementer` writes minimum code in `src/**` to pass tests. Zero bug-codification.
    2.5. Station 2.5 (Fast Pre-Filter Sweep): `scout` (model: flash) runs mechanical filters before review: typecheck (`tsc --noEmit`), LOC budget, zero dirty casts (`as any`), and console.log purge.
    3. Station 3 (Independent Review Funnel): Three-phase review gate:
       - Phase 3.0 (Physical Visual Evidence Gate): Mandatory UI capture into `.agents/tmp/` before visual review. Pure logic/data files without DOM/layout changes require an explicit Pure Logic Waiver documented in Plan & Report.
       - Phase 3.1 (Spec & Scope Gate): `spec-reviewer` verifies 100% plan fidelity and zero scope drift. MUST pass before Phase 3.2.
       - Phase 3.2 (Deep Architecture & Craft Gate): `code-reviewer` audits anti-slop, memory/timer leaks, and race hazards. In parallel, `game-3d-visual-critic` (3D) and `ui-craft-reviewer` (2D) audit aesthetics and ergonomics via physical screenshots.
    4. Station 4 (Adversarial Boundary & Mutation Sentinel): `chaos-sentinel` executes 3 physical probes for Tier 2 tasks: (1) Wire-to-Core Closed-Loop Parity, (2) Ephemeral Dynamic Boundary Probe (`port: 0`), (3) Targeted Mutation Sensitivity Probe (inline mutants banned; probe floor >= 14 tests). READ-ONLY on `src/**`. Signs off `.agents/evidence/chaos_sentinel_[ID].json`.
- **Core Domain & Architectural Invariants (SSOT: `docs/domain/gotchas.md`)**:
  - *SSOT & Player Intent*: Player choices must be explicit Intent transitions (ADR-0001), never implicit side-effects. Callers opening modals MUST NOT pass duplicate boolean overrides (`canBuy`) that shadow host affordance helpers.
  - *Transient Teardown & Turn N+1*: Ephemeral states (auctions, trades, prompts) MUST be purged on turn transitions (`handleRollDice`/`handleEndTurn`). Delta tombstones MUST serialize `null` for objects and `[]` for arrays.
  - *Strict Intent Callback Isolation*: Action callbacks with server intents (`onBuy`, `onPass`) MUST NOT silently fallback to UI dismiss handlers (`onClose`).
  - *Treasury Conservation & Bankrupt Isolation*: System money delta = Player delta + Treasury delta. Bankrupt players: 0 income, 0 expenses, 0 actions. Insolvent entities (`balance < 0`) can only sell, never buy. Dynamic pricing queries `PROPERTY_DEEDS`.
  - *Full-Pipeline Vertical Slice*: State fields/events MUST update all 5 stations: (1) Entity/FSM, (2) DTO & Mappers, (3) Broadcaster sparse diff, (4) Client Parser, (5) Client Store & UI. Distinguish persisted state (mandates 5-station broadcast) from on-the-fly computed values (mandates pure functional SSOT without stale caching). Action resets drive on `turnPhase` transitions, not player ID.
  - *Plan Hygiene & Subtractive Parity*: Drop-in snippets must cite exact enclosing function name. Plans strictly forbid `as any`. Subtractive branch deletions require parity proof. Label updates must co-evolve `aria-label`.
  - *Revision Directive Coverage (Anti-Sycophancy)*: When submitting a revised plan (Revision N+1), the author MUST include an explicit 1:1 table mapping every griller directive to the exact file/line that addresses it. Phrases like "100% addressed" or "all directives incorporated" without this table are **banned** and constitute automatic `REVISE_REQUIRED`.
  - *Dual-Viewport Parity & Layout Integrity*: Banned applying mobile-constrained compression patterns (e.g. forcing compact views or hiding primary decision data behind accordions) onto desktop screens. UI components must be designed and verified across both mobile and desktop viewports, ensuring vertical column balance, complete information visibility without unnecessary nesting, and visual symmetry on interactive actions.
- **Domain Specialist Delegations & Craft Invariants**:
  - 3D Visual & Spatial Standards (Zero-Blank-Material, Ground Truth Anchor): Governed by `game-3d-visual-critic` (`.agents/agents/game-3d-visual-critic.md`).
  - 2D UI Craft & Dual-Viewport Parity: Governed by `ui-craft-reviewer` (`.agents/agents/ui-craft-reviewer.md`) and `impeccable` skill. Passes `npm run lint:ui` with 0 violations.
  - Architectural Stress-Testing & Novel Exploit Probing: Governed by `plan-griller` (`.agents/agents/plan-griller.md`) and `adversarial-challenger` (`.agents/agents/adversarial-challenger.md`).
  - Adversarial Boundary & Mutation Resilience: Governed by `chaos-sentinel` (`.agents/agents/chaos-sentinel.md`).
- **Subagent SDLC Telemetry & Harness Feedback Protocol**:
  - Every dispatched subagent MUST conclude its completion message to Main Agent with a standardized telemetry block:
    ```markdown
    ### 🩺 SDLC HARNESS TELEMETRY
    - **Scripts/Tools**: [PASS | Friction description (e.g. tool latency, check_loc, guard hook, error)]
    - **Rules/Gotchas**: [PASS | Friction description (e.g. rule ambiguity, conflicting constraint, LOC budget)]
    - **Skills/Context**: [PASS | Missing/Unused skill feedback]
    - **Handoff Quality**: [PASS | Upstream ambiguity or missing context]
    - **Harness Suggestion**: [1 actionable suggestion to improve SDLC process, scripts, or settings]
    ```
  - **Zero-Raw-Trust & Two-Round Adversarial Cross-Examination Gate**:
    Subagent observations are treated strictly as unverified raw data (`RAW TELEMETRY`). Subagents may suffer from hallucinations, cognitive bias, or attempt to shift blame away from incomplete work. Main Agent MUST NOT mutate rules or settings on-the-fly. Upon task completion, Main Agent executes a mandatory 2-round cross-examination before synthesizing conclusions:
    1. *Round 1 (Physical Evidence Cross-Examination)*: Cross-check each telemetry claim against physical terminal logs, test runner outputs, compiler exits, git diffs, and disk baselines. Classify claims as `Physical Evidence Found` vs `Unsubstantiated / Hallucination`.
    2. *Round 2 (Adversarial Inversion & Guardrail Filter)*: Challenge surviving claims: Does adopting this suggestion degrade anti-slop, safety guardrails, or domain invariants? Was this an isolated prompt edge case or genuine systemic friction? Assign final verdict: `[DISMISSED NOISE / SUBAGENT BIAS]` vs `[VERIFIED SYSTEMIC FRICTION]`.
  - Main Agent MUST synthesize the verified telemetry into:
    1. A dedicated section in the completion report: `docs/reports/..._report.md` (§ "ĐÁNH GIÁ VẬN HÀNH & ĐỀ XUẤT CẢI TIẾN SETTING SDLC") containing: (a) Raw Observations Log, (b) 2-Round Cross-Examination Matrix, (c) Verified Actionable Recommendations.
    2. A closing summary section presented directly to the User in chat upon ticket completion. Rule and setting mutations occur ONLY after explicit User review and approval.

## 2. DEFINITION OF DONE

A task is COMPLETE only when:
1. Automated tests pass Adversarial Inversion, include traceability tags (`[UC-XXX/MSS]` or `[UC-XXX/A#]`), and pass fixture contracts against SSOT.
2. Code passes `npm run lint:slop` (complexity <= 5, LOC budgets) and `npm run lint:ui` (0 violations).
3. Reviewer gates approve in order: Phase 3.1 `spec-reviewer` approves 100% spec reconciliation; Phase 3.2 `code-reviewer` approves code quality/observability; `game-3d-visual-critic` / `ui-craft-reviewer` approve visual craft via physical screenshots (`view_file`); implementer never approves own code; `.agents/evidence/` snapshot has `executed: true`.
4. Station 4 (`chaos-sentinel`) signs off 3 physical probes with zero parity gaps, zero mock divergence, and zero surviving mutants (mandatory for Tier 2; mechanically verified via `node scripts/check_evidence.mjs`).
5. Progress and Tech Debt Ledger updated in `docs/epics/[epic]/_epic_ledger.md`, and dedicated completion report persisted automatically to `docs/reports/improvements/IMP-[ID]-[slug]_report.md` (for IMP tickets) or `docs/reports/audits/[ID]_acceptance_report.md` (for core tickets), explicitly citing: (a) Ledger link, (b) Traceability tag mapping, (c) DoD 1-6 compliance table, (d) Phase 3.0 artifact or waiver, AND (e) Synthesized SDLC Process & Harness Health Evaluation aggregating feedback from all stations.
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
