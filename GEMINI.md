# AGENTS CONSTITUTION (PROJECT HARNESS)

> Target Market: Viet Nam. All user-facing documents and game artifacts must be in Vietnamese.

## 1. HARD CONSTRAINTS

- **Terminal Execution**: Use Windows Command Prompt (`cmd /c`) with `;` for command chaining.
- **File Modification Tooling**: ALWAYS use native `write_to_file` or `replace_file_content`. NEVER use shell commands (`echo`, `cat`, PowerShell here-strings, redirects `>`) to write code.
- **Source Control Safety**: AI NEVER executes `git commit` or `git push`. Only the human user controls git commands.
- **Atomic Edits**: Verify target chunk match count before editing.
- **Context Offloading**: Never dump raw verbose logs or large diffs into prompts. Summarize test outputs to <10 lines.
- **Visual Design Compliance**: Strictly follow `docs/domain/design.md`. Keep theme tokens lean.
- **Least New Structure (Anti-Slop)**: Add minimum structure. Zero single-use abstractions (YAGNI), zero speculative extensions.
- **Complexity Limits**:
  - Core Logic / FSM / Domain Services: <= 400 LOC (modular decomposition warning at 300 LOC).
  - UI Components: <= 500 LOC (extract custom hooks if component logic exceeds 50 lines).
  - Static Data / Config / Tables: <= 800 LOC.
  - Integration / E2E Living Tests: <= 600 LOC (unit tests <= 300 LOC).
  - Functions: Max 30 LOC, Cyclomatic Complexity <= 5.
  - Forbidden: Code golf, line stripping, fake no-op stubs. Files under 300 LOC must remain intact without premature helper splitting.
- **Slice Scope Confinement**: Implement only flows in current ticket. Register deferred alternative flows in Tech Debt Ledger with target slice.
- **Test State Isolation**: Zero order-dependent tests. Run test suites with `--randomize`. Reconcile 100% of static data with fixture contract tests.
- **Zero-Polling & Background Harness**: Never execute in-loop polling (`sleep`/`while`). Offload tasks > 10s to background. Terminate processes hanging > 60s.
- **SSOT & Player Intent Integrity**: All player business decisions (buy, upgrade, trade) must be explicit Intent/Action transitions (ADR-0001). Never execute player choices as implicit side-effects of movement.
- **Subagent Artifact Persistence (Dual Output Pattern)**: Authoring subagents write large artifacts directly to disk files (`docs/plans/`, `docs/reports/`) and return concise summaries (<20 lines) with clickable links. Read-only reviewers (`spec-reviewer`, `code-reviewer`, `game-3d-visual-critic`, `ui-craft-reviewer`) report structured packets directly into chat.
- **Lean Runtime Observability**: Zero silent error swallowing (empty `catch` forbidden). All domain transitions emit structured logs (`{ event, correlationId, timestamp, delta }`). Rejections must return explicit Reason Codes.
- **Vertical Slice Completeness**: State fields on `Player` or `PropertyState` must map to `DeltaPayload`. Zero bug-codification in test assertions. Every emitted event must have consumer test verifying state change.
- **3D Visual Quality Gate**: Review 3D visuals via independent subagent `game-3d-visual-critic` across 5 camera angles (`top_down`, `lobby_vip`, `deed_modal`, `dice_tray`, `hud_dock`). Zero score inflation. Benchmark strictly against commercial AAA titles (Monopoly Plus, Townscaper).
- **2D UI Craft Quality Gate**: UI changes must pass `npm run lint:ui` with 0 violations (4 anti-patterns: `border-accent-on-rounded`, `bounce-easing`, `gray-on-color`, `gradient-text`). Review via independent subagent `ui-craft-reviewer` with `ship` or `fix` disposition.
- **Visual Ground Truth Anchor**: Compare render outputs directly against reference commercial visual anchor (`media_1789200902293.jpg`). Pure technical checklists or subjective adjectives do not prove visual quality.
- **Rule "Kill The Premise" (2-Fix Limit)**: If a feature or screen fails to reach reference quality after 2 micro-fix rounds, FORBID third micro-fix. Trigger Architectural Premise Challenge to replace flawed premise.
- **Single Cohesive World Invariant**: Entire game lifecycle (Lobby, Gameplay, Auction) belongs to ONE cohesive world: Outdoor Sunny Island Metropolis diorama (sunlit plaza, turquoise sea, golden sand, stylized toy city). Zero dark isolated rooms.
- **Anti-Programmer-Art Primitive Ban**: FORBID raw unlit geometric primitives (`boxGeometry`, `cylinderGeometry`) in dark space. Use outdoor sunlight, stylized saturated palette, and toy-like beveled diorama geometry.
- **Verification Screenshot Invariant**: All UAT and verification screenshots must be saved as `.jpg` (JPEG Quality 85–92).
- **Continuous Improvement Persistence**: All ad-hoc fixes, systemic refactors, bot upgrades, or VFX juice must have plan in `docs/plans/improvements/IMP-[ID]-[slug]_plan.md` and report in `docs/reports/improvements/IMP-[ID]-[slug]_report.md`, updating ADRs and `docs/master_roadmap.md`.

## 2. DEFINITION OF DONE

A task is COMPLETE only when:
1. Automated tests pass Adversarial Inversion (deliberate failure verification), include traceability tags (`[UC-XXX/MSS]` or `[UC-XXX/A#]`), and pass fixture contract tests against SSOT.
2. Code passes 6 Slop Red Flags audit (least new structure, complexity <= 5, visual token compliance, zero code golf). UI passes `npm run lint:ui` with 0 violations.
3. Reviewer gates approve (`spec-reviewer` verifies 100% spec reconciliation; `code-reviewer` verifies code quality and observability; `game-3d-visual-critic` verifies 3D visual gate; `ui-craft-reviewer` verifies 2D craft gate).
4. Progress updated in `docs/epics/[epic]/_epic_ledger.md` (including Tech Debt Ledger).
5. Domain learnings recorded in `docs/domain/gotchas.md`.
6. Production resilience verified: defense against invalid intents, treasury conservation invariant, safe disconnection grace period.
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
