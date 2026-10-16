# PILLAR I: FSM & STATE LIFECYCLE INVARIANTS

> **Scope**: `src/domain/fsm/`, `src/domain/turn_loop.ts`, `src/server/network/turn_orchestrator.ts`  
> **Gotchas SSOT Rule**: Concise architectural invariant rulebook. Anti-Changelog: Keep technical formulas, limits, and negative constraints; omit narrative stories. Size ceiling: <= 15 KB.

---

1. **Phase-Driven Action State Reset**:
   - Action flags (`hasRolledThisTurn`, `isActing`) MUST reset on `turnPhase` transitions (e.g. entering `WaitingRoll` resets `hasRolledThisTurn = false`), NEVER relying solely on `currentPlayerId` changes (protecting double-roll turns).

2. **Transient Teardown at Turn N+1**:
   - All transient states (active auctions, trade proposals, event modals, prompt reminders) MUST be cleared (`null`) immediately upon entering the next turn (`handleRollDice` / `handleEndTurn`). Leaking transient state across turn boundaries is strictly forbidden.

3. **Anti-Deadlock Double Rolls**:
   - When a player declines property purchase in `TurnPhase.ActionPhase` and room enters `PropertyManagement`, restore `[🎲 Roll Again (Doubles)]` immediately if doubles were rolled (`canRollAgain === true`), preventing turn deadlocks.

4. **Unbuilt Countdown Teardown SSOT**:
   - The slow-build countdown counter `unbuiltRounds` (`CC_SLOW_BUILD`) upon property foreclosure or auction win MUST be deleted (`delete state.unbuiltRounds` -> `undefined`). Setting `= 0` is strictly forbidden because `0 !== undefined` triggers repeated countdowns and infinite foreclosure loops.

5. **1-Click Auto-Solvency & Off-Turn Hijack Guard**:
   - `INTENT_AUTO_SOLVENCY` is permitted ONLY in `TurnPhase.InsolvencyPhase`. Asserts sender is the active turn player with negative balance (`balance < 0`). Liquidation order: downgrades lowest improvements evenly, then mortgages unencumbered properties from lowest to highest base cost (skipping frozen or collateral-locked cells). Auto-declares bankruptcy if proceeds remain insufficient.

6. **Corporate Bond Restructuring & Insolvency Auto-Transition**:
   - Debtors in `InsolvencyPhase` may issue bonds (`INTENT_ISSUE_BOND`) if criteria are met (Net Worth $\ge 3,000$, $\ge 2$ unencumbered properties, collateral $\ge \text{principal} \times \text{BOND_MIN_COLLATERAL_RATIO}$). Only active turn player has authority to salvage. Proceeds restoring `balance >= 0` auto-transition to `PropertyManagement`. Bonded properties are locked (`BOND_COLLATERAL_LOCKED`).

7. **PRNG Stream Isolation & Deterministic Replay**:
   - `RoomManager` maintains strictly independent PRNG streams: `rng` (dice rolls, wheel spins) and `deckRng` (Chance, Market card draws). Passing `rng` into card-drawing routines is strictly forbidden to preserve dice sequence determinism and replay integrity.

8. **Senior Lien Bond Collateral Exclusion & Transient Cleanup**:
   - Bond collateral properties (`collateralCells`) MUST NOT transfer to private rent creditors upon bankruptcy; they MUST queue into `fireSaleQueue` for public foreclosure auction to satisfy bondholders. Clear all transient flags (`pendingInsolvency*`, `fireSaleDebtorId`) upon self-recovery, queue drain, or turn advance.

9. **Transit Wheel Auction Black Hole & Synchronized Pacing**:
   - `handleAuctionClose` MUST assign `pendingTransitWheel` to active turn player if they landed on a station and maintain `balance >= 0`.
   - In `apply_delta_players.ts`, pawn movements hold in `pendingPawnMove` while `activeModal === 'transit_wheel'`, triggering only after wheel dismissal.
   - Synchronously lock `current.hasSpunTransitThisTurn = true` and `room.pendingTransitWheel = null` before second-hop resolution to prevent recursive infinite hop loops.

10. **Presentation Staging & Phase Shift Decoupling**:
    - When receiving `pendingTransitWheel`: if `!isMoving`, open modal immediately; if `isMoving`, queue into `stagedTransitWheel` and trigger only upon pawn arrival.
    - FORBIDDEN closing modals when receiving `delta.pendingTransitWheel === null`. Modals close only via explicit user action or turn progression. Export `resetStagedTransitWheel()` for test teardown.

11. **Symmetric Insolvency FSM Phase Restoration**:
    - Any action resolving `InsolvencyPhase` (`coordDowngrade`, `coordMortgage`, `resolvePostBankruptcyInsolvency`) MUST apply symmetric logic: if debtor is the active turn player, transition to `PropertyManagement`; if off-turn, restore `preInsolvencyPhase ?? PropertyManagement` and clear `preInsolvencyPhase`.

12. **Combinatorial Queue Matrix & Bankruptcy Deadlock Prevention**:
    - When debt queue empties (`nextDebtor === undefined`), centralized helper `restorePostInsolvencyPhase` MUST verify: `if (room.players[room.currentPlayerIndex]?.bankrupt) { advanceTurnAfterBankruptcy(room); return; }` to advance turns to the next active survivor.
    - FSM debt queues with $N \ge 2$ debtors and $K=2$ outcomes (Solvency $S$ vs Bankruptcy $B$) MUST verify the full combinatorial matrix: $[S,S], [S,B], [B,S], [B,B]$.

13. **Self-Contained Debt Attribution & Contextual Creditor Reset**:
    - When advancing to `nextDebtor`, release previous creditor and re-evaluate debt context. Upon phase exit, 100% of the 4 transient fields MUST be cleared: `pendingInsolvencyDebtorId`, `pendingInsolvencyCreditorId`, `pendingInsolvencyQueue`, and `preInsolvencyPhase`.

14. **Terminal State Invariant & Single Bankruptcy Exit Point**:
    - In `restorePostInsolvencyPhase`, `advanceTurnAfterBankruptcy`, and `finalizeInsolvencyPhase`, the guard `if (isRoomGameOver(room))` MUST reside on the first line to purge transient fields and halt queue processing upon victory.
    - All post-bankruptcy turn advances MUST route through centralized `advanceTurnAfterBankruptcy(room)`. Re-implementing next-player loops elsewhere is strictly forbidden.

15. **Flight Recorder Diagnostics & Race Hazard Forensics**:
    - When investigating FSM desync bugs or race conditions, agents MUST ingest Flight Recorder dumps (`exportFlightRecorder()` or JSON logs) and run `node scripts/analyze_gameplay_log.mjs <dump.json>` to trace sequential FSM ticks before proposing fixes.

16. **Full Lifecycle Testing Invariant**:
    - FORBIDDEN solitary static mocking of store state for lifecycle, camera, or pawn features. Contract test suites MUST exercise the canonical sequence (`triggerDiceRoll` -> `startPawnMove`).

17. **Stall Guard & FSM Progress Invariant**:
    - Actions resulting in execution errors or `ActionRejectReason` count as NO PROGRESS. A sequence of 3 consecutive errored or no-op actions MUST trigger a stall break, fallback recovery, or blocked verdict rather than spinning.

18. **Active Self-Healing & Ephemeral State TTL**:
    - Ephemeral state flags, touch collections, and subsystem locks MUST implement an authoritative Dead Man's Switch (TTL 3s–5s) with deterministic recovery actions.
