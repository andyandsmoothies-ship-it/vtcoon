# PILLAR VIII: DEEP MODULE ARCHITECTURE & AGGREGATE ROOT

> **Scope**: `src/server/domain/game_room_session.ts`, `src/server/room_manager.ts`, `src/client/`

---

1. **Full Collection Protocol Parity (Proxy/Adapter Completeness)**: When implementing a Proxy or Adapter to wrap standard collections (`Map`, `Set`, `Array`), MUST implement 100% of collection protocol methods (`[Symbol.iterator]`, `entries()`, `keys()`, `values()`, `size`, `forEach()`, `clear()`, `get()`, `set()`, `has()`, `delete()`). Distinguish required field semantics (`size = sessions.size`, `has` returning `true` for falsy values like `false` or `0`) from optional fields (`size` counting `val !== undefined`). Implementing partial proxies that trap only 3–4 methods is forbidden, as it silently breaks `for...of` iteration and `.size` queries.
2. **Ban Pseudo-Proxies on Scalar Primitives**: Creating `Proxy` instances wrapping primitive values (boolean, number, string) inside local functions is strictly forbidden. Use standard primitives or 1-entry local maps (`new Map([[key, value]])`) with reverse synchronization upon function return.
3. **Getter Allocation Churn Prohibition**: Passing dynamic getters that instantiate fresh Proxy objects on every access (e.g. `this.auctions`) into cyclic coordination routines is forbidden. Pass target state or callbacks directly to avoid continuous garbage collection allocation.
4. **EndTurn Direct Session Dispatch & WaitingRoll Guard Invariant [IMP-210]**: In aggregate root `GameRoomSession`, turn dispatch `doHandleEndTurnSession(session, ...)` receives the session directly and forwards cleanly to `executeTurnEnd` via local single-entry maps. At facade layer `RoomManager.handleEndTurn`, the system MUST verify the roll prerequisite (`!session.rolledThisTurn && session.room.phase === TurnPhase.WaitingRoll && (current.auditTurnsLeft ?? 0) <= 0`) prior to dispatch, preventing turn-skip exploits.
5. **Anti-Shallow Slicing & Seam Discipline (Zero Disconnected Slices & pureLogicWaiver Locks)**:
   - *Horizontal Slicing Trap*: When domain core changes alter business values or contracts (e.g. doubled rent, new upgrade criteria), editing domain core while deferring UI updates to "future tickets" is forbidden. This leads to user-facing inconsistencies where players are debited 500k while UI displays 200k.
   - *Feature-Gated Inactive Seam*: If UI synchronization cannot land in the same ticket, new core logic must remain behind a feature gate or inactive seam until the presentation slice lands.
   - *Zero pureLogicWaiver Abuse*: If domain changes alter return values or contracts of functions consumed directly or indirectly by UI/Affordance layers, granting `pureLogicWaiver: true` is STRICTLY FORBIDDEN. A companion contract test or paired UI ticket is mandatory.

6. **Anti-Shallow UI Refactoring & Props Explosion Invariant [IMP-343]**:
   - *False Motivation*: Distinguish hard constitutional limits (`Tier 2 UI <= 500 LOC`) from soft warnings (`warn: 400 LOC`). Fragmenting components solely to suppress soft warnings without clear domain motivation is prohibited (Refactoring Mania).
   - *Forbidden Shallow Sub-components*: FORBIDDEN decomposing React components by moving JSX chunks into shallow sub-components with wide interfaces ($\ge 4$ props) that merely wrap HTML/CSS tags (Shallow Module: wide interface, shallow depth, fragmented cognitive locality).
   - *Deep Data Derivation First*: When a UI component is lengthy due to data derivation, sanitization, and presentation logic, inspect companion modules (`*_visuals.ts`, `*_helpers.ts`) to consolidate data derivation into a pure function returning a complete ViewModel/DisplayData structure. Retain 100% of the JSX DOM tree without creating shallow components or fragmenting keyboard accessibility (A11y/Tablist). Test pure functions independently via adversarial TDD in milliseconds.

7. **Harness & Toolchain Modularization Invariant (Facade Re-export Pattern) [IMP-348-352]**:
   - *Facade Re-export Pattern*: When SDLC automation scripts in `scripts/` exceed maintainable size limits, MUST apply the Facade Re-export Pattern:
     - Root entrypoints in `scripts/<tool>.mjs` remain thin orchestrator facades (target $\le 200$ LOC), preserving 100% of CLI flags, exit codes, and traditional export symbols for tests and prefilters.
     - Specialized logic decomposes into Deep Modules ($\le 400$ LOC) located in dedicated subdirectories:
       - `scripts/report/`: Metric collection, 4-station evidence extraction, and markdown report synthesis (`report_git_inspector.mjs`, `report_station_collector.mjs`, `report_markdown_renderer.mjs`).
       - `scripts/slop_linter/`: AST rule definitions, text matching, and violation reporting (`slop_constants.mjs`, `slop_text_rules.mjs`, `slop_ast_rules.mjs`, `slop_reporter.mjs`).
       - `scripts/visual_capture/`: Preview server lifecycle, browser CDP client, and scenario injection (`preview_server_manager.mjs`, `cdp_browser_client.mjs`, `scenario_evaluator.mjs`).
       - `scripts/plan_audit/`: Markdown plan parser, drop-in replacement snippet verifier, auto-signer, and rule validators (`plan_markdown_parser.mjs`, `plan_snippet_verifier.mjs`, `plan_auto_signer.mjs`, `rules_*.mjs`).
       - `scripts/sentinel/`: Probe configuration loader, AST mutant injection, and atomic backup restore (`probe_config_loader.mjs`, `source_mutant_injector.mjs`).
       - `scripts/evidence_audit/`: Evidence resolution, test execution audit, mutation & wiring parity, visual & telemetry bounds, review persistence and SSOT acceptance report (`evidence_resolver.mjs`, `audit_test_execution.mjs`, `audit_mutation_and_wiring.mjs`, `audit_visual_and_telemetry.mjs`, `audit_reports_and_ssot.mjs`).
   - *Future Implementations Guard*: All future rules, AST checks, or telemetry extractors MUST be implemented in the corresponding subdirectories above, NEVER bloated back into root facade files `scripts/*.mjs`.

8. **Fault-Domain Bulkheading & Active Self-Healing Invariant [IMP-376]**:
   - *Fault-Domain Bulkheading*: Peripheral subsystems (3D canvas, WebGL shaders, audio managers, particle effects, analytics) MUST be isolated via robust error boundaries or non-throwing wrappers. A rendering or audio failure must never crash core match state or block gameplay progression.
   - *Active Self-Healing over Passive Telemetry*: Watchdogs and health-check loops must not merely log warnings (`console.warn`, telemetry). They MUST trigger deterministic recovery actions (force-clearing stuck locks, falling back to 2D view, degrading frameloop gracefully, or restoring degraded state).

9. **Deep Modules, Seam Discipline & The Deletion Test [IMP-389]**:
   - *Deep Module Primacy*: Per John Ousterhout, a deep module provides powerful functionality behind a simple, cohesive interface. The number of consumers alone does NOT measure module depth: a module with 1 consumer (e.g. 3D kinematic solver, peninsula terrain generator, or complex trade evaluation) is an exemplary deep module if it encapsulates significant mathematical/business complexity behind pure, deterministic functions.
   - *Test Seams as Legitimate Consumers*: Per Michael Feathers, extracting pure calculation/view-model logic into a companion file (`*_visuals.ts`, `*_math.ts`) to enable isolated, deterministic Station 1 TDD without WebGL/DOM mocking creates a valid architectural seam. The test suite is the legitimate 2nd consumer justifying the seam's boundary.
   - *Mechanical Slop Guards*:
     - `zero-micro-splintering`: FORBIDDEN creating micro-files (< 30 LOC) solely to evade LOC budgets. Whitelist: pure types (`types.ts`, `*_types.ts`), constants (`*_constants.ts`), barrel re-exports (`card_handlers.ts`), and UI micro-components.
     - `zero-passthrough-proxies`: FORBIDDEN 1-line exact middle-man functions that delegate without transformation or validation. Whitelist: default parameter wrappers and public API boundary facades.


