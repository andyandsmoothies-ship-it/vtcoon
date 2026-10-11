# PILLAR I: FSM & STATE LIFECYCLE INVARIANTS

> **Scope**: `src/domain/fsm/`, `src/domain/turn_loop.ts`, `src/server/network/turn_orchestrator.ts`

---

1. **Phase-Driven Action State Reset**: Client-side action flags (`hasRolledThisTurn`, `isActing`) MUST reset on `turnPhase` transitions (e.g. transitioning to `WaitingRoll` immediately resets `hasRolledThisTurn = false`), NEVER relying solely on `currentPlayerId` changes (especially when doubles award an extra roll).
2. **Transient Teardown at Turn N+1**: All transient temporary states (active auctions, trade proposals, event modals, prompt reminders) MUST be dismantled and cleared (`null`) immediately upon entering the next turn (`handleRollDice` / `handleEndTurn`). Leaking transient state across turn boundaries is strictly forbidden.
3. **Anti-Deadlock Double Rolls**: In `TurnPhase.ActionPhase`, the action dock prioritizes property purchase `[🏷️ Buy Property]`. When the player declines and the room transitions to `TurnPhase.PropertyManagement`, the system must immediately restore `[🎲 Roll Again (Doubles)]` if doubles were previously rolled (`canRollAgain === true`), preventing turn-deadlock.
4. **Unbuilt Countdown Teardown SSOT [IMP-205]**: The slow-build countdown counter `unbuiltRounds` (`CC_SLOW_BUILD`) upon property foreclosure or auction win MUST be completely deleted (`delete state.unbuiltRounds` -> `undefined`). Setting `= 0` is strictly forbidden because `0 !== undefined` triggers repeated countdowns on subsequent turns, causing infinite foreclosure loops every 2 turns.
5. **1-Click Auto-Solvency & Off-Turn Hijack Guard Invariant [IMP-210]**:
   - **Purpose**: Provides an automated 1-click solvency resolution (`INTENT_AUTO_SOLVENCY`) when a player has negative cash in `InsolvencyPhase`.
   - **FSM Guard**: Only permitted when the room is currently in `TurnPhase.InsolvencyPhase`. Any invocation outside this phase must reject with `{ success: false, reason: 'INVALID_PHASE' }`.
   - **Off-Turn & Actor Symmetry Guard**: MUST assert that the sender is the active turn player (`currentTurnPlayer`) with negative balance (`balance < 0`). Prevents other players from hijacking the rescue sequence.
   - **Optimal Liquidation Algorithm**: Inherits `executeInsolvencyAfkRecovery`: downgrades lowest tier improvements evenly first, then mortgages unencumbered properties from lowest to highest base cost (skipping frozen properties under `MACRO_LIQUIDITY_FREEZE` or collateral locked under `BOND_COLLATERAL_LOCKED`). If total net liquidation is insufficient, automatically declares bankruptcy (`INTENT_BANKRUPTCY`).
   - **Client Auto-Teardown**: When delta updates bring cash balance $\ge 0$, client session (`use_app_session.ts`) must auto-dismiss `InsolvencyBanner`, transitioning the room smoothly to `PropertyManagement` without requiring manual dismissal.
6. **Corporate Bond Restructuring & Insolvency Auto-Transition [IMP-220]**:
   - **Emergency Debt Restructuring in InsolvencyPhase**: Players with negative balance (`balance < 0`) in `TurnPhase.InsolvencyPhase` are permitted to issue corporate bonds (`INTENT_ISSUE_BOND`) to raise working capital if qualifying criteria are met (`netWorth >= BOND_MIN_NET_WORTH`, $\ge 2$ unmortgaged properties, and collateral value $\ge \text{principal} \times \text{BOND_MIN_COLLATERAL_RATIO}$).
   - **Off-Turn Hijack Guard**: In `InsolvencyPhase`, only the current player in turn (`current.id === playerId`) has authority to execute salvage intents (`INTENT_MORTGAGE`, `INTENT_DOWNGRADE`, `INTENT_BANKRUPTCY`, `INTENT_AUTO_SOLVENCY`, `INTENT_ISSUE_BOND`). Intents from out-of-turn players must reject with `ActionRejectReason.NOT_YOUR_TURN`.
   - **Auto-Solvency Transition**: When bond proceeds restore positive balance (`balance >= 0`), the FSM auto-transitions `room.phase` from `InsolvencyPhase` to `PropertyManagement`. If proceeds remain insufficient (`balance < 0`), the room remains in `InsolvencyPhase` for further mortgage/downgrade actions.
   - **Collateral Immunity**: Following issuance, bonded properties (`collateralCells`) are locked (`BOND_COLLATERAL_LOCKED`). `INTENT_AUTO_SOLVENCY` and manual mortgage logic must strictly exclude these cells.
7. **PRNG Stream Isolation & Deterministic Replay Invariant [IMP-249]**:
   - **Mathematical PRNG Stream Separation**: `RoomManager` maintains two strictly independent pseudo-random streams: `rng` (pawn dice rolls, wheel spin sectors) and `deckRng` (Chance, Market card draws).
   - **Determinism Hazard Guard**: Passing `rng` into card-drawing routines (`handleSpecialCell`, `drawMarketCard`, `drawChanceCard`) is strictly forbidden. Any second-hop landing resolver (e.g. `resolveSecondHopLanding` in `transit_wheel_handler.ts`) MUST receive and forward `deckRng` independently. Mixing streams corrupts dice sequence determinism and breaks replay capability.
8. **Senior Lien Bond Collateral Exclusion & Ephemeral State Teardown [IMP-240]**:
   - **Deceptive Trap**: When a player bankrupted by unpaid rent has assets seized, naive logic transfers all properties directly to the creditor (`registry.set(cellIndex, creditor.id)`). However, if the debtor issued corporate bonds, transferring bonded properties (`collateralCells`) to an individual landlord forfeits bondholders' collateral, directly violating Senior Lien rights.
   - **Physical Finding**: In `insolvency_manager.ts`, omitting `if (collateralCells.has(cellIndex)) continue;` misallocates collateral; conversely, omitting teardown for `pendingInsolvencyCreditorId`, `pendingInsolvencyDebtorId`, and `fireSaleDebtorId` leaks transient states to Turn N+1 or pollutes successful self-recovery (`balance >= 0`).
   - **Verified Invariants**:
     1. Bond collateral properties (`collateralCells`) MUST NOT transfer to private creditors; they must queue into `fireSaleQueue` for public foreclosure auction to satisfy bondholder debt.
     2. All transient flags `pendingInsolvency*` and `fireSaleDebtorId` must be cleared cleanly upon self-recovery (`coordMortgage`, `coordDowngrade`), foreclosure queue drain, or next player turn advancement via `advanceTurnToNextPlayer`. `[DOMAIN/FSM]`
9. **Transit Wheel Auction Black Hole & Synchronized Pawn Pacing [IMP-248]**:
   - **Deceptive Trap & Race Hazards**:
     1. *Auction Black Hole*: If the transit wheel triggers only upon direct purchase (`handleBuyProperty`), a player declining purchase and sending the station to auction (`handleDecline`) permanently loses their wheel spin after auction close (`handleAuctionClose`).
     2. *Pawn Movement Desync Jitter*: When the server resolves wheel spin and broadcasts new pawn coordinates, executing 3D movement immediately (`enqueuePawnMove`) causes the pawn to glide across the board while the 2D wheel is still animating for 3.5s.
     3. *Recursive Infinite Hop Loop*: Spinning `NEXT_PORT` advances the pawn to the next transit station (5, 15, 25, 35). Without an atomic guard, the FSM re-triggers `pendingTransitWheel`, generating an infinite hop loop.
   - **Verified Invariants**:
     1. *Auction Closed-Loop Hook*: `handleAuctionClose` must check and assign `pendingTransitWheel` to the active turn player if they landed on a station tile and maintain balance $\ge 0$.
     2. *Pawn Movement Hold*: In `apply_delta_players.ts`, when `activeModal === 'transit_wheel'`, pawn movements must hold in `pendingPawnMove` and trigger (`startPawnMove`) only after the player dismisses or confirms wheel results.
     3. *Atomic Recursive Lock*: `current.hasSpunTransitThisTurn = true` and `room.pendingTransitWheel = null` must be set synchronously before second-hop resolution (`resolveSecondHopLanding`), resetting (`hasSpunTransitThisTurn = false`) strictly in `executeTurnEnd`. `[DOMAIN/FSM]`

10. **Presentation Staging & Phase Shift Decoupling Guard [IMP-279]**:
    - **Deceptive Trap & Race Hazards**:
      1. *Premature Modal Presentation*: When a player lands on a station tile, the server responds in $< 10\text{ms}$ with `pendingTransitWheel`. Calling `openModal('transit_wheel')` while the 3D pawn is still moving (`isMoving === true`) overlays the modal prematurely, obscuring movement kinematics.
      2. *Unstaged Deadlock on Static Tiles*: If a station tile is unowned, landing triggers Buy / Auction phase first. Once settled, FSM enters `PropertyManagement` and assigns `pendingTransitWheel`. Because the pawn is already stationary (`isMoving === false`), `lastLandedPawn` will NEVER fire. Naively waiting for `lastLandedPawn` creates an unresolvable modal deadlock.
      3. *Premature Dismissal on Null Delta*: When the player clicks spin, server zeroes `pendingTransitWheel = null` to block click spam. If client listens to `delta.pendingTransitWheel === null` to trigger `closeModal()`, the modal destroys itself on millisecond 1 of the 3.5s spin animation.
    - **Verified Invariants**:
      1. *Kinematic Presentation Branching*: In `apply_delta.ts`, when receiving `pendingTransitWheel`: inspect `useGameStore.getState().isMoving`. If `!isMoving`, trigger `openModal('transit_wheel')` immediately. If `isMoving`, queue into `stagedTransitWheel` and trigger only upon `lastLandedPawn` arrival.
      2. *Client-Owned Dismissal Invariant*: FORBIDDEN calling `closeModal()` when receiving `delta.pendingTransitWheel === null`. Modals close only via user action (`handleDismiss`) or full turn progression.
      3. *Inter-Match Staging Teardown*: Export `resetStagedTransitWheel()` to purge staging buffers on game reset or test teardown. `[DOMAIN/FSM]`

11. **Symmetric Insolvency FSM Phase Restoration Invariant [IMP-320/IMP-324]**:
    - **Deceptive Trap (Asymmetric Exit Trap)**: When an off-turn debtor enters `InsolvencyPhase` during another player's turn (e.g. `bot_4` in `ActionPhase`), FSM preserves `preInsolvencyPhase`. If the system restores `preInsolvencyPhase` on property downgrade (`coordDowngrade`) but neglects mortgage (`coordMortgage`) or bankruptcy (`resolvePostBankruptcyInsolvency`), the active turn player's turn is overwritten and forced into `PropertyManagement`.
    - **Verified Invariant (Symmetric Invariant)**: Any action resolving `InsolvencyPhase` (`coordDowngrade`, `coordMortgage`, and `resolvePostBankruptcyInsolvency`) MUST apply symmetric logic: if the debtor is the turn player (`isTurnPlayer`), transition to `PropertyManagement`; if off-turn, restore `preInsolvencyPhase ?? PropertyManagement` and clear `preInsolvencyPhase`. `[DOMAIN/FSM]`

12. **Combinatorial Queue Matrix & Bankruptcy Deadlock Prevention [IMP-327]**:
    - **Deceptive Trap (Deadlock & Cascade Combinatorial Trap)**: When multiple debtors occupy `pendingInsolvencyQueue = [P0, P1]`:
      1. *Deadlock Trap*: If current turn-holder ($P_0$) bankrupts first, FSM cannot advance turns yet because $P_1$ remains insolvent. When $P_1$ achieves solvency and the queue drains, naively restoring `preInsolvencyPhase` leaves bankrupted $P_0$ unable to end turn and $P_1$ unauthorized to end turn $\rightarrow$ permanent game freeze.
      2. *Cascade Trap*: If $P_0$ and $P_1$ bankrupt consecutively, failing to audit `isRoomGameOver` after each queue pop causes turns to advance in a room with only 1 survivor.
    - **Verified Invariant (Combinatorial Invariant)**:
      1. When debt queue empties (`nextDebtor === undefined`), centralized helper `restorePostInsolvencyPhase` MUST verify: `if (room.players[room.currentPlayerIndex]?.bankrupt) { advanceTurnAfterBankruptcy(room); return; }` to immediately advance turns to the next active survivor.
      2. Any FSM featuring an $N \ge 2$ queue with $K=2$ outcomes (Solvency $S$ vs. Bankruptcy $B$) MUST generate a complete $2^2=4$ combinatorial test matrix in Station 1: $[S,S], [S,B], [B,S], [B,B]$. `[DOMAIN/FSM]`

13. **Self-Contained Debt Attribution & Contextual Creditor Reset [IMP-327]**:
    - **Deceptive Trap (Creditor Attribution Poisoning & Asset Theft)**: Sharing a single global `room.pendingInsolvencyCreditorId` across debtors poisons attribution: advancing to debtor $P_1$ falsely binds $P_0$'s creditor; conversely, blanket blind clearing strips legitimate creditors of awarded assets in shared events.
    - **Verified Invariant (Attribution Invariant)**: When advancing to `nextDebtor`, release the previous creditor and re-evaluate debt context (bank debt from taxes/cards vs. landlord debt from tile rent) prior to entering `InsolvencyPhase`. Upon phase exit, 100% of the 4 transient fields MUST be cleared: `pendingInsolvencyDebtorId`, `pendingInsolvencyCreditorId`, `pendingInsolvencyQueue`, and `preInsolvencyPhase`. `[DOMAIN/FSM]`

14. **Terminal State Invariant & Single Bankruptcy Exit Point Mandate [IMP-339]**:
    - **Deceptive Trap (Sole Survivor Trap & Asymmetric Exit Drift)**:
      1. *Sole Survivor Trap*: In a 2-player match where survivor $P_2$ is in `pendingInsolvencyQueue` due to earlier deficit: if $P_1$ declares bankruptcy and `restorePostInsolvencyPhase` executes before `isRoomGameOver(room)`, the system dequeues $P_2$ into `InsolvencyPhase`, trapping the winner in a bankruptcy modal over the victory screen.
      2. *Auction Exit Drift*: When bond foreclosure auctions (`fireSaleQueue`) conclude in `auction_manager.ts`, re-implementing 17 lines of turn-advance logic instead of invoking the SSOT helper omits round boundary increments (`advanceRoundBoundary`) and permits negative-balance players to roll dice.
      3. *Orphan Debtor Queue Trap*: In out-of-phase bankruptcies, pushing a deficit creditor into `pendingInsolvencyQueue` without triggering `checkInsolvency` leaves the debtor stranded because `restorePostInsolvencyPhase` is blocked by `room.phase !== TurnPhase.InsolvencyPhase`.
    - **Verified Invariants**:
      1. *Terminal State Invariant*: In `restorePostInsolvencyPhase`, `advanceTurnAfterBankruptcy`, and `finalizeInsolvencyPhase`, the guard `if (isRoomGameOver(room))` MUST reside on the first line to purge transient fields (`pendingInsolvencyQueue`, `pendingInsolvencyDebtorId`, `pendingInsolvencyCreditorId`, `preInsolvencyPhase`) and halt queue processing once victory is achieved.
      2. *Single Bankruptcy Exit Point Mandate*: All turn-advance pathways following player bankruptcy (including post-foreclosure auction resolution in `auction_manager.ts`) MUST route through centralized `advanceTurnAfterBankruptcy(room)`. Re-implementing next-player loops elsewhere is strictly forbidden.
      3. *Self-Healing SSOT*: `checkInsolvency` must fall back to `room.preInsolvencyPhase = TurnPhase.WaitingRoll` if `room.phase === TurnPhase.InsolvencyPhase` lacks a saved phase. `finalizeInsolvencyPhase` must restore `TurnPhase.WaitingRoll` if the turn player had not yet rolled dice before entering debt. `[DOMAIN/FSM]`

15. **Flight Recorder Diagnostics & Race Hazard Forensic Invariant [FSM/FORENSIC]**:
    - **Deceptive Trap (Heisenbug Speculation)**: For insolvency anomalies, FSM deadlocks, or N+1 turn transitions, speculative static code reading consistently misses micro-tick ordering and concurrent bot/player intents.
    - **Verified Invariant**: When investigating FSM bugs, agents MUST ingest Flight Recorder dumps (`window.__vtcoon.exportFlightRecorder()` or JSON logs) and run `node scripts/analyze_gameplay_log.mjs <dump.json>` to trace sequential FSM ticks, identifying true race hazards empirically. `[DOMAIN/FSM]`
