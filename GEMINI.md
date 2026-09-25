# AGENTS CONSTITUTION (PROJECT HARNESS)

> Target Market: Viet Nam. All user-facing documents and game artifacts must be in Vietnamese.

## 1. HARD CONSTRAINTS

- **Visual Design Compliance**: Follow `docs/domain/design.md`. Keep theme tokens lean.
- **Anti-Slop (YAGNI) & Project LOC Tiers (Enforced by lint:slop)**:
  - Minimum structure: Zero single-use abstractions, zero speculative extensions.
  - TIER 1 (Domain Logic / FSM / Server): Max 400 LOC (modular warning at 300 LOC, hard error at 550 LOC).
  - TIER 2 (UI Components / 3D Canvas / Views): Max 500 LOC (extract hooks if logic exceeds 50 LOC; warning at 400 LOC).
  - TIER 3 (Static Data / Config / Board Tables): Max 800 LOC (e.g. `tile_icons.ts`, `property_manager_data.ts`, `board_config.ts`; warning at 650 LOC).
  - Living / Integration Tests: Max 600 LOC (isolated unit tests <= 300 LOC; tolerance <= 650 LOC for suites >= 16 atomic tests).
  - Functions: Max 30 LOC, Cyclomatic Complexity <= 5 (logic warns at 50 SLOC, fails at 80 SLOC; declarative JSX/textures exempt).
  - Pre-Coding Delta LOC: Any target file >= 300 LOC MUST include `[Current + Delta = Expected]` calculation. If Tier 1 `Expected > 400` or Tier 2 `Expected > 480`, Task 1 MUST extract submodules before adding features. Declarative Tailwind JSX layouts are exempt from premature extraction if custom hooks logic <= 50 LOC.
  - Subtractive Refactoring: When replacing states, listeners, or flags, plans MUST explicitly specify obsolete code to delete.
  - Anti-Regression Guard: Code golf, line stripping, and fake no-op stubs are strictly forbidden. Files under 300 LOC must stay intact.
- **Slice Scope Confinement**: Implement only flows in current ticket. Log deferred flows in Tech Debt Ledger.
- **Pre-Flight Blast Radius Audit (3-Way Matrix)**: Every plan and review MUST evaluate 3 cross-cutting axes: 1. *Downstream Consumers* (callers, UI subscribers, derived stores, broadcasters, observers); 2. *Upstream Environmental Modifiers* (active market cards/buffs/debuffs `MC_*`, global policies, interest/tax rates); 3. *Exceptional Lifecycle Modes* (reconnect full-sync, Turn N+1 reset, concurrent multi-event mutations, terminal/bankrupt state). Worst-case defense and regression tests mandatory for each axis.
- **Test State Isolation**: Zero order-dependent tests. Run test suites with `--randomize`. Reconcile static data with fixture contracts.
- **Risk-Based Autonomous Tiering & Implementation Pipeline**:
  - *Tier 1 (Fast-Track)*: < 50 LOC, UI/CSS/spacing, 3D math, audio, text, or isolated fix to 1-2 files (0 Schema, 0 FSM/Server, 0 Network). Main agent executes directly (Zero subagents, no separate plan/report). Write 1-3 fast tests + minimal code + verify. Complete in 1-2 minutes.
  - *Tier 2 (Full Rigor)*: Schema/Database, Network Protocol, FSM/Finance/Auth, or feature > 50 LOC. Main agent MUST draft implementation plan and invoke `plan-griller` first to trigger the IDE Plan Review Policy, followed by 3-Station Pipeline:
    - *Visual Banner*: Render `🚦 [KÍCH HOẠT QUY TRÌNH 3 TRẠM]` into chat.
    - *Auto-Escalation*: If Tier 1 exceeds 50 LOC, touches FSM/Schema, or triggers regression, STOP immediately and escalate to Tier 2.
    1. Station 1 (RED Contract Test): `qa-tester` writes edge/contract tests in `tests/**` and proves failure (Adversarial Inversion). FORBIDDEN from editing `src/**`. Atomic Test Mandate (1-4 asserts/test, zero loops in `it()`). BANNED: static checklist tests (`fs.existsSync`, `typeof fn`). Universal 5-Facet Matrix (Boundary, Reactivity, Disposal, Error Defense, Cross-Coupling Blast Radius). Floor: >= 15 atomic tests / feature slice.
    2. Station 2 (GREEN Implementation): `implementer` writes minimum code in `src/**` to pass tests. FORBIDDEN from relaxing assertions (Zero Bug-Codification).
    2.5. Station 2.5 (Sweeping Scout Audit): After tests pass and before Station 3 review, Agent invokes `scout` to sweep all modified physical files for stale snapshots, unhandled async, leaked listeners, secret hacks, and dead-end UI states. All findings must be resolved before Station 3 sign-off.
    3. Station 3 (Independent Review & Disk Verification): Read-only reviewers (`spec-reviewer`, `code-reviewer`, `game-3d-visual-critic`, `ui-craft-reviewer`) audit independently. Reject monolithic or static checklist tests. Implementer never approves own code. Reviewers MUST inspect physical disk files (`view_file`, `list_dir`) and `.agents/evidence/` snapshot before signing off.
- **Zero-Trust Plan Grilling & Dual Output**: Plans are flawed by default. Before user approval, invoke `plan-griller` (model: inherit) to audit physical disk code across 5 pillars (Data Origin-to-Sink Lifecycle, Layout Budget, Actor Inversion, Transient Teardown, 3-Way Blast Radius). `plan-griller` MUST write detailed audit to `.agents/audit/PLAN_AUDIT_[TICKET].md` and return a concise summary table (<20 lines) in chat. Main agent verifies findings against physical files before updating `implementation_plan.md`. Zero blind compliance.
- **Automated Evidence Snapshot**: Quantitative evidence snapshot (`.agents/evidence/`) must be recorded before Station 3 sign-off. Triggered automatically by Station 2 or `npm run gate`.
- **Test Tiering & UAT Execution Boundary**: Fast in-memory tests (`npm test`) must complete in <= 5s. Heavy Turn-by-Turn UAT (`npm run test:uat`, 100 turns) runs ONLY for core changes in `src/domain/`, `src/server/`, or pre-release UAT. STRICTLY FORBIDDEN during UI-only, CSS, 3D assets, or docs edits.
- **E2E Artifact Requirement**: Complex feature tests must produce verifiable artifacts (snapshots, logs, or screenshots).
- **Adversarial Test Scenarios**: Ban happy-path testing. Test medium/hard scenarios (multi-agent competition, debt, disconnects).
- **SSOT & Player Intent Integrity**: Player decisions (buy, upgrade, trade) must be explicit Intent transitions (ADR-0001). Never execute player choices as implicit movement side-effects.
- **Transient State & Turn N+1 Teardown Invariant**: Ephemeral states (auctions, trades, prompts) MUST be purged on turn transitions (`handleRollDice`/`handleEndTurn`). Leaking stale state into Turn N+1 is strictly forbidden.
- **Explicit Tombstone Protocol (`null` vs `undefined`)**: Cleared delta payload fields MUST explicitly serialize as `null` (never `undefined`) to prevent client retention of stale data.
- **Timer Domain Isolation & Pure Domain Core**: Domain services (`RoomManager`, FSM) must remain pure synchronous (zero `setTimeout`). All timers belong to Orchestrators and must use identity-keyed maps to prevent accidental cancellation during room resets.
- **Interactive Zombie UI Prohibition**: Terminal modal states (`isConcluded: true`) must disable action controls immediately and emit zero server intents on dismiss. Client stores must never reopen dismissed terminal dialogs.
- **Bankrupt Entity Absolute Isolation**: Any domain service, card handler, or calculation iterating over `Player[]` MUST filter active ones (`!p.bankrupt`). Bankrupt players: 0 income, 0 expenses, 0 repositioning, 0 pool inclusion, 0 buyout eligibility. Solitary penalties (`opponents.length === 0`) must route to Treasury.
- **Subagent Artifact Persistence (Dual Output Pattern)**: Subagents write large artifacts to disk (`docs/plans/`, `docs/reports/`) and return concise chat summaries (<20 lines) with clickable links.
- **Vertical Slice Completeness & Full-Pipe Serialization**: State fields on `Player` or `Room` must map to `DeltaPayload`, must be compared in Broadcaster `isPlayerEqual`/`isCellEqual` (Sparse Diff), and must be parsed in Client `OPTIONAL_KEYS`. Every emitted event must have consumer tests verifying state change across all 5 transmission stations.
- **Phase-Driven Action State Reset**: Client action availability flags (`hasRolledThisTurn`, `isActing`) MUST reset on `turnPhase` transitions (e.g., `WaitingRoll` resets `hasRolledThisTurn = false`), NEVER solely reliant on `currentPlayerId` changes to prevent extra-turn deadlocks.
- **Insolvent Entity Role Guard**: Entities with `balance < 0` are strictly forbidden from acting as `buyer` in property trades or asset swaps (`price <= 0`). Insolvent entities may only act as `seller` with positive cash inflow (`price > 0`) to resolve passive debt.
- **Two-Sided Fund Flow Trace**: Khi hạch toán hoặc theo dõi dòng tiền (thế chấp, giải chấp, M&A, giao dịch), phải phân định rõ chuyển tiền nội bộ (Player <-> Treasury) và dòng tiền vào/ra hệ thống. Khi giải chấp, biến động lưu thông ròng là `-loan` (hoàn trả tín dụng ngân hàng); phí giải chấp 10% là chuyển giao nội bộ vào Kho bạc, không phải thất thoát hệ thống.
- **Multi-Agent Harassment Guard**: In P2P trades, auctions, or AI prompts targeting players, cooldowns must be enforced at Target/Room scope (`room.lastTargetTradeOfferRound`), not just Actor scope, preventing N bots from spamming a single player in one round.
- **Asynchronous Stream Contract & Event Isolation**: In event-driven/WebSocket systems, tests MUST filter events by type (`waitForMessageType`) or assert full event sequences. NEVER assert positional indices (`messages[0]`) on multi-event lifecycle transitions. Production code MUST NOT suppress valid upstream domain events solely to satisfy naive single-message test listeners.
- **Zero-Blank-Material Invariant**: Plain untextured `<meshBasicMaterial />` or `<meshStandardMaterial />` on badges, flagpoles, signs, or paintings without real texture (`map`) is forbidden. Hidden DOM attributes (`data-*`) cannot bypass WebGL rendering verification.
- **2D UI Craft Quality Gate**: UI changes must pass `npm run lint:ui` with 0 violations (4 anti-patterns: `border-accent-on-rounded`, `bounce-easing`, `gray-on-color`, `gradient-text`). Audit via `ui-craft-reviewer`.
- **Root-Level Sticky Action Footer**: Primary modal action footers (Submit, Confirm, Bid, Close) MUST be direct children of the root modal container (`sticky bottom-0`), NEVER nested within multi-column sub-trees to prevent broken mobile sticky context.
- **Mobile 360px & Cross-Browser Ergonomics Triad**:
  - *Dynamic Viewport*: Scrollable dialogs/modals MUST use `max-h-[90dvh]` (never raw `vh`) to prevent mobile browser URL/toolbars from obscuring bottom action controls.
  - *WebKit Flex Ellipsis*: Any flex child with `truncate` MUST specify `min-w-0` to prevent horizontal text overflow in Safari WebKit.
  - *Responsive Action Condensation*: In dense list rows on mobile (< sm / 360px), secondary action buttons MUST collapse to icon-only (`min-h-[44px] min-w-[44px]`, label `hidden sm:inline`) to prevent entity title clipping.
  - *Grid Action Symmetry*: Sibling buttons in CSS grid action footers MUST share `h-full min-h-[48px]` for uniform height and baseline alignment.
- **Visual Ground Truth Anchor**: Compare render outputs against commercial anchor (`media_1789200902293.jpg`). Checklists alone do not prove visual quality.
- **Rule "Kill The Premise" (2-Fix Limit)**: If a feature fails reference quality after 2 fix rounds, FORBID a 3rd micro-fix. Trigger Architectural Premise Challenge to replace flawed premise.
- **Single Cohesive World Invariant**: Entire game lifecycle belongs to ONE world: Outdoor Sunny Island Metropolis diorama. Zero dark isolated rooms.
- **Anti-Programmer-Art Primitive Ban**: Raw unlit geometric primitives (`boxGeometry`, `cylinderGeometry`) forbidden. Use outdoor sunlight, saturated palette, and beveled toy-like geometry.
- **Verification Screenshot Invariant**: Save all verification and UAT screenshots as `.jpg` (Quality 85-92).
- **Container Health & Timeout Safety**: Always use timeout flags (`curl -m 5 --connect-timeout 3`) and initial delay (`timeout /t 6 /nobreak >nul`) during health checks and container start periods.
- **Active Domain Memory & JIT Inspection (Zero-Bloat)**: Pre-flight lookup of `docs/domain/gotchas.md` is mandatory before modifying code in any domain (`[FSM]`, `[3D]`, `[UI]`, `[NET]`, `[BOT]`, `[UAT]`). To prevent context bloat, agents MUST ONLY read the Domain Index (lines 1-20) or use targeted `grep_search`. Reading the entire file via `view_file` is strictly forbidden. Every resolved defect must yield a numbered invariant in `docs/domain/gotchas.md` only AFTER Station 2.5 Scout multi-round physical verification (zero speculative gotchas).

## 2. DEFINITION OF DONE

A task is COMPLETE only when:
1. Automated tests pass Adversarial Inversion, include traceability tags (`[UC-XXX/MSS]` or `[UC-XXX/A#]`), and pass fixture contract tests against SSOT.
2. Code passes 6 Slop Red Flags audit (least new structure, complexity <= 5, visual token compliance, zero code golf). UI passes `npm run lint:ui` with 0 violations.
3. Reviewer gates approve via physical disk inspection (`spec-reviewer` verifies 100% spec reconciliation; `code-reviewer` verifies code quality/observability; `game-3d-visual-critic` verifies 3D visual gate; `ui-craft-reviewer` verifies 2D craft gate; implementer never approves own code; zero approvals without disk evidence).
4. Progress updated in `docs/epics/[epic]/_epic_ledger.md` (including Tech Debt Ledger).
5. Empirical domain learnings recorded in `docs/domain/gotchas.md` (distilled from multi-round Scout verification with 3 layers: initial illusion, scout finding, verified invariant).
6. Production resilience verified: defense against invalid intents, treasury conservation invariant, safe disconnection grace period, Turn N+1 state teardown, and explicit tombstone payload delivery.
7. Ad-hoc improvements documented in `docs/plans/improvements/` and `docs/reports/improvements/`, with roadmap update.

## 3. PROJECT NFR BASELINE (VTCOON 3D BOARD GAME)

- **Game Engine & FSM**: Server-authoritative state transitions only. Deterministic PRNG seeded per session. Turn action timeout <= 60s.
- **Rendering & UI**: Target 60 FPS on React Three Fiber (R3F). Zero heavy computations or large JSON parsing on main render thread.
- **Network & WebSocket**: State delta synchronization payload < 10KB per tick. Disconnection grace period 60s.
- **Code Quality**: TypeScript strict mode (`strict: true`, `noUncheckedIndexedAccess: true`). Zero manual null checks when compiler guarantees safety.

## 4. INDEXED MEMORY POINTERS

- Requirements & Rules: [`docs/requirements.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/requirements.md)
- Entity Model & 28 Title Deeds: [`docs/domain/entity_model.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/entity_model.md)
- Visual Design System & Tokens: [`docs/domain/design.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/design.md)
- Impeccable 2D Craft Skill: [`.agents/skills/impeccable/SKILL.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/SKILL.md)
- 2D Craft Reviewer: [`.agents/agents/ui-craft-reviewer.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/agents/ui-craft-reviewer.md)
- 3D Visual Critic: [`.agents/agents/game-3d-visual-critic.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/agents/game-3d-visual-critic.md)
- FSM Architecture Decision: [`docs/domain/adr/ADR-0001-fsm-architecture.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/adr/ADR-0001-fsm-architecture.md)
- 3D Rendering Architecture Decision: [`docs/domain/adr/ADR-0002-r3f-rendering.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/adr/ADR-0002-r3f-rendering.md)
- Architecture Decisions Ledger: `docs/domain/adr/`
- Active Epic Progress: `docs/epics/[epic]/_epic_ledger.md`
- Continuous Improvement Plans: `docs/plans/improvements/`
- Continuous Improvement Reports: `docs/reports/improvements/`
- Master Roadmap: [`docs/master_roadmap.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/master_roadmap.md)
- Domain Gotchas & Edge Cases: [`docs/domain/gotchas.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)
