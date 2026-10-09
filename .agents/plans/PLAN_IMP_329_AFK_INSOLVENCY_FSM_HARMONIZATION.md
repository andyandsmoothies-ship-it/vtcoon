# Plan IMP-329: Harmonize AFK Insolvency Recovery with Symmetric FSM Phase Restoration

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-329`
- **Subsystem**: `server-network` (Tier 1 Server Network & AFK Protection)
- **Problem Statement**:
  1. **Asymmetric AFK Phase Exit & Multi-Debtor Starvation**: In `src/server/network/afk_recovery.ts:executeInsolvencyAfkRecovery`, whenever an insolvent player is rescued (either because balance is already >= 0, or after downgrading, or after mortgaging), the handler hardcodes `room.phase = TurnPhase.PropertyManagement;` (lines 117, 124, 141) and manually deletes only `pendingInsolvencyCreditorId` and `pendingInsolvencyDebtorId` (lines 139-140).
  2. **Bypass of Centralized restorePostInsolvencyPhase SSOT**: By directly assigning `room.phase = TurnPhase.PropertyManagement`, AFK recovery bypasses `restorePostInsolvencyPhase`:
     - If a multi-debtor queue `pendingInsolvencyQueue = ['p1', 'p2']` is active, rescuing `p1` prematurely terminates `InsolvencyPhase`, starving `p2` and leaving `p2` trapped with a negative balance.
     - Creditor poisoning occurs because `room.pendingInsolvencyCreditorId` is not reset when advancing between debtors.
     - Turn-player bankruptcy deadlock trap: If turn player `p0` goes bankrupt and off-turn debtor `p1` is rescued via AFK, setting `room.phase = PropertyManagement` freezes the game because `p0` is bankrupt and cannot end turn.
- **Architectural Solution**:
  1. **SSOT Delegation with Seeded RNG**: In `src/server/network/afk_recovery.ts`, import `restorePostInsolvencyPhase` from `../insolvency_manager.js`. Always pass `rooms.getRng()` to preserve deterministic macro-cycle and round boundary transitions (`restorePostInsolvencyPhase(room, playerId, rooms.getRng())`).
  2. **Upfront Debtor Authorization Guard**: In `executeInsolvencyAfkRecovery`, verify upfront that `playerId` is the authorized debtor (`room.pendingInsolvencyDebtorId ?? room.players[room.currentPlayerIndex]?.id`) or in `room.pendingInsolvencyQueue`. If not authorized, return `{ rescued: false, bankrupt: false }` to prevent false positive rescue reporting and watchdog stall.
  3. **Idempotency Guard on Inner Coordinators**: Because `coordDowngrade` and `coordMortgage` internally call `restorePostInsolvencyPhase` upon reaching solvency, guard rescue invocations with `if (room.phase === TurnPhase.InsolvencyPhase)` before invoking `restorePostInsolvencyPhase`.
  4. **Preserve Insolvency Check & Bankruptcy Dispatch**: Preserve initial check `room.phase !== TurnPhase.InsolvencyPhase` and keep the terminal fallback dispatching `INTENT_BANKRUPTCY` with `effectiveCreditorId` when assets cannot cover the debt.
- **Direct Scope**:
  - `src/server/network/afk_recovery.ts`
  - `tests/server/imp329_afk_insolvency_fsm_restoration.test.ts` (New)
- **Baseline Working Tree Dependencies**:
  - `src/server/insolvency_manager.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/server/network/afk_recovery.ts` | Tier 1 (Domain/Server/Logic) | 224 | 224 | 0 | <= 400 | ✔️ Safe |
| `tests/server/imp329_afk_insolvency_fsm_restoration.test.ts` | Living Test | 0 | 200 | +200 | <= 600 | ✔️ Safe |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/server/imp329_afk_insolvency_fsm_restoration.test.ts` (Tệp mới)

Test Specifications:
- TC-329.01 [UC-AFK/MSS]: Given room in InsolvencyPhase where player has balance >= 0, When executeInsolvencyAfkRecovery is invoked, Then calls restorePostInsolvencyPhase with rooms.getRng() and returns rescued: true.
- TC-329.02 [UC-AFK/A1]: Given room in InsolvencyPhase with multi-debtor queue [p1, p2], When p1 is rescued via AFK downgrades, Then advances to next debtor p2 and preserves InsolvencyPhase.
- TC-329.03 [UC-AFK/A2]: Given room in InsolvencyPhase with multi-debtor queue [p1, p2], When p1 is rescued via AFK mortgages, Then advances to next debtor p2 and preserves InsolvencyPhase.
- TC-329.04 [UC-AFK/A3]: Given multi-debtor queue [p0, p1] where turn player p0 is bankrupt and off-turn debtor p1 is rescued via AFK, When queue drains, Then advanceTurnAfterBankruptcy is invoked to prevent deadlock.
- TC-329.05 [UC-AFK/A4]: Given multi-debtor queue with debtor p1 owing Alice and debtor p2 in debt to Bank, When p1 is rescued via AFK, Then room.pendingInsolvencyCreditorId is cleared to prevent creditor poisoning of p2.
- TC-329.06 [UC-AFK/A5]: Given single debtor p1 rescued via AFK, When queue drains, Then all transient fields (pendingInsolvencyQueue, pendingInsolvencyDebtorId, pendingInsolvencyCreditorId, preInsolvencyPhase) are cleanly deleted.
- TC-329.07 [UC-AFK/A6]: Given multi-debtor queue with off-turn debtor converted to isBot: true following disconnect takeover, When AFK recovery runs for that debtor, Then resolves solvency or bankruptcy deterministically.

### Station 2: Implementation (GREEN)
#### Task 1: Delegate AFK Insolvency Exit to `restorePostInsolvencyPhase` in `afk_recovery.ts`
**Target physical file**: `src/server/network/afk_recovery.ts`
- Import `restorePostInsolvencyPhase` from `../insolvency_manager.js`.
- In `executeInsolvencyAfkRecovery`:
  - Check actor authorization upfront: `const currentDebtorId = room.pendingInsolvencyDebtorId ?? room.players[room.currentPlayerIndex]?.id; const isAuth = playerId === currentDebtorId || Boolean(room.pendingInsolvencyQueue?.includes(playerId)); if (!isAuth) return { rescued: false, bankrupt: false };`.
  - When `player.balance >= 0` initially: if `room.phase === TurnPhase.InsolvencyPhase` call `restorePostInsolvencyPhase(room, playerId, rooms.getRng()); return { rescued: true, bankrupt: false };`.
  - After `downgradeUntilSolvent`: if `player.balance >= 0`, if `room.phase === TurnPhase.InsolvencyPhase` call `restorePostInsolvencyPhase(room, playerId, rooms.getRng()); return { rescued: true, bankrupt: false };`.
  - After mortgaging loop: if `player.balance >= 0`, if `room.phase === TurnPhase.InsolvencyPhase` call `restorePostInsolvencyPhase(room, playerId, rooms.getRng()); return { rescued: true, bankrupt: false };`.
  - If still negative: dispatch `INTENT_BANKRUPTCY` with `effectiveCreditorId`.

### Station 3: Pre-Filter & Architecture Review
- Run `npm run prefilter -- src/server/network/afk_recovery.ts tests/server/imp329_afk_insolvency_fsm_restoration.test.ts`.
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_329_AFK_INSOLVENCY_FSM_HARMONIZATION.md`.

### Station 4: Evidence & Verification
- Execute test suite: `npx vitest run tests/server/imp329_afk_insolvency_fsm_restoration.test.ts`.
- Run sentinel probe verification: `npm run sentinel -- --ticket IMP-329 --test tests/server/imp329_afk_insolvency_fsm_restoration.test.ts --src src/server/network/afk_recovery.ts`.
- Verify evidence: `node scripts/check_evidence.mjs IMP-329`.
- Synthesize delivery report: `npm run report -- IMP-329`.
