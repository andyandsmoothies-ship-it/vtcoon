# Plan IMP-339: Symmetric Bond Insolvency Restoration & Creditor Solvency Cascade Gate

## 0. Context & Prior In-Flight Scope (Uncommitted)
- **Prior In-Flight Scope (Uncommitted)**:
  - `src/client/3d/event_card_texture.ts`
  - `src/client/ui/modals/event_card_modal.tsx`
  - `src/client/ui/modals/event_card_visuals.ts`
  - `tests/client/imp343_event_card_display_data.test.ts`
  - `src/client/events/game_event_synthesizer.ts`
  - `src/client/events/game_event_types.ts`
  - `src/client/events/subscribers/activity_log_subscriber.ts`
  - `src/client/network/apply_delta.ts`
  - `src/client/events/game_event_kinematics_synthesizer.ts`
  - `src/client/events/subscribers/activity_log_kinematics_formatter.ts`
  - `tests/client/imp344_kinematic_game_event_synthesis.test.ts`
  - `src/client/3d/tile_icons.ts`
  - `src/client/3d/tile_icons/types.ts`
  - `src/client/3d/tile_icons/transports.ts`
  - `src/client/3d/tile_icons/landmarks.ts`
  - `src/client/3d/tile_icons/culture.ts`
  - `src/client/3d/tile_icons/systems.ts`


## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-339`
- **Subsystem**: `server-network` (Tier 1 Server FSM & Domain Lifecycle)
- **Problem Statement**:
  1. **Off-Turn Debtor Bond Insolvency Trap**: In `src/server/bond_manager.ts:130-136`, after issuing a bond, `room.phase` is hardcoded to `TurnPhase.PropertyManagement` only if `room.players[room.currentPlayerIndex]?.id === player.id`. If an off-turn debtor issues a bond to become solvent, this condition evaluates to false, leaving the room trapped in `InsolvencyPhase`.
  2. **Sole Survivor Insolvency Trap (Terminal State Violation)**: In `src/server/insolvency_manager.ts`, when a 2-player match reaches end-game and the sole surviving player was already in `pendingInsolvencyQueue`, `declareBankruptcy` invokes `restorePostInsolvencyPhase` before `isRoomGameOver`, shifting the survivor as a new debtor and trapping the game winner in `InsolvencyPhase`.
  3. **Asymmetric Auction Exit & Duplicate Turn Advance**: In `src/server/auction_manager.ts:265-283`, after `fireSaleQueue` items settle, a duplicate 17-line loop transitions the turn without invoking `advanceRoundBoundary` and unconditionally sets `room.phase = TurnPhase.WaitingRoll`, allowing indebted players to roll dice illegally.
  4. **Dead-Path Restoration & Self-Healing SSOT**: In `finalizeInsolvencyPhase`, unconditionally forcing `PropertyManagement` overrides `preInsolvencyPhase = WaitingRoll` for turn players. In `checkInsolvency`, callers prematurely setting `InsolvencyPhase` erase `preInsolvencyPhase`. Off-phase debtor bankruptcy leaves orphan creditor queues without triggering insolvency.
- **Architectural Solution**:
  1. **Harmonize `bond_manager.ts`**: Replace manual phase assignment with authoritative `restorePostInsolvencyPhase(room, player.id)`.
  2. **Harmonize `auction_manager.ts`**: Replace 17 lines of duplicated turn advance with central `advanceTurnAfterBankruptcy(room)`.
  3. **Terminal State Invariant in `insolvency_manager.ts`**: Guard `restorePostInsolvencyPhase`, `advanceTurnAfterBankruptcy`, and `finalizeInsolvencyPhase` with top-level `if (isRoomGameOver(room))` cleanup.
  4. **Self-Healing Core in `checkInsolvency`**: Fallback `preInsolvencyPhase = TurnPhase.WaitingRoll` if already in `InsolvencyPhase`. Honor `WaitingRoll` in `finalizeInsolvencyPhase`. Proactively trigger `checkInsolvency` for indebted creditors if bankruptcy occurs outside `InsolvencyPhase`.
- **Direct Scope (Physical Files)**:
  - `src/server/bond_manager.ts`
  - `src/server/insolvency_manager.ts`
  - `src/server/auction_manager.ts`
  - `tests/server/imp339_bond_insolvency_and_cascade_gate.test.ts` (New)

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/server/bond_manager.ts` | Tier 1 (Domain/Server/FSM) | 239 | 239 | 0 | <= 400 | ✔️ Safe |
| `src/server/insolvency_manager.ts` | Tier 1 (Domain/Server/FSM) | 354 | 354 | 0 | <= 400 | ⚠️ Soft Notice (354 <= 400 Tier 1) |
| `src/server/auction_manager.ts` | Tier 1 (Domain/Server/FSM) | 323 | 323 | 0 | <= 400 | ⚠️ Soft Notice (323 <= 400 Tier 1) |
| `tests/server/imp339_bond_insolvency_and_cascade_gate.test.ts` | Living Test | 0 | 367 | +367 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/server/imp339_bond_insolvency_and_cascade_gate.test.ts` (Tệp mới)

Test Specifications:
- TC-339.01 [UC-BOND/MSS]: Given room in InsolvencyPhase with turn player p0 whose balance reaches positive after issuing bond, When handleIssueBond executes, Then delegates to restorePostInsolvencyPhase and transitions room.phase to PropertyManagement.
- TC-339.02 [UC-BOND/A1]: Given room in InsolvencyPhase with off-turn debtor p1 during turn of bot_2 with preInsolvencyPhase ActionPhase, When p1 issues bond restoring balance to positive, Then restorePostInsolvencyPhase restores room.phase back to ActionPhase.
- TC-339.03 [UC-BOND/A2]: Given multi-debtor queue [p1, p2] in InsolvencyPhase where p1 issues bond restoring solvency, When handleIssueBond completes, Then advances pendingInsolvencyDebtorId to p2 while preserving InsolvencyPhase.
- TC-339.04 [UC-TURN/MSS]: Given next player with negative balance at start of their turn, When turn loop advances to next player, Then checkInsolvency preserves preInsolvencyPhase as WaitingRoll and post-solvency restoration allows rolling dice.
- TC-339.05 [UC-TURN/A1]: Given turn player current with negative balance entering extra turn, When turn loop evaluates extra turns, Then checkInsolvency records preInsolvencyPhase WaitingRoll before entering InsolvencyPhase.
- TC-339.06 [UC-CASCADE/MSS]: Given debtor p1 declaring bankruptcy transferring assets to creditor p2 who has negative balance in multi-player match, When declareBankruptcy completes transfer, Then enqueues p2 into pendingInsolvencyQueue and preserves InsolvencyPhase.
- TC-339.07 [UC-CASCADE/A1]: Given debtor p1 declaring bankruptcy transferring assets to solvent creditor p2 whose balance remains positive, When declareBankruptcy completes transfer, Then does not enqueue p2 into pendingInsolvencyQueue.
- TC-339.08 [UC-CASCADE/A2]: Given match reaching game over where last debtor p1 declares bankruptcy to indebted creditor p2, When declareBankruptcy executes, Then does not enqueue p2 and resolves clean victory without insolvency trap.
- TC-339.09 [UC-DEADLOCK/A1]: Given multi-debtor queue [p0, p1] where turn player p0 is bankrupt and off-turn debtor p1 issues bond restoring solvency, When queue drains, Then advanceTurnAfterBankruptcy is invoked to prevent deadlock.
- TC-339.10 [UC-SYMMETRIC/A1]: Given turn advancing after bankruptcy via advanceTurnAfterBankruptcy to player with negative balance, When turn transitions, Then enforces checkInsolvency and prevents illegal dice rolling.
- TC-339.11 [UC-CASCADE/A3]: Given 2-player match where p2 is already queued in pendingInsolvencyQueue and p1 declares bankruptcy, When restorePostInsolvencyPhase runs, Then clears all transient insolvency fields and declares p2 game winner.
- TC-339.12 [UC-SYMMETRIC/A2]: Given auction settling fireSaleQueue where bankrupt turn player triggers turn advance and next player has negative balance, When settleAuction finishes, Then delegates to advanceTurnAfterBankruptcy and enters InsolvencyPhase.
- TC-339.13a [UC-CASCADE/A3]: Given off-turn debtor p1 with active bond declaring bankruptcy to indebted creditor p2 whose balance is negative, When declareBankruptcy executes, Then enters AuctionPhase and enqueues p2 into pendingInsolvencyQueue.
- TC-339.13b [UC-CASCADE/A3]: Given collateral fire sale auction settling completely with indebted creditor queued, When handleAuctionClose completes, Then restores pending creditor into InsolvencyPhase without stealing turn.
- TC-339.13c [UC-CASCADE/A4]: Given 2-player match with active bond where debtor p1 bankrupts to indebted creditor p2, When fire sale auction settles, Then honors Terminal State Invariant and does not trap sole survivor in InsolvencyPhase.

### Station 2: Implementation (GREEN)

#### Task 1: Update `src/server/bond_manager.ts`
**Target physical file**: `src/server/bond_manager.ts`
- Import `restorePostInsolvencyPhase` from `./insolvency_manager`.
- In `handleIssueBond`, replace lines 130-136 with:
  ```typescript
  if (room.phase === TurnPhase.InsolvencyPhase && player.balance >= 0) {
    restorePostInsolvencyPhase(room, player.id);
  }
  ```

#### Task 2: Update `src/server/insolvency_manager.ts`
**Target physical file**: `src/server/insolvency_manager.ts`
- In `checkInsolvency`, add self-healing fallback:
  ```typescript
  if (room.phase !== TurnPhase.InsolvencyPhase) {
    room.preInsolvencyPhase = room.phase;
  } else if (!room.preInsolvencyPhase) {
    room.preInsolvencyPhase = TurnPhase.WaitingRoll;
  }
  ```
- In `restorePostInsolvencyPhase`, enforce Terminal State Invariant:
  ```typescript
  if (isRoomGameOver(room)) {
    delete room.pendingInsolvencyDebtorId;
    delete room.pendingInsolvencyCreditorId;
    delete room.pendingInsolvencyQueue;
    delete room.preInsolvencyPhase;
    return;
  }
  ```
- In `finalizeInsolvencyPhase`, honor `WaitingRoll` for turn player:
  ```typescript
  room.phase = isTurnPlayer
    ? (room.preInsolvencyPhase === TurnPhase.WaitingRoll ? TurnPhase.WaitingRoll : TurnPhase.PropertyManagement)
    : (room.preInsolvencyPhase ?? TurnPhase.PropertyManagement);
  ```
- In `declareBankruptcy`, gate and trigger creditor insolvency:
  ```typescript
  if (creditor.balance < 0 && !isRoomGameOver(room)) {
    if (room.phase !== TurnPhase.InsolvencyPhase) {
      checkInsolvency(room, undefined, creditor.id);
    } else {
      room.pendingInsolvencyQueue ??= [];
      if (!room.pendingInsolvencyQueue.includes(creditor.id)) {
        room.pendingInsolvencyQueue.push(creditor.id);
      }
    }
  }
  ```
- In `advanceTurnAfterBankruptcy`, synchronize start-of-turn negative balance check.

#### Task 3: Update `src/server/auction_manager.ts`
**Target physical file**: `src/server/auction_manager.ts`
- Import `advanceTurnAfterBankruptcy` from `./insolvency_manager`.
- In `settleAuction`, replace lines 266-283 with:
  ```typescript
  if (current?.bankrupt) {
    advanceTurnAfterBankruptcy(room);
  }
  ```

### Station 3: Pre-Filter & Architecture Review
- Run mechanical pre-filter: `npm run prefilter -- src/server/bond_manager.ts src/server/insolvency_manager.ts src/server/auction_manager.ts tests/server/imp339_bond_insolvency_and_cascade_gate.test.ts`.
- Run scope check: `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_339_SYMMETRIC_BOND_INSOLVENCY_AND_CASCADE_GATE.md`.

### Station 4: Evidence & Verification
- Execute test suite: `npx vitest run tests/server/imp339_bond_insolvency_and_cascade_gate.test.ts`.
- Run Sentinel probe mutation: `npm run sentinel -- --ticket IMP-339 --test tests/server/imp339_bond_insolvency_and_cascade_gate.test.ts --src src/server/bond_manager.ts`.
- Verify evidence: `node scripts/check_evidence.mjs IMP-339`.
- Synthesize delivery report: `npm run report -- IMP-339`.
