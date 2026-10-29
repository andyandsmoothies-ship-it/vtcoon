# CORE PRINCIPLES SPECIFICATION (THE 25 INVARIANTS)

> **Authority**: Single Source of Truth (SSOT) reference for the Core Principles Index cited in [`GEMINI.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/GEMINI.md#L57).  
> **Purpose**: Eliminates ambiguous terminology across Plans, Adversarial Challenges, QA Specifications, and Code Reviews. Every entry in `Principles Applied` MUST link directly to its corresponding invariant below.  
> **Precedence**: Invariant constraints define failure criteria for Station 1 Plans, Station 2 Contract Tests, and Station 3 Code Reviews.

---

## 1. View-Model Seam Extraction
- **Origin**: Hexagonal Architecture / Separated Presentation Pattern.
- **Trap Killed**: Mixing mathematical calculation, business state transitions, and DOM/WebGL/Canvas rendering within raw UI components, making components untestable without heavy, brittle UI mocks.
- **Core Invariant**: Raw UI/rendering files MUST NOT execute complex calculations or state derivations. Pure calculations and state mapping MUST be extracted into twin helper files (`*_visuals.ts` or `*_helpers.ts`). Contract tests verify pure View-Model functions without DOM/Canvas mocking.
- **Do vs Don't**:
  - ❌ *Don't*: Inside `Tile3D.tsx`, calculate mortgage equity, player rent discount multipliers, and format currency directly before feeding Three.js materials.
  - ✅ *Do*: Extract `calculateTileVisualModel(tile, player)` in `tile_visuals.ts`. Test `calculateTileVisualModel` in pure Node in 1ms; `Tile3D.tsx` only passes the returned DTO to render props.

---

## 2. Equivalence-Partition Testing
- **Origin**: Boundary Value Analysis & Black-Box Testing (Glenford Myers).
- **Trap Killed**: Authoring dozens of redundant tests for the same logic branch (test suite bloat) while missing distinct behavioral boundaries.
- **Core Invariant**: Contract test suites MUST partition the input space into distinct equivalence classes (e.g. Valid Normal, Boundary Min, Boundary Max, Invalid/Rejected, State Conflict). Exactly 1 atomic test covers 1 distinct facet. Redundant tests asserting the same equivalence partition are forbidden.
- **Do vs Don't**:
  - ❌ *Don't*: Write 10 unit tests for `withdraw(amount)` testing amounts `50`, `60`, `70`, `80` with the same player state.
  - ✅ *Do*: Write 4 partition tests: `withdraw(validPositive)`, `withdraw(exactBalanceBoundary)`, `withdraw(zeroOrNegativeRejected)`, `withdraw(insufficientFundsRejected)`.

---

## 3. Relational Multi-Point Assertion
- **Origin**: Property-Based & Metamorphic Testing (Alhazen / Anti-Cheating Invariant).
- **Trap Killed**: AI agents writing tautological tests that pass by returning hardcoded constants ($f(x) \equiv 42$) or echoing intermediate mocks.
- **Core Invariant**: Pure calculation tests MUST assert relational covariance across $\ge 2$ distinct inputs ($f(x_1) \neq f(x_2)$ and $x_1 > x_2 \implies f(x_1) > f(x_2)$). A single-point equality test (`expect(f(1)).toBe(2)`) is forbidden for non-trivial calculation algorithms.
- **Do vs Don't**:
  - ❌ *Don't*: `expect(calculateDynamicRent(tileLevel1)).toBe(100)` alone.
  - ✅ *Do*: `expect(calculateDynamicRent(tileLevel2)).toBeGreaterThan(calculateDynamicRent(tileLevel1))` and verify multiplier scaling across at least 3 distinct configurations.

---

## 4. Ephemeral TTL / Dead Man's Switch
- **Origin**: Distributed Systems Lease Pattern & Fault-Tolerant Watchdogs.
- **Trap Killed**: Trusting that external paired events (`pointerdown`/`pointerup`, `dragstart`/`dragend`, `modal_open`/`modal_close`) complete unconditionally. Lost events cause permanent UI deadlocks, unclickable screens, or frozen states.
- **Core Invariant**: Ephemeral flags, active gesture locks, and interaction blockers MUST implement an authoritative Dead Man's Switch timeout (TTL 3s–5s). If the terminating event is lost, the watchdog self-heals by forcibly releasing the lock and cleaning up active listeners.
- **Do vs Don't**:
  - ❌ *Don't*: Set `isDragging = true` on `pointerdown` and rely solely on `pointerup` to set `isDragging = false`.
  - ✅ *Do*: Set a TTL watchdog timer alongside `pointerdown`. If no update occurs within 3000ms, trigger automatic gesture reset.

---

## 5. 100% DTO & Call-Site Wiring
- **Origin**: Anti-TIDD (Anti-Test-Induced-Damage-Design) & Dead Code Elimination.
- **Trap Killed**: Introducing speculative fields, props, or methods into DTOs or public classes solely to satisfy unit test assertions without an active production consumer.
- **Core Invariant**: Every property declared in a newly introduced DTO, View-Model, or public interface MUST be actively consumed at a physical production call-site outside `tests/**`. Dead properties created only for test harnesses trigger an immediate audit violation.
- **Do vs Don't**:
  - ❌ *Don't*: Add `debugRawPayload?: unknown` or `forTestingOnly?: boolean` to `PlayerDTO`.
  - ✅ *Do*: Keep DTOs strictly aligned with active client/server consumption contracts. Every field has $\ge 1$ production consumer.

---

## 6. Poka-Yoke Domain Affordance
- **Origin**: Shigeo Shingo (Toyota Production System / Mistake-Proofing).
- **Trap Killed**: UI presentation layers recalculating domain conditions independently (e.g. button `disabled` checking `wallet >= cost`), creating state desynchronization and illegal intent dispatches.
- **Core Invariant**: UI enabled/disabled states, action availability, and displayed prices MUST derive directly from authoritative Domain Validators (`canDo`, `evaluation { canDo, cost, blockedReason }`). Presentation components are strictly forbidden from executing independent financial or rule calculations.
- **Do vs Don't**:
  - ❌ *Don't*: Inside `ActionButton.tsx`: `disabled={player.cash < property.price || player.inJail}`.
  - ✅ *Do*: `const affordance = evaluatePropertyPurchase(state, playerId, propertyId); disabled={!affordance.canDo}; tooltip={affordance.blockedReason}`.

---

## 7. Spatial AABB / Non-Occlusion
- **Origin**: Computational Geometry & 3D Frustum Culling.
- **Trap Killed**: Placing 3D meshes, floating labels, or HUD overlays outside the camera viewport, or having sibling 3D objects collide and penetrate each other.
- **Core Invariant**: All 3D and spatial screen coordinates MUST be verified against the active camera frustum ($|NDC| < 1.0$), sibling Axis-Aligned Bounding Boxes (AABB), and stepped volume occlusion rules ($W_{\text{lower}} > W_{\text{upper}}$).
- **Do vs Don't**:
  - ❌ *Don't*: Spawn landmark 3D buildings using arbitrary coordinates that overlap neighbor tile footprints or clip into camera near planes.
  - ✅ *Do*: Assert bounding box extents `[min, max]` remain strictly within tile perimeter constraints and pass camera raycasting non-occlusion checks.

---

## 8. Resource Disposal & Cache Hygiene
- **Origin**: Systems Programming & Memory Leak Prevention.
- **Trap Killed**: Unmounting UI components or destroying 3D scenes without disposing of WebGL buffers, textures, audio nodes, and event listeners, causing severe GPU VRAM and Node heap memory leaks.
- **Core Invariant**: Any component allocating external handles (Three.js geometries, textures, render targets, Web Workers, audio buffers, or interval timers) MUST provide explicit, idempotent disposal hooks on unmount/teardown.
- **Do vs Don't**:
  - ❌ *Don't*: Let a Three.js material or texture instance fall out of scope when switching scenes.
  - ✅ *Do*: Call `geometry.dispose()`, `material.dispose()`, `texture.dispose()`, and remove all socket/window listeners in `useEffect` cleanup.

---

## 9. Platform DI Isolation
- **Origin**: Ports & Adapters (Hexagonal) / Inversion of Control.
- **Trap Killed**: Leaf components importing global device/browser sniffers directly (`navigator.userAgent`, `window.innerWidth`), preventing deterministic automated unit testing and SSR.
- **Core Invariant**: Leaf and child rendering components are FORBIDDEN from importing global device sniffers or hardware detectors. Device tiers, touch capabilities, and platform flags MUST be injected deterministically via top-level props or central Context.
- **Do vs Don't**:
  - ❌ *Don't*: In `CardModal.tsx`: `if (isMobilePhone() || /iPhone/.test(navigator.userAgent)) { ... }`.
  - ✅ *Do*: `function CardModal({ platformTier }: { platformTier: PlatformCapabilities })`. Unit tests inject `{ isTouch: true, tier: 'mobile' }` deterministically.

---

## 10. Dropped Requirements & Anti-Phantom Complexity (Sean Goedecke Invariant)
- **Origin**: Sean Goedecke (Pragmatic Engineering & AI Slop Elimination).
- **Trap Killed**: AI agents over-engineering simple features by inventing hypothetical requirements (unrequested concurrency locks, premature caching layers, speculative plugins).
- **Core Invariant**: Every Plan (Station 0.1 / Station 1) MUST declare an `Explicitly Dropped Requirements` section declaring what is deliberately NOT handled, what can be stale, slow, inflexible, or out-of-scope. Subagents are strictly forbidden from implementing unrequested complexity.
- **Do vs Don't**:
  - ❌ *Don't*: Build a multi-tier distributed Redis cache with invalidation queues when adding a local user setting.
  - ✅ *Do*: Explicitly declare: *"Dropped: Distributed caching, background cache warm-up, multi-tab sync. Local in-memory store is sufficient."*

---

## 11. Sequential Multi-Finding Remediation
- **Origin**: Anti-Shotgun Debugging / Systematic Isolation.
- **Trap Killed**: Attempting to fix 5 audit findings simultaneously across 10 files in a single unverified diff, causing cascading side-effects and undetectable regressions.
- **Core Invariant**: When resolving multiple findings from Plan Audits, Adversarial Challenges, or Code Reviews, agents MUST proceed sequentially: (1) Author 1 discrete boundary test asserting finding #1 (RED); (2) Implement minimal fix (GREEN); (3) Verify pass before advancing to finding #2.
- **Do vs Don't**:
  - ❌ *Don't*: Touch 8 files at once to address 4 review comments, then run tests and wonder which edit broke the build.
  - ✅ *Do*: Fix Finding 1 in isolation $\rightarrow$ verify tests pass $\rightarrow$ fix Finding 2 in isolation $\rightarrow$ verify full suite.

---

## 12. STRIDE Trust Boundary Defense
- **Origin**: Microsoft Threat Modeling (Praerit Garg & Loren Kohnfelder).
- **Trap Killed**: Trusting client WebSocket inputs, allowing players or external consumers to spoof identities, tamper with prices, bypass phase rules, or spam intents.
- **Core Invariant**: All client-server boundaries, network protocols, and transaction handlers MUST evaluate the 6 STRIDE threats: Spoofing (actor ID forging), Tampering (price/rent tampering), Repudiation (unattributed logs), Information Disclosure (leaking hidden cards/seed), Denial of Service (action spam), Elevation of Privilege (unauthorized actions).
- **Do vs Don't**:
  - ❌ *Don't*: Accept `payload.cost` or `payload.newBalance` from the client WebSocket message.
  - ✅ *Do*: Client sends only the intent token `{ type: 'UPGRADE_PROPERTY', propertyId }`; server derives cost and balance strictly from authoritative state.

---

## 13. SpecGuard Oracle & Anti-Overfitting Protocol
- **Origin**: Empirical Software Engineering (arXiv:2610.16870) / Oracle Independence.
- **Trap Killed**: Authoring tests that mirror production code line-by-line or mock target implementation details, creating "change detectors" that pass forever but catch no real bugs.
- **Core Invariant**: Test Oracles MUST remain independent from production reference code. Tests verify public observable contracts and behavior, never private member variables or temporary data structures. Every contract suite MUST include $\ge 1$ Negative/Violation test proving illegal transitions are rejected.
- **Do vs Don't**:
  - ❌ *Don't*: Assert that internal helper `_tempMultiplierIndex` was set to `3`.
  - ✅ *Do*: Assert that an invalid action returns `ActionRejectReason.INSUFFICIENT_FUNDS` and leaves world state 100% unchanged.

---

## 14. Build the Lever
- **Origin**: Tooling-First Engineering & Automation Leverage.
- **Trap Killed**: Performing repetitive manual search-and-replace edits across dozens of files, introducing subtle typos, omissions, and human fatigue errors.
- **Core Invariant**: For batch refactors, schema migrations, or repetitive interface updates touching $\ge 5$ files, agents MUST author a reusable deterministic script (`scripts/scratch/` or codemod AST transformation) to execute and verify the change mechanically.
- **Do vs Don't**:
  - ❌ *Don't*: Manually edit 28 component files to rename an import path one by one.
  - ✅ *Do*: Write a 15-line script using `jscodeshift` or Node `fs` regex to execute the transformation deterministically in 100ms.

---

## 15. Exploratory Rollback Discipline
- **Origin**: Git Hygiene & Clean Slate Scientific Method.
- **Trap Killed**: Leaving commented-out blocks, broken temporary scaffolds, or abandoned trial patches in the working tree when a debugging hypothesis fails.
- **Core Invariant**: When an exploratory hypothesis, trial patch, or spike test fails, agents MUST execute an immediate clean rollback (`git checkout` / `git reset` / scratch purge) before attempting hypothesis #2.
- **Do vs Don't**:
  - ❌ *Don't*: Comment out failed attempt 1 and write attempt 2 directly below it.
  - ✅ *Do*: Cleanly revert changes via `git checkout -- .`, confirm working tree is clean, and begin attempt 2 from a known good baseline.

---

## 16. Chesterton's Fence (Why Before What)
- **Origin**: G. K. Chesterton (*The Thing*, 1929) / Codebase Archaeology.
- **Trap Killed**: Deleting or "simplifying" strange, seemingly unnecessary code or defensive checks without understanding why they were originally created, re-introducing old production bugs.
- **Core Invariant**: Before modifying or removing unfamiliar logic, strange timeouts, or defensive checks, agents MUST trace the physical call-graph (/how) and git history/PR logs (/why) to uncover the original invariant being protected.
- **Do vs Don't**:
  - ❌ *Don't*: See a `setTimeout(..., 100)` or odd type cast and delete it immediately thinking "this looks ugly and useless".
  - ✅ *Do*: Run `git log -S` / `git blame` to discover it was added to prevent an iOS Safari canvas resize race condition; preserve the intent or replace with a superior seam.

---

## 17. Make Illegal States Unrepresentable (Yaron Minsky & Matt Pocock Rule)
- **Origin**: Yaron Minsky (Jane Street) & Matt Pocock (Total TypeScript).
- **Trap Killed**: Modeling complex state with collections of independent boolean flags ("boolean soup": `isLoading`, `isError`, `isSuccess`), allowing $2^n$ combinations including corrupt/impossible states.
- **Core Invariant**: Asynchronous lifecycles, UI components, coordinators, and domain state MUST use Discriminated/Tagged Unions (`type State = { status: 'idle' } | { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: string }`) and pure reducers (`useReducer` / state machines). Illegal states are eliminated at compile time with 0-token feedback.
- **Do vs Don't**:
  - ❌ *Don't*: `const [isLoading, setIsLoading] = useState(false); const [error, setError] = useState(null); const [data, setData] = useState(null);`.
  - ✅ *Do*: Use a Discriminated Union with `useReducer` or state machine store. It is impossible to have `status: 'loading'` and `data: T` at the same time.

---

## 18. Conservation & Algebraic Invariant Testing
- **Origin**: Double-Entry Bookkeeping & Formal Conservation Laws.
- **Trap Killed**: Testing balance, currency, or inventory transitions using isolated single-point checks, allowing currency duplication or resource leaks to go unnoticed.
- **Core Invariant**: For financial, treasury, tokenomics, or resource pools, contract test suites MUST assert global algebraic conservation laws ($\sum \text{allocated} + \text{free} = \text{total}$) across state transitions. In multi-party transactions, net balance change across all participants must balance to 0 (excluding valid system mints/burns).
- **Do vs Don't**:
  - ❌ *Don't*: Only test `expect(buyer.wallet).toBe(800)`.
  - ✅ *Do*: `expect(buyer.wallet + seller.wallet + treasury.pool).toBe(initialTotalSupply)`.

---

## 19. Legible State Fixtures (Expect Testing)
- **Origin**: Jane Street Expect Tests & Compiler Output Golden Testing.
- **Trap Killed**: Obscuring behavioral changes behind complex multi-assertion code, forcing human reviewers to mentally trace complex internal object state.
- **Core Invariant**: Complex multi-step coordinators, economic engines, and transaction processors MUST output human-legible text traces/snapshots in verification evidence, reducing human review surface area to visible before/after behavioral diffs.
- **Do vs Don't**:
  - ❌ *Don't*: Write 40 nested `expect(state.players[0].properties[2].mortgaged).toBe(true)` lines.
  - ✅ *Do*: Generate a formatted ASCII ledger snapshot of player balances, asset ownership, and event log before and after the action.

---

## 20. Requirement Tri-Partitioning (Thoughtworks Rule)
- **Origin**: Thoughtworks (Himanshu Sharma, "Don't ask AI to write user stories yet").
- **Trap Killed**: AI agents inventing business rules, default parameters, or fallback behaviors to fill requirement gaps ("confident gaps"), creating false clarity.
- **Core Invariant**: Before drafting any implementation plan (Station 0.1), context MUST be tri-partitioned into: (1) **Confirmed** (explicitly validated/sourced), (2) **Assumed** (temporary technical inferences), and (3) **Unknown** (unmade product decisions). AI is strictly forbidden from inventing business rules for Unknowns; resolve via `ask_question` with the user before Station 1.
- **Do vs Don't**:
  - ❌ *Don't*: Assume that expired bonds forfeit 100% of collateral without asking, and write it into the plan as an invariant.
  - ✅ *Do*: List as `Unknown: What happens when a bond matures without liquidity?` and invoke `ask_question` to let the product owner decide.

---

## 21. Teardown & Cleanup Integrity (Exit 3)
- **Origin**: Agentic Testing Harness & Resource Lifecycle Governance (`e2e` framework).
- **Trap Killed**: Tests passing their assertions (`exit 0`) while silently failing cleanup hooks (unclosed sockets, zombie child processes, unfinalized streams), causing catastrophic CI hangs and OOM server crashes.
- **Core Invariant**: Test suites and harness runners MUST fail explicitly (Exit 3 / Teardown Error) if teardown/cleanup hooks fail, never masking resource leaks as passing tests.
- **Do vs Don't**:
  - ❌ *Don't*: Swallow cleanup errors in `afterAll(() => { try { socket.close(); } catch {} })`.
  - ✅ *Do*: Fail the run with exit code 3 (`CLEANUP_FAILURE`) and print cleanup stack traces so developers debug resource leaks immediately.

---

## 22. Bounded CLI Watchdog
- **Origin**: POSIX Process Group Management & Agent Resilience.
- **Trap Killed**: Lingering secondary timers or unclosed background sockets keeping Node CLI runners alive indefinitely, stalling AI agent sessions for 15+ minutes.
- **Core Invariant**: CLI scripts and toolchain runners MUST unref secondary timers (`timer.unref()`) and enforce a bounded exit grace period ($\le 3\text{s}$). If dangling handles keep the process alive past grace, forcibly terminate the entire child process group (`SIGKILL`).
- **Do vs Don't**:
  - ❌ *Don't*: Leave raw `setInterval` polling loops active in test helper utilities.
  - ✅ *Do*: Call `.unref()` on support timers, and invoke `exitAfterGrace(2000)` on CLI command completion.

---

## 23. Finding Fingerprint & Batching (Paul Bakaus Invariant)
- **Origin**: Impeccable (Paul Bakaus) / Compiler Diagnostic Ergonomics.
- **Trap Killed**: Linter caches keyed on physical line numbers causing spurious re-reporting when code shifts, and repetitive errors flooding the agent's context window.
- **Core Invariant**: Linters, static audits, and test reporters MUST fingerprint findings by content snippet and rule ID (never unstable physical line numbers) to prevent false-alarm re-reporting. Identical repetitive violations MUST be batched into a single primary item suffixed with `(and N more)`.
- **Do vs Don't**:
  - ❌ *Don't*: Dump 50 separate `low-contrast` errors for 50 table cells, filling 3,000 tokens of context.
  - ✅ *Do*: Report: `[low-contrast] Table cell text contrast is 2.1:1 (and 49 more)`.

---

## 24. Downstream Blast Radius Mapping
- **Origin**: UIGraph Lens / Architectural Impact Analysis.
- **Trap Killed**: Reviewing a 5-line edit in isolation while failing to anticipate indirect downstream ripple effects across state stores, WebSocket deltas, and client modals.
- **Core Invariant**: In Station 0, agents MUST map not only direct file callers, but the complete downstream blast radius:
  $$\text{Source Mutation} \longrightarrow \text{State / Schema} \longrightarrow \text{Network / Delta} \longrightarrow \text{Consumers / UI}$$
  Living contract tests must be planned to verify all affected boundaries before implementation begins.
- **Do vs Don't**:
  - ❌ *Don't*: Edit an economic variable in `property_rent.ts` and only check if `property_rent.test.ts` passes.
  - ✅ *Do*: Map the downstream blast radius: `property_rent.ts -> GameSession.ts -> PlayerPortfolioModal.tsx -> BotDecisionEngine.ts`. Verify contracts across the entire chain.

---

## 25. CRAP Score Risk Coupling & Structural Dryer (Uncle Bob Invariant)
- **Origin**: Alberto Savoia, Bob Evans & Robert C. Martin (Uncle Bob - `ub-mode`).
- **Trap Killed**: Accumulating complex, deeply nested logic with little-to-no test coverage ("CRAPPY" code), copy-pasting code blocks with renamed variables (structural duplication), and stopping the moment raw tests pass without structural hardening.
- **Core Invariant**: Every function/method MUST maintain a Change Risk Anti-Patterns (CRAP) score $\le 10$:
  $$\text{CRAP}(m) = C(m)^2 \times (1 - \text{cov}(m))^3 + C(m) \le 10$$
  where $C(m)$ is Cyclomatic Complexity and $\text{cov}(m) \in [0, 1]$ is branch/statement coverage. High-complexity functions ($C \ge 5$) MUST have high test coverage ($\ge 80\%$). Functions with $C \ge 11$ are structurally banned regardless of coverage and MUST be decomposed. Blocks with AST structural similarity $\ge 0.8$ (Dryer rule) MUST be consolidated to eliminate duplication slop. Execution strictly follows the 3-Stage Process: (1) Make it Work $\rightarrow$ (2) Make it Right (CRAP $\le 10$, Duplication $< 0.8$, Mutants killed) $\rightarrow$ (3) Practice (Context hygiene, clean worktree).
- **Do vs Don't**:
  - ❌ *Don't*: Author a 40-line dispatch handler with 5 nested branches ($C = 5$) covered by a single happy-path test ($\text{cov} = 30\% \implies \text{CRAP} = 25 \times 0.343 + 5 = 13.6 > 10$).
  - ✅ *Do*: Refactor into focused sub-handlers ($C \le 3$) or author equivalence partition tests covering $\ge 85\%$ of branches ($\text{cov} = 0.85 \implies \text{CRAP} = 25 \times 0.003 + 5 = 5.1 \le 10$).
