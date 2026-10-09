# Plan IMP-327: Symmetric FSM Insolvency Restoration & Multi-Debtor Queue Harmonization

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-327`
- **Subsystem**: `server-network` (Tier 1 Server FSM & Property Coordinator)
- **Problem Statement**:
  1. **Asymmetric Insolvency Phase Exit & Multi-Debtor Starvation**: In `room_property_coordinator.ts:coordDowngrade`, when an off-turn debtor downgrades a property to restore solvency, `ctx.room.phase` is restored but `room.pendingInsolvencyQueue` is completely ignored. Any subsequent debtors in the multi-debtor queue are starved, leaving the room with insolvent players while advancing or restoring phases prematurely.
  2. **Double Queue-Draining between mortgage_manager and coordMortgage**: `src/server/mortgage_manager.ts:160-184` and `src/server/room_property_coordinator.ts:43-51` duplicate inline queue-draining and phase mutation logic. In a multi-debtor queue, this causes double-shift or queue corruption, wiping out subsequent debtors.
  3. **Creditor Attribution Poisoning & Asset Theft**: When advancing from debtor A to debtor B, `room.pendingInsolvencyCreditorId` is not reset in `resolvePostBankruptcyInsolvency`. If debtor B goes bankrupt, all their assets are erroneously transferred to debtor A's creditor instead of Kho Bạc or the Bank.
  4. **Turn Player Bankruptcy Premature Turn Advance & Post-Solvency Deadlock Trap**:
     - In `declareBankruptcy:274`, `advanceTurnAfterBankruptcy` was called without checking if `room.phase === TurnPhase.InsolvencyPhase`, immediately destroying InsolvencyPhase while queued debtors remained.
     - Conversely, when turn player p0 goes bankrupt first and off-turn debtor p1 subsequently achieves solvency, if the system merely restores `PropertyManagement`, bankrupt player p0 cannot end turn and p1 is not the turn player, causing a permanent game deadlock.
  5. **Bypass in liquidateAssets & Ghost Debtor State Leaks**:
     - In `insolvency_manager.ts:115-119`, direct liquidation hardcodes `room.phase = TurnPhase.PropertyManagement`, bypassing `preInsolvencyPhase` and `pendingInsolvencyQueue`.
     - When queue empties or ghost debtors are skipped, leaving `pendingInsolvencyQueue = []` causes lingering dirty state.
- **Architectural Solution**:
  1. **SSOT Phase Restoration (`restorePostInsolvencyPhase`)**: In `src/server/insolvency_manager.ts`, extract and export `restorePostInsolvencyPhase(room: Room, playerId: string): void` as the centralized authority with idempotency guard.
  2. **Ghost Debtor Skipping & Clean Tombstone**: While `pendingInsolvencyQueue` has items, skip candidates with `balance >= 0` or `bankrupt === true`. When advancing to `nextDebtor`, clear debtor-specific `room.pendingInsolvencyCreditorId`. When queue is fully empty, unconditionally `delete room.pendingInsolvencyQueue; delete room.pendingInsolvencyDebtorId; delete room.pendingInsolvencyCreditorId; delete room.preInsolvencyPhase;`.
  3. **Turn Player Bankruptcy Deadlock Prevention**: In `restorePostInsolvencyPhase`, when queue drains: if `room.players[room.currentPlayerIndex]?.bankrupt === true`, immediately invoke `advanceTurnAfterBankruptcy(room)` to transition turn to the next living player.
  4. **Multi-Debtor Cascade Bankruptcy Guard**: In `declareBankruptcy`, guard `advanceTurnAfterBankruptcy` with `&& room.phase !== TurnPhase.InsolvencyPhase`.
  5. **Harmonize mortgage_manager**: In `src/server/mortgage_manager.ts:160-184`, remove duplicate inline queue-draining and delegate to `restorePostInsolvencyPhase(room, playerId)`.
  6. **Harmonize coordDowngrade, coordMortgage & liquidateAssets**: In `src/server/room_property_coordinator.ts` and `src/server/insolvency_manager.ts:liquidateAssets`, replace custom mutations with `restorePostInsolvencyPhase(room, playerId)`.
- **Direct Scope**:
  - `src/server/insolvency_manager.ts`
  - `src/server/room_property_coordinator.ts`
  - `src/server/mortgage_manager.ts`
  - `tests/server/imp327_symmetric_fsm_insolvency_restoration.test.ts` (New)
- **Baseline Working Tree Dependencies**:
  - `.agents/skills/improve-codebase-architecture/SKILL.md`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/server/insolvency_manager.ts` | Tier 1 (Domain/Server/FSM) | 300 | 300 | 0 | <= 400 | ⚠️ Warning (Tech Debt: Tier 1 >= 300 LOC) |
| `src/server/room_property_coordinator.ts` | Tier 1 (Domain/Server/FSM) | 192 | 192 | 0 | <= 400 | ✔️ Safe |
| `src/server/mortgage_manager.ts` | Tier 1 (Domain/Server/FSM) | 289 | 289 | 0 | <= 400 | ✔️ Safe |
| `tests/server/imp327_symmetric_fsm_insolvency_restoration.test.ts` | Living Test | 0 | 250 | +250 | <= 600 | ✔️ Safe |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/server/imp327_symmetric_fsm_insolvency_restoration.test.ts` (Tệp mới)

Test Specifications:
- TC-327.01 [UC-FSM/MSS]: Given room in InsolvencyPhase with off-turn debtor p1 during turn player bot_4 in ActionPhase, When restorePostInsolvencyPhase is executed after p1 solvency, Then room.phase restores back to ActionPhase and cleans up preInsolvencyPhase.
- TC-327.02 [UC-FSM/A1]: Given room in InsolvencyPhase with turn player p1, When restorePostInsolvencyPhase is executed after p1 solvency, Then room.phase transitions to PropertyManagement.
- TC-327.03 [UC-QUEUE/MSS]: Given room in InsolvencyPhase with multi-debtor queue [p1, p2], When p1 downgrades property to balance >= 0, Then room advances to next debtor p2 and preserves InsolvencyPhase.
- TC-327.04 [UC-QUEUE/A1]: Given room in InsolvencyPhase with multi-debtor queue [p1, p2], When p1 mortgages property to balance >= 0 via coordMortgage, Then room advances to next debtor p2 and preserves InsolvencyPhase.
- TC-327.05 [UC-CREDITOR/MSS]: Given multi-debtor queue with debtor p1 owing Alice and debtor p2 in debt to Bank, When p1 becomes solvent, Then room.pendingInsolvencyCreditorId is cleared to prevent creditor poisoning of p2.
- TC-327.06 [UC-DEADLOCK/MSS]: Given multi-debtor queue [p0, p1] where turn player p0 goes bankrupt and p1 remains, When p1 restores solvency and queue drains, Then advanceTurnAfterBankruptcy is automatically invoked to prevent deadlock.
- TC-327.07 [UC-CASCADE/MSS]: Given multi-debtor queue [p1, p2] where both debtors declare bankruptcy in succession, When cascade bankruptcy occurs, Then checks isRoomGameOver and empties queue cleanly without trapped states.
- TC-327.08 [UC-GHOST/MSS]: Given multi-debtor queue with solvent or bankrupt ghost debtors, When restorePostInsolvencyPhase executes, Then skips ghost debtors until valid debtor or deletes pendingInsolvencyQueue when empty.

### Station 2: Implementation (GREEN)

#### Task 1: Centralize and Export `restorePostInsolvencyPhase` in `insolvency_manager.ts`
**Target physical file**: `src/server/insolvency_manager.ts`
- Implement idempotency guard: verify `room.phase === TurnPhase.InsolvencyPhase` and `playerId` is active debtor or in queue.
- Drain `room.pendingInsolvencyQueue`, skipping ghost debtors (`balance >= 0 || bankrupt`).
- Clear debtor-specific `room.pendingInsolvencyCreditorId` when advancing to `nextDebtor`.
- If queue is empty:
  - If turn player `room.players[room.currentPlayerIndex]?.bankrupt === true`, delete all 4 transient fields and invoke `advanceTurnAfterBankruptcy(room)`.
  - Else, restore `room.phase` to `PropertyManagement` (if turn player) or `preInsolvencyPhase ?? PropertyManagement` (if off-turn), and delete all 4 transient fields.
- Replace old `resolvePostBankruptcyInsolvency` and `liquidateAssets:115-119` with `restorePostInsolvencyPhase`.
- In `declareBankruptcy:274`, guard `advanceTurnAfterBankruptcy` with `&& room.phase !== TurnPhase.InsolvencyPhase`.

#### Task 2: Harmonize `mortgage_manager.ts`
**Target physical file**: `src/server/mortgage_manager.ts`
- In `mortgageProperty`, replace duplicate inline queue-draining (lines 160-184) with `restorePostInsolvencyPhase(room, playerId)`.

#### Task 3: Harmonize `room_property_coordinator.ts`
**Target physical file**: `src/server/room_property_coordinator.ts`
- In `coordDowngrade`, replace custom phase reset logic with `restorePostInsolvencyPhase(ctx.room, playerId)`.
- In `coordMortgage`, remove redundant secondary queue-draining logic since `mortgageProperty` already delegates to `restorePostInsolvencyPhase`.

### Station 3: Pre-Filter & Architecture Review
- Run `npm run prefilter -- src/server/insolvency_manager.ts src/server/room_property_coordinator.ts src/server/mortgage_manager.ts tests/server/imp327_symmetric_fsm_insolvency_restoration.test.ts`.
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_327_SYMMETRIC_FSM_INSOLVENCY_RESTORATION.md`.

### Station 4: Evidence & Verification
- Execute test suite: `npx vitest run tests/server/imp327_symmetric_fsm_insolvency_restoration.test.ts`.
- Run sentinel probe verification: `npm run sentinel -- --ticket IMP-327 --test tests/server/imp327_symmetric_fsm_insolvency_restoration.test.ts --src src/server/insolvency_manager.ts`.
- Verify evidence: `node scripts/check_evidence.mjs IMP-327`.
- Synthesize delivery report: `npm run report -- IMP-327`.
