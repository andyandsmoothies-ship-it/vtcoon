# AGENTS CONSTITUTION (PROJECT HARNESS)

> Precedence: This project harness specializes Global AG OS Rules. Project rules strictly override global rules in case of conflict.
> Target Market: Viet Nam. All user-facing documents and game artifacts must be in Vietnamese.

## 1. HARD CONSTRAINTS

- **Anti-Slop & Deep Modules (Enforced by lint:slop & check:loc)**:
  - Architecture: Deep modules only (simple interfaces hiding complex logic). Zero single-use abstractions, zero shallow pass-through wrappers. Banned creating 1-line delegate methods (`fn(args) { return this.x.fn(args); }`) that merely forward calls to another module without adding substantial orchestration, domain invariants, or state transformation.
  - Anti Test-Induced Design Damage (TIDD): Banned exposing test-only properties, methods, functions, or backdoors (`ForTesting` suffix) on production code in `src/**` (mechanically enforced by `lint:slop` Rule 8 `zero-test-props` and Rule 11 `zero-orphan-production-files`). Any export, component, or property whose only consumer is a test suite is dead production API — move it to `tests/**` or extract pure helper functions/custom hooks. Newly added methods, functions, or components on production files MUST have at least one caller outside `tests/**` (mechanically audited via `scripts/audit_plan.mjs` Rule 1.2).
  - The Deletion Test & Seam Discipline (Matt Pocock codebase-design): Any newly planned or introduced module/file MUST pass the Deletion Test: imagine deleting the module; if complexity vanishes, it was an unnecessary pass-through wrapper and is BANNED; if complexity reappears across callers, it is justified. A seam requires at least two adapters (e.g. production + in-memory test); single-adapter seams are banned indirection. The interface is the test surface: callers and tests cross the same seam.
  - Client/Server Boundary & Zero Dirty Casts: Banned importing platform/runtime built-ins (`node:*`, OS/server packages) into shared DTOs or files consumed by client/browser bundles. Banned `as any`, `as unknown as T` across ALL files (`src/**` and `tests/**`). Network integration tests MUST use dynamic `port: 0` live sockets, never mock sockets with double type-casts.
  - Honest LOC Accounting & Ban on Code-Golf: Files in warning range (> 300 Tier 1) are valid intermediate states with registered Tech Debt. Banned code-golfing (squishing multiple methods/getters onto single lines, stripping comments) to artificially game LOC budgets.
  - Strict Pure-Move Quarantine & Zero Semantic Mutation: On refactoring/modularization tickets, behavioral changes, new guards, error swallowing (`try...catch` silencing), input normalization/trimming, or policy mutations are strictly forbidden. Refactor tickets must be 100% behavior-preserving. All security/hardening directives from adversarial audits must be quarantined into separate follow-up tickets.
  - Characterization Testing for Refactoring: For refactor/pure-move tickets, Station 1 tests must characterize and lock down existing contracts (e.g., mutex lifecycles, error propagation) on physical disk before code is moved. Tests failing merely due to missing imports in new files are banned from being presented as genuine RED behavioral tests.
  - TIER 1 (Domain Logic / FSM / Server): Max 400 LOC (warning at 300 LOC, hard error at 550 LOC).
  - TIER 2 (UI Components / 3D Canvas / Views): Max 500 LOC (warning at 400 LOC).
  - TIER 3 (Static Data / Config / Board Tables): Max 800 LOC (warning at 650 LOC).
  - Living / Integration Tests: Max 600 LOC (isolated unit tests <= 300 LOC; tolerance <= 650 LOC for suites >= 16 atomic tests).
  - Pre-Coding LOC Baseline: Measure via `npm run check:loc <files>` before drafting. Delta = `[Lines Added] - [Lines Deleted]`. Measurement Leeway: Automated check:loc allows a 5% grace buffer on physical lines if Non-Empty SLOC remains within the budget ceiling, preventing false failures from clean spacing and comments. Files in warning range (> 300 Tier 1, > 400 Tier 2) MUST be marked "Warning" (banned labeling "Safe") and register a Tech Debt item with future extraction plan. If Tier 1 Expected > 400 or Tier 2 > 480, Task 1 MUST extract submodules before adding features. Subtractive refactoring mandatory when replacing mechanisms.
- **Risk-Based Autonomous Tiering & 4-Station Closed-Loop Pipeline**:
  - *Tier 1 (Fast-Track)*: < 50 LOC, pure visual/CSS/spacing, audio, text, or isolated fix to 1-2 files (0 Schema, 0 FSM/Server, 0 Network). Main agent executes directly in 1-2 minutes (Zero subagents, no plan, exempt from diagramming and failure-mode enumeration). UI tweaks must not bundle with network/timing.
  - *Tier 2 (Full Rigor)*: Schema, Network, FSM, or > 50 LOC. Main agent drafts plan strictly in `.agents/plans/PLAN_[TICKET].md` (Single Source of Truth, zero `docs/plans/` duplicates), executes Two-Stage Plan Hardening, renders `🚦 [ACTIVATE 4-STATION CLOSED-LOOP PIPELINE]`, then executes 4-Station Pipeline:
    - **Two-Stage Plan Hardening Gate**:
      1. Stage A (Structural & Mechanical Audit): `plan-griller` verifies 5 Pillars (P1-P5) and physical disk baseline via `node scripts/audit_plan.mjs` (including mechanical validation of DoD #1 Flow Taxonomy `[UC-.../MSS]` and `[UC-.../A#]` in Section 3 test specifications, Rule 1.2 Anti-TIDD consumer check, and Rule 2.9 Zero No-Op Snippets requiring functional diffs between `<<<<` and `====`).
      2. Stage B (Adversarial Challenge): `adversarial-challenger` probes novel attack vectors, concurrency/race hazards, economic exploits, and cascading failures into `.agents/audit/PLAN_CHALLENGE_[TICKET].md`. On pure-move refactoring tickets, discovered attack vectors must be emitted as directives for follow-up hardening tickets, not bundled into the refactor.
      3. Hard Gate Verdict: Plan author reconciles all directives. Requires `HARDENED_APPROVED` verdict in `.agents/audit/PLAN_AUDIT_[TICKET].md`. Self-attestation carries zero weight.
    - **Human Review Gate**: After `HARDENED_APPROVED`, Main Agent pauses to present plan to User. Proceed to Station 1 only upon explicit User approval.
    - **Scope Bundling Ban & Single Domain per Ticket**: Plans bundling > 2 unrelated change categories (e.g. server FSM + CSS visual + 3D rendering) MUST be split into separate tickets before grilling. Each ticket targets strictly one domain (Gameplay, Networking, UI). Deferrals and technical debts from separate domains MUST NOT share the same target ticket ID.
    1. Station 1 (RED Contract Test): `qa-tester` writes edge/contract tests in `tests/**` and proves failure (Adversarial Inversion). Strictly read-only on `src/**`. Atomic test mandate (1-4 asserts/test, zero loops in `it()`, zero static checklist tests). Universal 5-Facet Matrix. Floor: >= 15 atomic tests / slice. Blast Radius Pre-scan: QA runs related test suites; any outdated preconditions from invariant changes must be flagged in Station 1 handoff report.
    2. Station 2 (GREEN Implementation): `implementer` writes minimum code in `src/**` to pass tests. Zero bug-codification. Implementer Pushback Mandate: If an approved plan snippet is a no-op, breaks an invariant, or introduces dead code, implementer MUST apply the real physical fix rather than blindly executing flawed plan code.
    2.5. Station 2.5 (Fast Pre-Filter Sweep): `scout` (model: flash) runs unified mechanical pre-filter: `npm run prefilter -- <files>` in a single pass (typecheck `tsc --noEmit`, LOC budget, zero dirty casts `as any`, zero framework spies `spyOn(React,`, console.log purge, and linters `lint:slop`, `lint:ui`, `check:i18n`).
    3. Station 3 (Independent Review Funnel): Four-phase review gate:
       - Phase 3.0 (Physical Visual Evidence Gate): Mandatory UI capture into `.agents/tmp/` before visual review. When UI components are added or modified, capture MUST verify Dual-Viewport Parity (both Desktop 1280x800 and Mobile 360x740 via `scripts/capture_visual_evidence.mjs --dual-viewport`) including active affordances/modals under test. Pure logic/data files without DOM/layout changes require an explicit Pure Logic Waiver documented in Plan & Report.
       - Phase 3.1 (Spec & Scope Gate): `spec-reviewer` verifies 100% plan fidelity and zero scope drift. MUST pass before Phase 3.2.
       - Phase 3.2 (Deep Architecture & Craft Gate): `code-reviewer` audits anti-slop, memory/timer leaks, and race hazards. In parallel, `game-3d-visual-critic` (3D) and `ui-craft-reviewer` (2D) audit aesthetics and ergonomics via physical screenshots. Conditional Dispatch: If Pure Logic Waiver applies, dispatch ONLY `code-reviewer` (ban visual critics dispatch to eliminate token waste).
       - Phase 3.3 (Physical Report Persistence Gate): When receiving evaluation reports from Read-Only subagents via `send_message`, Main Agent MUST immediately write the full report to `.agents/audit/[TYPE]_REVIEW_[TICKET].md` using `write_to_file` before proceeding to Station 4. Banned citing or certifying any review file in acceptance reports if that file does not physically exist on disk.
    4. Station 4 (Adversarial Boundary & Mutation Sentinel): `chaos-sentinel` executes 3 physical probes for Tier 2 tasks: (1) Domain-Adaptive Wire-to-Core Closed-Loop Parity, (2) Ephemeral Dynamic Boundary Probe (`port: 0`), (3) Targeted Mutation Sensitivity Probe (floor >= 14 tests, 100% kill rate, 0 survived). Self-awarded or automatic fallback waivers are strictly BANNED. READ-ONLY on `src/**`. Signs off `.agents/evidence/chaos_sentinel_[ID].json`. Visual vs Probe Separation: Headless WebGL2 context smoke probe outputs `webgl2_headless_smoke_probe.png`, strictly separated from Phase 3.0 real board captures; synthetic smoke cubes are banned from masquerading as ticket visual deliverables.
- **Core Domain & Architectural Invariants (SSOT: `docs/domain/gotchas.md`)**:
  - *SSOT & Player Intent*: Player choices must be explicit Intent transitions (ADR-0001), never implicit side-effects. Callers opening modals MUST NOT pass duplicate boolean overrides (`canBuy`) that shadow host affordance helpers.
  - *Transient Teardown & Turn N+1*: Ephemeral states (auctions, trades, prompts) MUST be purged on turn transitions (`handleRollDice`/`handleEndTurn`). Delta tombstones MUST serialize `null` for objects and `[]` for arrays.
  - *Strict Intent Callback Isolation*: Action callbacks with server intents (`onBuy`, `onPass`) MUST NOT silently fallback to UI dismiss handlers (`onClose`).
  - *Treasury Conservation & Bankrupt Isolation*: System money delta = Player delta + Treasury delta. Bankrupt players: 0 income, 0 expenses, 0 actions. Insolvent entities (`balance < 0`) can only sell, never buy. Dynamic pricing queries `PROPERTY_DEEDS`.
  - *Full-Pipeline Vertical Slice*: State fields/events MUST update all 5 stations: (1) Entity/FSM, (2) DTO & Mappers, (3) Broadcaster sparse diff, (4) Client Parser, (5) Client Store & UI. Distinguish persisted state (mandates 5-station broadcast) from on-the-fly computed values (mandates pure functional SSOT without stale caching). Action resets drive on `turnPhase` transitions, not player ID.
  - *Plan Hygiene & Lean Specifications*: Plans must focus on Architecture, State Flow, Contracts (API/DTO/Type signatures), and Core Logic Seams. Full copy-paste of entire JSX/CSS/DOM components into plans is banned (specify Props interface, Affordance triggers, and Layout rules instead). Exact code snippets (`<<<< ==== >>>>`) are reserved for critical FSM, Server algorithms, and Data pipelines. Plans strictly forbid `as any`. `Est. Delta` in LOC tables uses reasonable engineering estimates without micromanaging line-by-line snippet arithmetic. Subtractive branch deletions require parity proof. Label updates must co-evolve `aria-label`.
  - *Revision Directive Coverage (Anti-Sycophancy)*: When submitting a revised plan (Revision N+1), the author MUST include an explicit 1:1 table mapping every griller directive to the exact file/line that addresses it. Phrases like "100% addressed" or "all directives incorporated" without this table are **banned** and constitute automatic `REVISE_REQUIRED`.
  - *Dual-Viewport Parity & Layout Integrity*: Banned applying mobile-constrained compression patterns (e.g. forcing compact views or hiding primary decision data behind accordions) onto desktop screens. UI components must be designed and verified across both mobile and desktop viewports, ensuring vertical column balance, complete information visibility without unnecessary nesting, and visual symmetry on interactive actions.
  - *Spatial Ground Truth & Non-Collision Verification*: Banned using mental math for UI container coordinates in plans (must cite physical snapshot measurements or DOM rects). Banned asserting CSS class strings as proof of non-collision or spatial clearance (assert bounding box intervals or visual evidence). Banned suppressing or hiding domain events/notifications to resolve layout squeeze without accessible history.
  - *PRNG Stream Isolation & Determinism*: Server PRNG streams (`rng` for dice/movement, `deckRng` for Chance/Market cards) MUST remain strictly isolated across all second-hop and transit actions. Mixing streams breaks deterministic replay (Invariant 7 in `docs/domain/gotchas.md`).
  - *Listener Idempotency & Side-Effect Cascade Order*: Event listeners attached during authentication/reconnect must be idempotent (guarded by Set membership or `.once()`). Network action routers must emit direct caller ACKs before or atomically with broad broadcast state changes to prevent client-side race conditions.
  - *Error Code & Dictionary Exhaustiveness*: Every `ActionRejectReason` code must have 100% bi-directional mapping in `src/domain/i18n/vi.ts` typed strictly as `Record<ActionRejectReason, string>` (banned `as Record<string, string>`). Enforced mechanically via `npm run check:i18n` (`scripts/check_reason_i18n_parity.mjs`).
  - *No Invariant Displacement*: Adding new edge, boundary, or rounding tests MUST NOT displace, drop, or replace previously verified domain invariants (e.g. `PLAYER_BANKRUPT`, treasury conservation, auth guards). All baseline invariants remain permanently locked in contract test suites.
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
    1. A dedicated section in the completion report: `docs/reports/..._report.md` (§ "ĐÁNH GIÁ VẬN HÀNH & ĐỀ XUẤT CẢI TIẾN SETTING SDLC") adhering to [`.agents/skills/retro/SKILL.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/retro/SKILL.md) (classifying defects: mechanical violations become deterministic check scripts; domain invariants become gotchas/rules).
    2. A closing summary section presented directly to the User in chat upon ticket completion formatted according to [`.agents/skills/pr/SKILL.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/pr/SKILL.md) (Summary + Evidence + Merge Danger). Rule and setting mutations occur ONLY after explicit User review and approval.
  - **Encode Lessons in Structure & Hierarchy of Determinism (Kaito & Matt Pocock retro)**: When transforming review corrections or recurring subagent mistakes into project guardrails, default to building checks over writing rules. Enforce via strict priority order: `Express with Types` (compiler safety, enums, DTOs) > `Lint/AST Scripts` (pre-flight scripts, audit_plan, lint_slop) > `Common Functions` (SSOT pure helpers) > `Runtime Checks` (conditional assertions/guards).
  - **Periodic Maintenance Routine (Weekly / 10-Session Routine - Matt Pocock)**: Periodically run `/retro` to inspect conversation logs for navigability friction and obsolete docs, and run `/codebase-design` with the Deletion Test to prune shallow abstractions and unnecessary layers.

## 2. DEFINITION OF DONE

A task is COMPLETE only when:
1. Automated tests pass Adversarial Inversion, include traceability tags (`[UC-XXX/MSS]` or `[UC-XXX/A#]`), and pass fixture contracts against SSOT.
2. Code passes `npm run lint:slop` (complexity <= 5, LOC budgets) and `npm run lint:ui` (0 violations).
3. Reviewer gates approve in order: Phase 3.1 `spec-reviewer` approves 100% spec reconciliation; Phase 3.2 `code-reviewer` approves code quality/observability; `game-3d-visual-critic` / `ui-craft-reviewer` approve visual craft via physical screenshots (`view_file`); all review documents physically persisted to `.agents/audit/*.md`; implementer never approves own code; `.agents/evidence/` snapshot has `executed: true`.
4. Station 4 (`chaos-sentinel`) signs off 3 physical probes with zero parity gaps, zero mock divergence, zero surviving mutants, and headless smoke output cleanly separated from Phase 3.0 visual captures (mandatory for Tier 2; mechanically verified via `node scripts/check_evidence.mjs`).
5. Progress and Tech Debt Ledger updated in `docs/epics/[epic]/_epic_ledger.md` using persistent, immutable keys (e.g. `DEBT-PROP-ACTIONS`, `DEBT-APPLY-DELTA` with `CARRIED OVER` status; incrementing suffixes `-01/-02/-03` are banned), and dedicated completion report persisted automatically to `docs/reports/improvements/IMP-[ID]-[slug]_report.md` (for IMP tickets) or `docs/reports/audits/[ID]_acceptance_report.md` (for core tickets), explicitly citing: (a) Ledger link, (b) Traceability tag mapping, (c) DoD 1-6 compliance table, (d) Phase 3.0 artifact or waiver, AND (e) Synthesized SDLC Process & Harness Health Evaluation aggregating feedback from all stations.
6. Production resilience verified: defense against invalid intents, treasury conservation invariant, Turn N+1 state teardown, and explicit tombstone delivery.

## 3. PROJECT NFR BASELINE

- **Game Engine & FSM**: Server-authoritative transitions only. Deterministic PRNG seeded per session. Action timeout <= 60s.
- **Rendering & UI**: Target 60 FPS on React Three Fiber. Zero heavy computations on render thread.
- **Network & WebSocket**: State delta < 10KB per tick. Disconnection grace period 60s.
- **Code Quality**: TypeScript strict mode (`strict: true`, `noUncheckedIndexedAccess: true`).

## 4. TIERED NAVIGATION POINTERS (HIERARCHY OF DETERMINISM)

### Level 1: Types & Domain Contracts (Trọng tài biên dịch tối cao)
- **Wire Intent & Protocol DTOs**: `src/domain/action_intent_types.ts`, `src/domain/types.ts`
- **Entity Model & 28 Title Deeds**: [`docs/domain/entity_model.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/entity_model.md), `src/domain/board_tiles.ts`
- **Rejection Reason Enum & i18n Mapping**: `src/domain/rejection_reasons.ts` <--> `src/domain/i18n/vi.ts`
- **Visual Design Tokens & Contracts**: [`docs/domain/design.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/design.md)

### Level 2: Mechanical Guardrails & AST Linters (Chốt chặn tự động)
- **Pre-flight Plan Griller & Anti-TIDD**: `node scripts/audit_plan.mjs <plan>`
- **Fast Pre-Filter Sweeper (Station 2.5)**: `npm run prefilter -- <files>`
- **Anti-Slop, Complexity & Orphan Files**: `npm run lint:slop` (Rule 8: zero-test-props, Rule 11: zero-orphan-files)
- **2D UI Impeccable Craft Audit**: `npm run lint:ui`
- **Station 4 Sentinel & Zero-Blindness Gate**: `node scripts/check_evidence.mjs <ticket>`

### Level 3: Common Functions & Pure Math SSOT (Hàm dùng chung — Cấm tái chế)
- **3D Spatial Packing & Bounds**: `src/client/3d/building_packer.ts`, `src/client/3d/spatial_invariants.ts`
- **Curve & Buffer Geometries**: `src/client/3d/curve_line_buffer.ts`
- **UI Currency & Formatters**: `src/client/ui/ui_helpers.ts`
- **Bot Valuation & Decision Math**: `src/domain/bot/valuation_engine.ts`

### Level 4: Runtime Invariants & Architectural Memory (Phán đoán miền)
- **Domain Design Invariants (6 Pillars)**: [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)
- **Domain Gotchas Archive (#1 - #289)**: [`docs/domain/gotchas_archive.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas_archive.md)
- **Task Graph Frontier**: [`.agents/skills/implement-spec/SKILL.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/implement-spec/SKILL.md)
- **Session Retrospective**: [`.agents/skills/retro/SKILL.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/retro/SKILL.md)
- **Concise PR & Merge Danger**: [`.agents/skills/pr/SKILL.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/pr/SKILL.md)
- **Active Epic Ledger & Tech Debt**: `docs/epics/[epic]/_epic_ledger.md`
- **Architecture Decisions (ADR)**: `docs/domain/adr/`
- **Master Roadmap**: [`docs/master_roadmap.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/master_roadmap.md)
