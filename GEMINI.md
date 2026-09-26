# AGENTS CONSTITUTION (PROJECT HARNESS)

> Precedence: This project harness specializes Global AG OS Rules. Project rules strictly override global rules in case of conflict.
> Target Market: Viet Nam. All user-facing documents and game artifacts must be in Vietnamese.

## 1. HARD CONSTRAINTS

- **Visual Design Compliance**: Follow `docs/domain/design.md`. Keep theme tokens lean.
- **Anti-Slop & Deep Modules (Enforced by lint:slop)**:
  - Minimum structure: Deep modules only (simple interfaces hiding complex logic). Zero single-use abstractions, zero speculative extensions, zero shallow pass-through wrappers.
  - TIER 1 (Domain Logic / FSM / Server): Max 400 LOC (modular warning at 300 LOC, hard error at 550 LOC).
  - TIER 2 (UI Components / 3D Canvas / Views): Max 500 LOC (extract hooks if logic exceeds 50 LOC; warning at 400 LOC).
  - TIER 3 (Static Data / Config / Board Tables): Max 800 LOC (e.g. `tile_icons.ts`, `property_manager_data.ts`, `board_config.ts`; warning at 650 LOC).
  - Living / Integration Tests: Max 600 LOC (isolated unit tests <= 300 LOC; tolerance <= 650 LOC for suites >= 16 atomic tests).
  - Functions: Max 30 LOC, Cyclomatic Complexity <= 5 (logic warns at 50 SLOC, fails at 80 SLOC; declarative JSX/textures exempt).
  - Pre-Coding Delta LOC: Any target file >= 300 LOC MUST include `[Current + Delta = Expected]` calculation. The `Current` baseline MUST be physically measured against disk lines via tool immediately before drafting (never rely on recalled or stale numbers). If Tier 1 `Expected > 400` or Tier 2 `Expected > 480`, Task 1 MUST extract submodules before adding features. Declarative Tailwind JSX layouts are exempt from premature extraction if custom hooks logic <= 50 LOC.
  - Plan Budget SSOT Alignment: All slice-specific LOC ceilings declared in task plans and contract test assertions MUST strictly match (zero divergence between plan tables and test limits).
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
    - *UI & Logic Decoupling (Anti-Overengineering)*: Pure visual/CSS/layout tweaks (padding, sizing, offsets, responsive display, tab affordance) MUST NEVER be bundled with timing delays, network dispatchers, or store mutations. When receiving UI feedback, ALWAYS separate CSS/layout into Tier 1 Fast-Track (< 2 mins, 0 subagents). Only spin up Tier 2 for core FSM/network logic. Proactively suggest this split to the user instead of creating monolithic tickets.
    1. Station 1 (RED Contract Test): `qa-tester` writes edge/contract tests in `tests/**` and proves failure (Adversarial Inversion). FORBIDDEN from editing `src/**`. Atomic Test Mandate (1-4 asserts/test, zero loops in `it()`). BANNED: static checklist tests (`fs.existsSync`, `fs.readFileSync`, `typeof fn`, or testing `lintContent` / file LOC inside `it()`). Universal 5-Facet Matrix (Boundary, Reactivity, Disposal, Error Defense, Cross-Coupling Blast Radius). Floor: >= 15 atomic tests / feature slice.
    2. Station 2 (GREEN Implementation): `implementer` writes minimum code in `src/**` to pass tests. FORBIDDEN from relaxing assertions (Zero Bug-Codification).
    2.5. Station 2.5 (Sweeping Scout Audit): After tests pass and before Station 3 review, Agent invokes `scout` to sweep all modified physical files for stale snapshots, unhandled async, leaked listeners, secret hacks, and dead-end UI states. All findings must be resolved before Station 3 sign-off.
    3. Station 3 (Independent Review & Disk Verification): Read-only reviewers (`spec-reviewer`, `code-reviewer`, `game-3d-visual-critic`, `ui-craft-reviewer`) audit independently. Mechanical defects (formatting, linting, imports) must be directly patched rather than left as passive comments. Reject monolithic or static checklist tests. Implementer never approves own code. Reviewers MUST inspect physical disk files (`view_file`, `list_dir`), verify report LOC matches physical disk, and check `.agents/evidence/` snapshot (`executed: true`, `contractTestsPassed: true`) before signing off. All test claims in reports/chat MUST cite full physical file paths and executable shell commands.
- **Zero-Trust Plan Grilling & Dual Output**: Plans are flawed by default. Before user approval, invoke `plan-griller` (model: inherit) to audit physical disk code across 5 pillars (Data Origin-to-Sink Lifecycle, Layout Budget, Actor Inversion, Transient Teardown, 3-Way Blast Radius). Griller MUST verify physical LOC baselines, mandate exact drop-in snippets for 100% touched files (ban vague directives), and flag static checklist test infiltration. `plan-griller` MUST write detailed audit to `.agents/audit/PLAN_AUDIT_[TICKET].md` and return a concise summary table (<20 lines) in chat. Main agent verifies findings against physical files before updating `implementation_plan.md`. Zero blind compliance.
- **Automated Evidence Snapshot**: Quantitative evidence snapshot (`.agents/evidence/`) must be recorded with `executed: true` before Station 3 sign-off. Triggered automatically by Station 2, `npm run evidence`, or `npm run gate`.
- **Test Tiering & UAT Execution Boundary**: Fast in-memory tests (`npm test`) must complete in <= 5s. Heavy Turn-by-Turn UAT (`npm run test:uat`, 100 turns) runs ONLY for core changes in `src/domain/`, `src/server/`, or pre-release UAT. STRICTLY FORBIDDEN during UI-only, CSS, 3D assets, or docs edits.
- **E2E Artifact Requirement**: Complex feature tests must produce verifiable artifacts (snapshots, logs, or screenshots).
- **Adversarial Test Scenarios**: Ban happy-path testing. Test medium/hard scenarios (multi-agent competition, debt, disconnects).
- **SSOT & Player Intent Integrity**: Player decisions (buy, upgrade, trade) must be explicit Intent transitions (ADR-0001). Never execute player choices as implicit movement side-effects.
- **Transient State & Turn N+1 Teardown Invariant**: Ephemeral states (auctions, trades, prompts) MUST be purged on turn transitions (`handleRollDice`/`handleEndTurn`). Leaking stale state into Turn N+1 is strictly forbidden.
- **Single Source of Truth & Zero Parallel Flag Invariant**: State mechanisms (dismiss, timers, session locks) MUST converge on ONE authoritative store/source. Introducing a new Store property while leaving obsolete module-level closures, refs, or local variables running parallel in network/service layers (e.g. `lastDismissedAuctionKey`) is strictly forbidden. Migration must be 100% subtractive.
- **Authoritative Resync on Client Ephemeral Timers**: Any client-side countdown or interval timer MUST explicitly bind an authoritative resync hook/effect to server delta fields (e.g. `auction.timeRemaining`), preventing client clock drift after network jitter, backgrounding, or full-sync reconnection.
- **Explicit Tombstone Protocol (`null` vs `undefined` & Array Tombstones)**: Cleared delta payload fields MUST explicitly serialize as `null` (never `undefined`). Dynamic collections (`hand`, `modifiers`, `mortgaged`) MUST serialize empty arrays `[]` when cleared and compare elements in `isPlayerEqual` to prevent client retention of stale items.
- **Timer Domain Isolation & Pure Domain Core**: Domain services (`RoomManager`, FSM) must remain pure synchronous (zero `setTimeout`). All timers belong to Orchestrators and must use identity-keyed maps to prevent accidental cancellation during room resets.
- **Interactive Zombie UI Prohibition**: Terminal modal states (`isConcluded: true`) must disable action controls immediately and emit zero server intents on dismiss. Client stores must never reopen dismissed terminal dialogs.
- **Bankrupt Entity Absolute Isolation**: Any domain service, card handler, or calculation iterating over `Player[]` MUST filter active ones (`!p.bankrupt`). Bankrupt players: 0 income, 0 expenses, 0 repositioning, 0 pool inclusion, 0 buyout eligibility. Solitary penalties (`opponents.length === 0`) must route to Treasury.
- **Subagent Artifact Persistence (Dual Output Pattern)**: Subagents write large artifacts to disk (`docs/plans/`, `docs/reports/`) and return concise chat summaries (<20 lines) with clickable links.
- **Vertical Slice Completeness & Full-Pipe Serialization**: When adding state fields or events, 100% of 5 physical pipeline stations MUST be updated: (1) Origin Entity/FSM, (2) DTO & Mappers (`PlayerDelta`, `DeltaPayload`, `buildDeltaFromRoom`, `DeltaPayloadOptions`), (3) Broadcaster (`isPlayerEqual`/`isCellEqual` sparse diff & `buildSparseDelta` whitelist), (4) Client Parser (`OPTIONAL_KEYS`, `OPTIONAL_PLAYER_KEYS`), (5) Client Store & UI. Every emitted event must have consumer tests verifying state across all 5 stations.
- **Phase-Driven Action State Reset**: Client action availability flags (`hasRolledThisTurn`, `isActing`) MUST reset on `turnPhase` transitions (e.g., `WaitingRoll` resets `hasRolledThisTurn = false`), NEVER solely reliant on `currentPlayerId` changes to prevent extra-turn deadlocks.
- **Insolvent Entity Role Guard**: Entities with `balance < 0` are strictly forbidden from acting as `buyer` in property trades or asset swaps (`price <= 0`). Insolvent entities may only act as `seller` with positive cash inflow (`price > 0`) to resolve passive debt.
- **Two-Sided Fund Flow Trace**: When accounting for or tracking fund flows (mortgage, unmortgage, M&A, trades), strictly distinguish internal transfers (Player <-> Treasury) from systemic circulation inflows/outflows. In unmortgage operations, net systemic circulating delta is `-loan` (bank credit repayment); the 10% unmortgage fee is an internal transfer to Treasury, not systemic leakage.
- **Pre-Consumption Valuation Invariant**: When an action or card modifies financial transactions (e.g., `CC_DIPLOMATIC` waiving rent), calculate base and potential values (`potentialRent = calculateRent(...)`) BEFORE consuming the item or applying zero-fee overrides.
- **Multi-Agent Harassment Guard**: In P2P trades, auctions, or AI prompts targeting players, cooldowns must be enforced at Target/Room scope (`room.lastTargetTradeOfferRound`), not just Actor scope, preventing N bots from spamming a single player in one round.
- **Asynchronous Stream Contract & Event Isolation**: In event-driven/WebSocket systems, tests MUST filter events by type (`waitForMessageType`) or assert full event sequences. NEVER assert positional indices (`messages[0]`) on multi-event lifecycle transitions. Production code MUST NOT suppress valid upstream domain events solely to satisfy naive single-message test listeners.
- **Zero-Blank-Material Invariant**: Plain untextured `<meshBasicMaterial />` or `<meshStandardMaterial />` on badges, flagpoles, signs, or paintings without real texture (`map`) is forbidden. Hidden DOM attributes (`data-*`) cannot bypass WebGL rendering verification.
- **2D UI Craft Quality Gate**: UI changes must pass `npm run lint:ui` with 0 violations (4 anti-patterns: `border-accent-on-rounded`, `bounce-easing`, `gray-on-color`, `gradient-text`). Audit via `ui-craft-reviewer`.
- **Tailwind Cascade & Unlayered CSS Reset Prohibition**: All global CSS resets MUST reside strictly inside `@layer base`. Unlayered CSS rules (such as `* { padding: 0; }` outside layers) that annihilate `@layer utilities` are strictly forbidden. UI layout regressions must be verified via physical DOM bounding boxes (CDP) on real mobile viewports, never solely reliant on JSDOM class string assertions.
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
- **Visual Target Spot-Inspection Invariant**: Save verification screenshots as `.jpg` (Quality 85-92). After any UI change, agent/reviewer MUST call `view_file` on the target image to inspect the exact requested coordinates/element (no text clipping, no border collision, no neighbor occlusion) before claiming completion. JSDOM/test string pass without visual inspection is strictly forbidden.
- **Container Health & Timeout Safety**: Always use timeout flags (`curl -m 5 --connect-timeout 3`) and initial delay (`timeout /t 6 /nobreak >nul`) during health checks and container start periods.
- **Active Domain Memory & JIT Inspection (Zero-Bloat)**: Pre-flight lookup of `docs/domain/gotchas.md` is mandatory before modifying code in any domain (`[FSM]`, `[3D]`, `[UI]`, `[NET]`, `[BOT]`, `[UAT]`). To prevent context bloat, agents MUST ONLY read the Domain Index (lines 1-20) or use targeted `grep_search`. Reading the entire file via `view_file` is strictly forbidden. Every resolved defect must yield a numbered invariant in `docs/domain/gotchas.md` only AFTER Station 2.5 Scout multi-round physical verification (zero speculative gotchas).
- **Retro Inoculation Invariant**: Every defect reported during human review MUST be codified into an automated contract test (`tests/contracts/`) or linter rule (`scripts/lint_*.mjs`) before ticket completion. Zero standalone code fixes without automated regression shields.
- **Strict Domain Enum & Zero Magic String Guard**: Forbid raw `string` for FSM/lifecycle states (`turnPhase`, `activeModal`), event types, or cell classifications across entities, DTOs, stores, and component props. All conditional branches and guards must compare against authoritative Domain Enums (`TurnPhase`, `CellType`), never raw string literals.
- **Transient UI Opt-In Visibility Invariant**: Ephemeral feedback components (badges, chips, toasts, tickers, prompt overlays) MUST default visibility/activation props to `false` (opt-in), never `true` (opt-out). Omitting a prop must default to hidden/inactive state to prevent ghost rendering on initial load or Turn N+1 reset.
- **Runtime Value Import Integrity**: Enums or objects evaluated as runtime values (in initial store states, default props, or constant maps) must use value imports (`import { Enum }`), never `import type`, preventing `ReferenceError` during Node.js/SSR runtime execution.

## 2. DEFINITION OF DONE

A task is COMPLETE only when:
1. Automated tests pass Adversarial Inversion, include traceability tags (`[UC-XXX/MSS]` or `[UC-XXX/A#]`), and pass fixture contract tests against SSOT.
2. Code passes 6 Slop Red Flags audit (least new structure, complexity <= 5, visual token compliance, zero code golf). UI passes `npm run lint:ui` with 0 violations.
3. Reviewer gates approve via physical disk inspection (`spec-reviewer` verifies 100% spec reconciliation; `code-reviewer` verifies code quality/observability; `game-3d-visual-critic` verifies 3D visual gate; `ui-craft-reviewer` verifies 2D craft gate via screenshot `view_file`; implementer never approves own code; zero approvals without disk evidence).
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
