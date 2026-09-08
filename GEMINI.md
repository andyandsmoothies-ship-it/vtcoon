# AGENTS CONSTITUTION (PROJECT HARNESS)
Any documents, artifacts of this project must be in Vietnamese. This project is for Viet Nam market.
## 1. HARD CONSTRAINTS
- **Terminal Execution**: Use Windows Command Prompt (`cmd /c`) with `;` for command chaining.
- **Source Control Safety**: AI NEVER executes `git commit` or `git push`. Only the human user controls git commands.
- **Atomic Edits**: Before multi-file overwrite, verify target chunk match count to prevent incomplete edits.
- **Context Offloading**: Never dump raw verbose logs or large diffs into prompts. Run local scripts to summarize results to <10 lines.
- **Visual UI/UX Governance**: Strictly follow `docs/domain/design.md`. Prompts contain only lean token schemas (<40 lines). Heavy theme styles reside in the local environment.
- **Least New Structure (Anti-Slop)**: Add the minimum new structure to meet requirements. Zero single-use abstractions (YAGNI), zero speculative extensions, zero redundant dependencies.
- **Complexity Limits**: Maximum 400 lines per file, 30 lines per function. Cyclomatic Complexity <= 5.
- **Slice Scope Confinement**: Implement only the flows defined in the current ticket (Slice 1 implements Main Success Scenario only). Never write future alternative flows prematurely.
- **Test State Isolation**: Zero order-dependent tests. Run test suites with `--randomize`. Isolate test state and use concrete literal test data.
- **Zero-Polling & Background Harness**: Never execute in-loop polling (`sleep`/`while`). Offload long tasks (>10s) to background processes. Terminate processes hanging over 60s without output.
- **SSOT & Player Intent Integrity**: All player business decisions (buy property, upgrade, trade) must be explicit Intent/Action transitions per ADR-0001. Never execute player choices as implicit side-effects of pawn movement.
- **Subagent Artifact Persistence (Dual Output Pattern)**: Authoring subagents (planners, slicers) creating large artifacts (`docs/plans/`, `issues/`) MUST write directly to disk files using `write_to_file` in `Workspace: "inherit"` and return only a concise summary (<20 lines) with clickable file links. Read-only reviewers (`spec-reviewer`, `code-reviewer`) remain strictly read-only and report 1-page structured packets directly into chat.
- **Lean Runtime Observability**: Zero silent error swallowing (empty `catch` forbidden). All domain state transitions (FSM, transactions) must emit structured logs (`{ event, correlationId, timestamp, delta }`). Rejection of player actions must return an explicit Reason Code.

## 2. DEFINITION OF DONE
A task is COMPLETE only when:
1. Automated tests pass Adversarial Inversion (deliberate failure verification) and carry traceability tags (`[UC-XXX/MSS]` or `[UC-XXX/A#]`).
2. Code passes 6 Slop Red Flags audit (least new structure, cyclomatic complexity <= 5, visual tokens compliance).
3. Reviewer gates approve (`spec-reviewer` approves 100% spec coverage; `code-reviewer` approves code quality, architecture boundaries, and Lean Observability).
4. Progress is updated in `docs/epics/[epic]/_epic_ledger.md` and user commits changes to git.

## 3. PROJECT NFR BASELINE (VTCOON 3D BOARD GAME)
- **Game Engine & FSM**: Server-authoritative state transitions only. Deterministic PRNG seeded per game session. Turn action timeout <= 60s.
- **Rendering & UI**: 60 FPS target on React Three Fiber (R3F). Zero heavy computations or large JSON parsing on the main render thread.
- **Network / WebSocket**: State synchronization payload < 10KB per delta tick. Disconnection grace period 60s.
- **Code Quality**: TypeScript strict mode enabled (`strict: true`, `noUncheckedIndexedAccess: true`). Zero unnecessary manual null checks when the compiler guarantees safety.

## 4. INDEXED MEMORY POINTERS
When deep domain context is required, read the following index files:
- Project Requirements & Rules: [`docs/requirements.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/requirements.md)
- Entity Model & 28 Title Deeds: [`docs/domain/entity_model.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/domain/entity_model.md)
- Visual Design System & Tokens: [`docs/domain/design.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/domain/design.md)
- FSM Architecture Decision: [`docs/domain/adr/ADR-0001-fsm-architecture.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/domain/adr/ADR-0001-fsm-architecture.md)
- 3D Rendering Architecture Decision: [`docs/domain/adr/ADR-0002-r3f-rendering.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/domain/adr/ADR-0002-r3f-rendering.md)
- Active Epic Progress: `docs/epics/[epic]/_epic_ledger.md`
